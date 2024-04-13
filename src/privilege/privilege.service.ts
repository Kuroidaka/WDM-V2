import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RolesGetAPI } from './privilege.interface.ts/role.interface';
import { CreateWeddingDto } from './dto/create_role.dto';

@Injectable()
export class PrivilegeService {
  constructor(private prisma:PrismaService) {}

  cleanObjectPermission(roles:RolesGetAPI[]) {
    return roles.map(role => {
      const permissions = role.RolePermission.map(permission => {

        const {Permission, ...needData} = permission
        return {
          ...needData,
          "name": permission.Permission.name,
          "description": permission.Permission.description,
          "page": permission.Permission.page,
        }
      })
      const { RolePermission, ...rest } = role;
      role.permissions = permissions;

      const newDate = {permissions, ...rest};
      return newDate;
    })
  }
  
  async getRoles(permission:boolean) {
    try {
      const queryObject: { include?: { RolePermission: { include: { Permission: boolean } } }, } = {};

      if (permission) {
        queryObject.include = {
          RolePermission: { include: { Permission: true } }
        };
      }
      
      let roleData: RolesGetAPI[] = await this.prisma.role.findMany(queryObject);
      
      roleData = permission ? this.cleanObjectPermission(roleData) : roleData;
      return roleData
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getRoleById(id:string, permission:boolean) {
    try {
      
      const queryObject: { 
        where: { id:string },
        include?: { RolePermission: { include: { Permission: boolean } } }, 
      } = {
        where: { id },
      };

      if (permission) {
        queryObject.include = {
          RolePermission: { include: { Permission: true } }
        };
      }
      
      let roleData: RolesGetAPI = await this.prisma.role.findUnique(queryObject);

      roleData = permission ? this.cleanObjectPermission([roleData])[0] : roleData;

      return roleData;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async createRole(dataCreate:CreateWeddingDto){
    try {
      const { name, permissionList } = dataCreate;

       // check role existed from database
      const check = await this.prisma.role.findUnique({
          where: { name }
      })

      if(check) throw new ConflictException("Role name existed");
      
      const role = await this.prisma.role.create({
          data: { name },
      })

      if(permissionList && permissionList.length > 0) {
        const promiseList = []
        for (const permission of permissionList) {
            const process = this.prisma.rolePermission.create({
                data: {
                  role_id: role.id,
                  permission_id: permission.id
                }
            })

            promiseList.push(process)
        }

        await Promise.all(promiseList)
      }

      return role
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async updateRolePermission(roleID:string, permissionID:string) {
    try {
      // check role existed from database
      const roleData = await this.prisma.role.findUnique({
        where: { id: roleID, },
      })

      if(!roleData) {
        throw new BadRequestException("role is not existed");
      }

      // check roleID have permissionID
      const rolePermissionCheck = await this.prisma.rolePermission.findMany({
        where: {
          AND: [
            { role_id: roleID, },
            { permission_id: permissionID, },
          ]
        }
      });

      if(rolePermissionCheck.length > 0) {
        throw new ConflictException(`Role ID: ${roleID} already have permission: ${permissionID}`);
      }

      const RolePermission = await this.prisma.rolePermission.create({
          data: {
              role_id: roleID,
              permission_id: permissionID,
          },
      });


      return RolePermission;

    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async setUserRole(userID:string, roleID:string) {
    try {
      
      // check role existed from database
      const roleExistCheck = await this.prisma.role.findUnique({
        where: { id: roleID, },
      });

      if(!roleExistCheck) throw new NotFoundException('role is not exist');

      // check user id have the role id
      const userRoleCheck = await this.prisma.userRole.findMany({
        where: {
          AND: [
            { user_id: userID, },
            { role_id: roleID, },
          ]   
        }
      })

      if(userRoleCheck.length > 0) throw new ConflictException(`user id: ${userID} already have role: ${roleID}`);

      // check user id have any role
      const userCheck = await this.prisma.userRole.findMany({
        where: {
          user_id: userID
        }
      })
      
      let userRole
      if(userCheck.length > 0) {
        userRole = await this.prisma.userRole.updateMany({
          where: { user_id: userID, },
          data: { role_id: roleID, },
        })
      }
      else{
        userRole = await this.prisma.userRole.create({
          data: {
            user_id: userID,
            role_id: roleID
          }
        })
      }

      return userRole;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async template() {
    try {
      
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
