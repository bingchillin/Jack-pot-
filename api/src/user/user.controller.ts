import {Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus, NotFoundException} from '@nestjs/common';
import {UserService} from './user.service';
import {CreateUserDto} from './dto/create-user.dto';
import {UpdateUserDto} from './dto/update-user.dto';
import {Render, UseGuards} from '@nestjs/common';
import {JwtAuthGuard} from "../auth/jwt-auth.guard";

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    create(@Body() createUserDto: CreateUserDto) {
        try {
            return this.userService.create(createUserDto);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    @Render('users/index')
    async findAllView(): Promise<any> {
        try {
            const users = await this.userService.findAll();
            return {users};
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    findOne(@Param('id') id: string) {
        try {
            return this.userService.findOne(id);
        } catch (error) {
            throw new NotFoundException();
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get('email/:email')
    findOneByEmail(@Param('email') email: string) {
        try {
            return this.userService.findOneByEmail(email);
        } catch (error) {
            throw new NotFoundException();
        }
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        try {
            return this.userService.update(id, updateUserDto);
        } catch (error) {
            throw new NotFoundException();
        }
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    remove(@Param('id') id: string) {
        try {
            return this.userService.remove(id);
        } catch (error) {
            throw new NotFoundException();
        }
    }
}
