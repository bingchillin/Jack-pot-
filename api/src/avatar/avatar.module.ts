import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AvatarService } from './avatar.service';
import { AvatarController } from './avatar.controller';
import { Avatar } from './entities/avatar.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Avatar])],
  controllers: [AvatarController],
  providers: [AvatarService],
  exports: [AvatarService],
})
export class AvatarModule {} 