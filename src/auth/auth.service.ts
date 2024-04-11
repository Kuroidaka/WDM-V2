import { User } from '@prisma/client';
import { ConflictException, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Permission } from 'src/privilege/permission_list.interface';
import { RegisterDto } from './dto-auth/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService:UsersService,
    private jwtService:JwtService
  ) {}
  
  private readonly saltRounds = 10; 

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  async comparePasswords(password: string, storedHash: string): Promise<boolean> {
    return bcrypt.compare(password, storedHash);
  }

  async validateUser(username:string, password:string):Promise<any> {
    // check exist user
    const user:User = await this.userService.findByUsername(username);

    // check password
    const checkPassword = await this.comparePasswords(password, user.password)

    if(user && checkPassword) {
      const { password, ...result } = user;
      
      return result
    }

    return null;
  }

  async login(user:Omit<User, 'password'>, permissionList:Permission[]) {
    const payload = { username: user.username, sub: user.id, permissionList };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(dataRegister:RegisterDto) {
    try {
      const { username, password, display_name } = dataRegister;
      // check exist username
      const checkUsername = await this.userService.findByUsername(username);
      if(checkUsername) throw new ConflictException('username already exists');

      // hash the password using bcrypt
      const hashedPassword = await this.hashPassword(password);

      // create new user
      const createData = {
        username,
        password: hashedPassword,
        display_name,
      }
      const newUser = this.userService.createUser(createData);

      return newUser
    } catch (error) {
      console.log(error)
      throw error
    }
  }


}
