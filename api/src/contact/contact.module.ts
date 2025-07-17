import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactsService } from './contact.service';
import { ContactController } from './contact.controller';
import { Contact } from './entities/contact.entity';
import { Person } from '../person/entities/person.entity';
import { NotificationModule } from '../notification/notification.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Contact, Person]),
        forwardRef(() => NotificationModule),
    ],
    controllers: [ContactController],
    providers: [ContactsService],
    exports: [ContactsService]
})
export class ContactModule {} 