/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserRole } from 'src/common/enums/user-roles.enum';

type CreateUserInput = {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
};

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(input: CreateUserInput): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: { email: input.email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException('Email is already in use');
    }

    const user = this.usersRepository.create({
      ...input,
      email: input.email.toLowerCase(),
      role: input.role ?? UserRole.MEMBER,
    });

    return this.usersRepository.save(user);
  }

  async findAll() {
    const users = await this.usersRepository.find({
      order: { createdAt: 'DESC' },
    });

    return {
      success: true,
      message: 'Users fetched successfully',
      data: users.map((user) => this.sanitizeUser(user)),
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email: email.toLowerCase() })
      .getOne();
  }

  async findById(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateRole(userId: number, role: UserRole, currentUserId: number) {
    const user = await this.findById(userId);

    if (user.id === currentUserId) {
      throw new BadRequestException(
        'You cannot change your own role from this endpoint',
      );
    }

    user.role = role;
    const updatedUser = await this.usersRepository.save(user);

    return {
      success: true,
      message: 'User role updated successfully',
      data: this.sanitizeUser(updatedUser),
    };
  }

  sanitizeUser(user: User) {
    const { password, ...safeUser } = user as User & { password?: string };
    return safeUser;
  }
}
