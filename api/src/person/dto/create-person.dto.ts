import { IsEmail, IsString, IsOptional, MinLength } from 'class-validator';

export class CreatePersonDto {
    @IsEmail()
    mail: string;

    @IsString()
    firstname: string;

    @IsString()
    surname: string;

    @IsString()
    @MinLength(6)
    password: string;

    @IsString()
    @IsOptional()
    numberPhone?: string;

    @IsOptional()
    idRole?: number;
} 