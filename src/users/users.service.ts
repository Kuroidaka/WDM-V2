import { PrivilegeService } from 'src/privilege/privilege.service';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { Permission, PermissionData } from 'src/privilege/privilege.interface.ts/permission_list.interface';
import { CreateUserDto } from './dto/create_user.dto';
import { UpdateUserDto } from './dto/update_user.dto';


@Injectable()
export class UsersService {
  constructor(
    private prisma:PrismaService,
    private privilegeService:PrivilegeService,
  ) {}

  async getUsers(): Promise<Array<Omit<User, 'UserRole'> & { PermissionList: Permission[] }>> {
    const usersData = await this.prisma.user.findMany({
      include: {
        Role: {
          select: {
            name: true,
            RolePermission: {
              select: {
                Permission: {
                  select: {
                    id: true,
                    name: true,
                    description: true,
                    page: true,
                    created_at: true,
                    updated_at: true,
                  },
                },
              },
            },
          },
        },

      },
    });

    return usersData.map(user => {
      const tempData: Permission[] = user.Role?.RolePermission.map(rp => rp.Permission) || [];
      const { Role, ...userData } = user;
      return {
        ...userData,
        PermissionList: tempData,
        role: Role.name,
      };
    });
  }

  async findByUsername(username:string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { username },
        include: {
          Role: true
        }
      })

      // console.log("user", user)
  
      return user
    } catch (error) {
      throw error
    }
  }

  async findByID(id:string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id }
      })
  
      return user
    } catch (error) {
      throw error
    }
  }

  async getUserPermission(id:string) {

    try {
      const userPermissions:PermissionData = await this.prisma.user.findUnique({
        where: {
          id,
        },
        select: {
          Role: {
            select: {
              RolePermission: {
                select: {
                  Permission: {
                    select: {
                      id: true,
                      name: true,
                      description: true,
                      page: true,
                      created_at: true,
                      updated_at: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
  
      const permissionList:Permission[] = userPermissions?.Role?.RolePermission?.map(permission => permission.Permission) || []
  
      return permissionList
    } catch (error) {
      throw error
    }
  }

  async createUser(dataCreate:CreateUserDto) {
    try {
      
      const { username, password, display_name } = dataCreate;
  
      const newUser = await this.prisma.user.create({
        data: {
          username,
          password,
          display_name,
        } as any
      })
  
      return newUser
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async updateUser(id:string, display_name:string) {
    try {      
      // check exist user
      const checkUser = await this.findByID(id);
      if(!checkUser) throw new NotFoundException('User not found');

      // update User
      const user = await this.prisma.user.update({
        where: { id },
        data: { display_name }
      })

      return user
  
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async deleteUser(id:string) {
    try {
      await this.prisma.user.delete({
        where: { id }
      })
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
