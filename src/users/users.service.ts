import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { Permission, PermissionData } from 'src/privilege/interfaces/permission_list.interface';
import { CreateUserDto } from './dto/create_user.dto';


@Injectable()
export class UsersService {
  constructor(private prisma:PrismaService) {}

  async getUsers(): Promise<Array<Omit<User, 'UserRole'> & { PermissionList: Permission[] }>> {
    const usersData = await this.prisma.user.findMany({
      include: {
        UserRole: {
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
        },
      },
    });

    return usersData.map(user => {
      const tempData: Permission[] = user.UserRole[0]?.Role?.RolePermission.map(rp => rp.Permission) || [];
      const { UserRole, ...userData } = user;
      return {
        ...userData,
        PermissionList: tempData
      };
    });
  }

  async findByUsername(username:string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { username }
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
          UserRole: {
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
          },
        },
      });
  
      const permissionList:Permission[] = userPermissions?.UserRole[0]?.Role?.RolePermission?.map(permission => permission.Permission) || []
  
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

}