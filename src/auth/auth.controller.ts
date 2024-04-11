import { AuthService } from './auth.service';
import { Controller, Get, Post, Param, Body, Patch, Delete, Query, UseGuards, Request, BadRequestException, ConflictException } from '@nestjs/common';
import { LocalAuthGuard } from './local-auth.guard';
import { UsersService } from 'src/users/users.service';
import { Permission } from 'src/privilege/interfaces/permission_list.interface';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RegisterDto } from './dto/register.dto';




@Controller('auth')
export class AuthController {
  constructor( 
    private authService:AuthService,
    private userService:UsersService
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    const userID = req.user.id;
    const permissionList:Permission[] = await this.userService.getUserPermission(userID);

    return this.authService.login(req.user, permissionList)
  }

  @UseGuards(JwtAuthGuard)
  @Post('register')
  async register(@Body() body:RegisterDto) {
    return this.authService.register(body);
  }
}
