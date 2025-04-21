import { PartialType } from '@nestjs/mapped-types';
import { CreatePersonDto } from './create-person.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePersonDto extends PartialType(CreatePersonDto) {
    @ApiProperty({ example: 'newpassword123', description: 'New password (min 6 characters)', required: false })
    password?: string;
} 