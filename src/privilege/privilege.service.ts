import { User } from '@prisma/client';
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

      const newDate = {...rest, permissions};
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

  async getRoleNameByUserId(userId:string) {
    try {
      const role = await this.prisma.user.findFirst({
        where: { id: userId },
        include: {
          Role: true
        }
      })
      const result = {
        id: role.Role.id,
        name: role.Role.name,
      }
      return result

    } catch (error) {
      console.log(error)
      throw error
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

  async removeRolePermission(roleID:string, permissionID:string) {
    try {
      // check role existed from database
      const roleData = await this.prisma.role.findUnique({
        where: { id: roleID, },
      })
      if(!roleData) throw new BadRequestException("role is not existed");

      // check roleID have permissionID
      const rolePermissionCheck = await this.prisma.rolePermission.findMany({
        where: {
          AND: [
            { role_id: roleID, },
            { permission_id: permissionID, },
          ]
        }
      });

      if(rolePermissionCheck.length == 0) {
        throw new ConflictException(`Role ID: ${roleID} Do not have permission: ${permissionID}`);
      }

      await this.prisma.rolePermission.delete({
          where: {
            role_id_permission_id: {
              role_id: roleID,
              permission_id: permissionID,
            },
          } as any,
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async deleteRole(roleId:string) {
    try {

      const staffRoleId = '64007797-029d-4339-b78b-d51e2d2f3e1a';

      const transaction = await this.prisma.$transaction([
        this.prisma.user.updateMany({
          where: { role_id: roleId },
          data: { role_id: staffRoleId },
        }),
        this.prisma.rolePermission.deleteMany({
          where: { role_id: roleId },
        }),
        this.prisma.role.delete({
          where: { id: roleId },
        })
      ]);
    
      return transaction;

    } catch(error) {
      console.log(error)
      throw error
    }
  } 

  async updateRolePermissionByPage(roleID:string, page:string) {
    try {
      // check role existed from database
      const roleData = await this.prisma.role.findUnique({
        where: { id: roleID, },
      })

      if(!roleData) {
        throw new BadRequestException("role is not existed");
      }

      // find permission by page
      const findPermission = await this.prisma.permission.findUnique({
        where: { page: page, } as any,
      })

      if(!findPermission) {
        throw new NotFoundException('Page not found')
      }

      // check roleID have permissionID
      const rolePermissionCheck = await this.prisma.rolePermission.findMany({
        where: {
          AND: [
            { role_id: roleID, },
            { permission_id: findPermission.id, },
          ]
        }
      });

      if(rolePermissionCheck.length > 0) {
        throw new ConflictException(`Role ID: ${roleID} already have permission: ${findPermission.id}`);
      }

      const RolePermission = await this.prisma.rolePermission.create({
          data: {
              role_id: roleID,
              permission_id: findPermission.id,
          },
      });


      return RolePermission;

    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async removeRolePermissionByPage(roleID:string, page:string) {
    try {
      // check role existed from database
      const roleData = await this.prisma.role.findUnique({
        where: { id: roleID, },
      })
      if(!roleData) throw new BadRequestException("role is not existed");


      // find permision by page 
      const findPermission = await this.prisma.permission.findUnique({
        where: { page: page, } as any,
      })

      if(!findPermission) {
        throw new NotFoundException('Page not found')
      }

      const permissionID = findPermission.id;
      // check roleID have permissionID
      const rolePermissionCheck = await this.prisma.rolePermission.findMany({
        where: {
          AND: [
            { role_id: roleID, },
            { permission_id: permissionID, },
          ]
        }
      });

      if(rolePermissionCheck.length == 0) {
        throw new ConflictException(`Role ID: ${roleID} Do not have permission: ${permissionID}`);
      }

      await this.prisma.rolePermission.delete({
          where: {
            role_id_permission_id: {
              role_id: roleID,
              permission_id: permissionID,
            },
          } as any,
      });
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

      const findUser = await this.prisma.user.findUnique({
        where: { id: userID, },
      })

      if(!findUser) throw new NotFoundException(`User not found for id: ${userID}`)
        
      // update user role

      const newUser = await this.prisma.user.update({
        where: {
          id: userID
        },
        data: {
          role_id: roleID
        }
      })

      return newUser;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async userHasPermission(userId:string, page:string):Promise<boolean> {
    try {
      const roles = await this.prisma.user.findMany({
        where: { id: userId },
        include: { Role: {
          include: { RolePermission: {
            include: { Permission: true }
          }}
        }}
      });
      if(!roles[0].Role)
        return false
      return roles.some(role => 
        role.Role.RolePermission.some(rp => 
          rp.Permission.page === page
        )
      );
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
