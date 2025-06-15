import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactsService } from './contact.service';
import { ContactController } from './contact.controller';
import { Contact } from './entities/contact.entity';
import { Person } from '../person/entities/person.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Contact, Person])],
    controllers: [ContactController],
    providers: [ContactsService],
    exports: [ContactsService]
})
export class ContactModule {} 