import { IsString, IsOptional, MaxLength, IsNumber, IsBoolean, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNotificationDto {
    @ApiProperty({ description: 'The title of the notification', maxLength: 250, required: false })
    @IsString()
    @IsOptional()
    @MaxLength(250)
    title?: string;

    @ApiProperty({ description: 'The description of the notification', maxLength: 1000, required: false })
    @IsString()
    @IsOptional()
    @MaxLength(1000)
    description?: string;

    @ApiProperty({ description: 'Advice for the notification', maxLength: 5000, required: false })
    @IsString()
    @IsOptional()
    @MaxLength(5000)
    advise?: string;

    @ApiProperty({ description: 'The ID of the associated person', required: false })
    @IsNumber()
    @IsOptional()
    idPerson?: number;

    @ApiProperty({ description: 'The ID of the associated object', required: false })
    @IsNumber()
    @IsOptional()
    idObject?: number;

    @ApiProperty({ description: 'Whether the notification has been read', required: false, default: false })
    @IsBoolean()
    @IsOptional()
    isRead?: boolean;

    @ApiProperty({ 
        description: 'The type of notification', 
        enum: ['plant_care', 'comment_like', 'comment_mention', 'comment_reply'],
        default: 'plant_care',
        required: false 
    })
    @IsString()
    @IsOptional()
    @IsIn(['plant_care', 'comment_like', 'comment_mention', 'comment_reply'])
    notificationType?: string;

    @ApiProperty({ description: 'The ID of the associated comment for social notifications', required: false })
    @IsNumber()
    @IsOptional()
    idComment?: number;

    @ApiProperty({ description: 'The ID of the person who triggered this notification', required: false })
    @IsNumber()
    @IsOptional()
    idTriggeringPerson?: number;
} 