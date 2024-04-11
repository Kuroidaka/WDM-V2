import { Controller, Get, Post, Param, Body, Patch, Delete, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '@prisma/client';

@Controller('users')
export class UsersController {
  constructor(private userService:UsersService) {}

  @Get()
  async getUsers(){
    return this.userService.getUsers();
  }

  @Get("find")
  async findByUsername(@Query('username') username:string):Promise<User | undefined> {
    return this.userService.findByUsername(username)
  }
}