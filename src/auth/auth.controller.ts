import { AuthService } from './auth.service';
import { Controller, Get, Post, Param, Body, Patch, Query, UseGuards, Request } from '@nestjs/common';
import { LocalAuthGuard } from './local-auth.guard';
import { UsersService } from 'src/users/users.service';
import { Permission } from 'src/privilege/privilege.interface.ts/permission_list.interface';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RegisterDto } from './dto/register.dto';
import { PrivilegeService } from 'src/privilege/privilege.service';

@Controller('auth')
export class AuthController {
  constructor( 
    private authService:AuthService,
    private userService:UsersService,
    private privilegeService:PrivilegeService,
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

  @Patch('/change-password')
  async changePassword (@Body() body:{username:string, password:string, oldPassword:string}) {
    const { username, password, oldPassword } = body;

    return this.authService.changePassword(username, password, oldPassword);
  }

  @Get('check-permission/:userId')
  async CheckUserPermission(@Param('userId') userId:string, @Query('page') page:string) {
    return this.privilegeService.userHasPermission(userId, page);
  }

  @UseGuards(JwtAuthGuard)
  @Get('verify-token')
  async verifyToken(@Request() req) {
    return req.user
  }
}
