import { CreateWeddingDto } from './dto/create_role.dto';
import { PrivilegeService } from './privilege.service';
import { Controller, Get, Param, Post, Query, Body } from '@nestjs/common';

@Controller('privilege')
export class PrivilegeController {
  constructor(private privilegeService:PrivilegeService) {}

  @Get('role/:id')
  async getRoleById(
    @Param('id') id:string,
    @Query('permission') permission:string
  ) {
    const isPermissionIncluded = permission === 'true'
    return this.privilegeService.getRoleById(id, isPermissionIncluded);
  }


  @Get('roles')
  async getRoles(@Query('permission') permission:string) {
    const isPermissionIncluded = permission === 'true'
    return this.privilegeService.getRoles(isPermissionIncluded);
  }

  @Post('role')
  async createRole(@Body() body:CreateWeddingDto) {
    return this.privilegeService.createRole(body);
  }

  @Post('role/update')
  async updateRolePermission(
    @Body('roleID') roleID:string,
    @Body('permissionID') permissionID:string,
  ) {
    return this.privilegeService.updateRolePermission(roleID, permissionID);
  }

  @Post('role/user/update')
  async setUserRole(
    @Body('roleID') roleID:string,
    @Body('userID') userID:string,
  ) {
    return this.privilegeService.setUserRole(userID, roleID);
  }



}
