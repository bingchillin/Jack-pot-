import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RelationshipService } from './relationship.service';
import { RelationshipController } from './relationship.controller';
import { Relationship } from './entities/relationship.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Relationship])],
    controllers: [RelationshipController],
    providers: [RelationshipService],
    exports: [RelationshipService]
})
export class RelationshipModule {} 