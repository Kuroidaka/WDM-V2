import { Controller, Get, Post, Param, Body, Patch, Delete, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '@prisma/client';
// import { PageAccess } from 'src/auth/page_access.decorator';
// import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
// import { PageGuard } from 'src/auth/page.guard';


@Controller('users')
export class UsersController {
  constructor(private userService:UsersService) {}

  @Get()
  async getUsers(){
    return this.userService.getUsers();
  }

  @Get('find')
  async findByUsername(@Query('username') username:string):Promise<User | undefined> {
    return this.userService.findByUsername(username)
  }

  @Patch('/:id/update')
  async updateUser(
    @Param('id') id:string,
    @Body('display_name') display_name:string
  ) {
    return this.userService.updateUser(id, display_name);
  }

}
