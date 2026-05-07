import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(signupDto: SignupDto) {
    const hashedPassword = await bcrypt.hash(signupDto.password, 10);

    const user = await this.usersService.create({
      name: signupDto.name,
      email: signupDto.email,
      password: hashedPassword,
    });

    const accessToken = await this.generateToken(
      user.id,
      user.email,
      user.role,
    );

    return {
      success: true,
      message: 'Signup successful',
      data: {
        user: this.usersService.sanitizeUser(user),
        accessToken,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const accessToken = await this.generateToken(
      user.id,
      user.email,
      user.role,
    );

    return {
      success: true,
      message: 'Login successful',
      data: {
        user: this.usersService.sanitizeUser(user),
        accessToken,
      },
    };
  }

  async getProfile(userId: number) {
    const user = await this.usersService.findById(userId);

    return {
      success: true,
      message: 'Profile fetched successfully',
      data: this.usersService.sanitizeUser(user),
    };
  }

  private async generateToken(id: number, email: string, role: string) {
    return this.jwtService.signAsync({
      sub: id,
      email,
      role,
    });
  }
}
