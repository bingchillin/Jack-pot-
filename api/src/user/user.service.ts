import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const existingUser = await this.userRepository.findOne({ where: { email: createUserDto.email } });

      if (existingUser) {
        return 'User already exists';
      }

      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      const newUser = this.userRepository.create({
        ...createUserDto,
        password: hashedPassword
      });

      return this.userRepository.save(newUser);
    } catch (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  async findAll() {
    try {
      return await this.userRepository.find();
    } catch (error) {
      throw new Error(`Failed to find all users: ${error.message}`);
    }
  }

  async findOne(id: string): Promise<User | undefined> {
    try {
      return await this.userRepository.findOne({ where: { _id: id } });
    } catch (error) {
      throw new Error(`Failed to find user by id: ${error.message}`);
    }
  }

  async findOneByEmail(email: string): Promise<User | undefined> {
    try {
      return await this.userRepository.findOne({ where: { email } });
    } catch (error) {
      throw new Error(`Failed to find user by email: ${error.message}`);
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      const existingUser = await this.userRepository.findOne({ where: { _id: id } });
      if (!existingUser) {
        throw new Error('User not found');
      }

      let hashedPassword = existingUser.password;

      if (updateUserDto.password && !(bcrypt.compare(updateUserDto.password, existingUser.password))) {
        hashedPassword = await bcrypt.hash(updateUserDto.password, 10);
      }

      const res = await this.userRepository.update(id, { ...updateUserDto, password: hashedPassword });

      return res;
    } catch (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }

  async remove(id: string) {
    try {
      const result = await this.userRepository.delete(id);

      if (result.affected === 0) {
        throw new Error('User not found');
      }

      return `User with id ${id} has been deleted`;
    } catch (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }
}