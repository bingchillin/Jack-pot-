import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
    @ApiProperty({
        example: 'john.doe@example.com',
        description: 'User email address'
    })
    @IsEmail()
    mail: string;

    @ApiProperty({
        example: 'securePassword123',
        description: 'User password'
    })
    @IsString()
    @MinLength(6)
    password: string;
} 