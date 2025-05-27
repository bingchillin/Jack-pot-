import { ApiProperty } from '@nestjs/swagger';

export class CreatePersonResponseDto {
    @ApiProperty({ example: 1 })
    idPerson: number;

    @ApiProperty({ example: 'john.doe@example.com' })
    email: string;

    @ApiProperty({ example: 'John' })
    firstname: string;

    @ApiProperty({ example: 'Doe' })
    surname: string;

    @ApiProperty({ example: '1234567890' })
    numberPhone: string;

    @ApiProperty({ example: 1 })
    idRole: number;

    @ApiProperty({ example: false })
    isEmailVerified: boolean;
} 