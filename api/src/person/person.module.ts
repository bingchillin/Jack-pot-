import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonService } from './person.service';
import { PersonController } from './person.controller';
import { Person } from './entities/person.entity';
import { RoleModule } from '../role/role.module';
import { ObjectProfileModule } from '../object-profile/object-profile.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Person]),
        RoleModule,
        ObjectProfileModule
    ],
    controllers: [PersonController],
    providers: [PersonService],
    exports: [PersonService]
})
export class PersonModule {} 