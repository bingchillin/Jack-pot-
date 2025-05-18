import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from './entities/contact.entity';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

@Injectable()
export class ContactService {
    constructor(
        @InjectRepository(Contact)
        private contactRepository: Repository<Contact>,
    ) {}

    async create(createContactDto: CreateContactDto): Promise<Contact> {
        const contact = this.contactRepository.create({
            ...createContactDto,
            person: { idPerson: createContactDto.idPerson },
            relationship: { idRelationship: createContactDto.idRelationship }
        });
        return await this.contactRepository.save(contact);
    }

    async findAll(): Promise<Contact[]> {
        return await this.contactRepository.find({
            relations: ['person', 'relationship']
        });
    }

    async findOne(id: number): Promise<Contact> {
        const contact = await this.contactRepository.findOne({
            where: { idContact: id },
            relations: ['person', 'relationship']
        });
        if (!contact) {
            throw new NotFoundException(`Contact with ID ${id} not found`);
        }
        return contact;
    }

    async findByPerson(idPerson: number): Promise<Contact[]> {
        return await this.contactRepository.find({
            where: { person: { idPerson } },
            relations: ['person', 'relationship']
        });
    }

    async findByRelationship(idRelationship: number): Promise<Contact[]> {
        return await this.contactRepository.find({
            where: { relationship: { idRelationship } },
            relations: ['person', 'relationship']
        });
    }

    async update(id: number, updateContactDto: UpdateContactDto): Promise<Contact> {
        const contact = await this.findOne(id);
        const updateData: any = { ...updateContactDto };
        
        if (updateContactDto.idPerson) {
            updateData.person = { idPerson: updateContactDto.idPerson };
        }
        if (updateContactDto.idRelationship) {
            updateData.relationship = { idRelationship: updateContactDto.idRelationship };
        }

        Object.assign(contact, updateData);
        return await this.contactRepository.save(contact);
    }

    async remove(id: number): Promise<void> {
        const contact = await this.findOne(id);
        await this.contactRepository.remove(contact);
    }
} 