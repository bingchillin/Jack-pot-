import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact, ContactStatus } from './entities/contact.entity';
import { CreateContactDto } from './dto/create-contact.dto';
import { Person } from '../person/entities/person.entity';

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(Contact)
    private contactRepository: Repository<Contact>,
    @InjectRepository(Person)
    private personRepository: Repository<Person>,
  ) {}

  async sendContactRequest(requesterId: number, createContactDto: CreateContactDto): Promise<Contact> {
    const { receiverId } = createContactDto;

    // Check if receiver exists
    const receiver = await this.personRepository.findOne({ where: { idPerson: receiverId } });
    if (!receiver) {
      throw new NotFoundException('User not found');
    }

    // Can't send request to yourself
    if (requesterId === receiverId) {
      throw new BadRequestException('Cannot send contact request to yourself');
    }

    // Check if any relationship already exists
    const existingContact = await this.contactRepository.findOne({
      where: [
        { requesterId, receiverId },
        { requesterId: receiverId, receiverId: requesterId }
      ]
    });

    if (existingContact) {
      if (existingContact.status === ContactStatus.BLOCKED) {
        throw new ForbiddenException('Cannot send request - user is blocked');
      }
      if (existingContact.status === ContactStatus.PENDING) {
        throw new BadRequestException('Contact request already exists');
      }
      if (existingContact.status === ContactStatus.ACCEPTED) {
        throw new BadRequestException('Users are already contacts');
      }
      if (existingContact.status === ContactStatus.REJECTED) {
        // Allow resending after rejection
        existingContact.status = ContactStatus.PENDING;
        existingContact.requesterId = requesterId;
        existingContact.receiverId = receiverId;
        return await this.contactRepository.save(existingContact);
      }
    }

    const contact = new Contact();
    contact.requesterId = requesterId;
    contact.receiverId = receiverId;
    contact.status = ContactStatus.PENDING;

    return await this.contactRepository.save(contact);
  }

  async respondToContactRequest(userId: number, contactId: number, status: ContactStatus): Promise<Contact> {
    const contact = await this.contactRepository.findOne({
      where: { id: contactId },
      relations: ['requester', 'receiver']
    });

    if (!contact) {
      throw new NotFoundException('Contact request not found');
    }

    // Only the receiver can respond to the request
    if (contact.receiverId !== userId) {
      throw new ForbiddenException('You can only respond to requests sent to you');
    }

    // Can only respond to pending requests
    if (contact.status !== ContactStatus.PENDING) {
      throw new BadRequestException('Can only respond to pending requests');
    }

    contact.status = status;
    
    if (status === ContactStatus.BLOCKED) {
      contact.blockedBy = userId;
    }

    return await this.contactRepository.save(contact);
  }

  async blockContact(userId: number, contactId: number): Promise<Contact> {
    const contact = await this.contactRepository.findOne({
      where: { id: contactId },
      relations: ['requester', 'receiver']
    });

    if (!contact) {
      throw new NotFoundException('Contact not found');
    }

    // Only involved users can block
    if (contact.requesterId !== userId && contact.receiverId !== userId) {
      throw new ForbiddenException('You can only block your own contacts');
    }

    contact.status = ContactStatus.BLOCKED;
    contact.blockedBy = userId;

    return await this.contactRepository.save(contact);
  }

  async removeContact(userId: number, contactId: number): Promise<void> {
    const contact = await this.contactRepository.findOne({
      where: { id: contactId }
    });

    if (!contact) {
      throw new NotFoundException('Contact not found');
    }

    // Only involved users can remove
    if (contact.requesterId !== userId && contact.receiverId !== userId) {
      throw new ForbiddenException('You can only remove your own contacts');
    }

    await this.contactRepository.delete(contactId);
  }

  async getMyContacts(userId: number): Promise<Contact[]> {
    return await this.contactRepository.find({
      where: [
        { requesterId: userId, status: ContactStatus.ACCEPTED },
        { receiverId: userId, status: ContactStatus.ACCEPTED }
      ],
      relations: ['requester', 'receiver'],
      order: { updatedAt: 'DESC' }
    });
  }

  async getPendingRequests(userId: number): Promise<Contact[]> {
    return await this.contactRepository.find({
      where: { receiverId: userId, status: ContactStatus.PENDING },
      relations: ['requester', 'receiver'],
      order: { createdAt: 'DESC' }
    });
  }

  async getSentRequests(userId: number): Promise<Contact[]> {
    return await this.contactRepository.find({
      where: { requesterId: userId, status: ContactStatus.PENDING },
      relations: ['requester', 'receiver'],
      order: { createdAt: 'DESC' }
    });
  }

  async getBlockedContacts(userId: number): Promise<Contact[]> {
    return await this.contactRepository.find({
      where: [
        { requesterId: userId, status: ContactStatus.BLOCKED },
        { receiverId: userId, status: ContactStatus.BLOCKED }
      ],
      relations: ['requester', 'receiver'],
      order: { updatedAt: 'DESC' }
    });
  }

  async unblockContact(userId: number, contactId: number): Promise<void> {
    const contact = await this.contactRepository.findOne({
      where: { id: contactId }
    });

    if (!contact) {
      throw new NotFoundException('Contact not found');
    }

    if (contact.status !== ContactStatus.BLOCKED) {
      throw new BadRequestException('Contact is not blocked');
    }

    // Only the user who blocked can unblock
    if (contact.blockedBy !== userId) {
      throw new ForbiddenException('You can only unblock contacts you blocked');
    }

    await this.contactRepository.delete(contactId);
  }

  async searchUsers(userId: number, query: string): Promise<Person[]> {
    // Get blocked user IDs to exclude from search
    const blockedContacts = await this.contactRepository.find({
      where: [
        { requesterId: userId, status: ContactStatus.BLOCKED },
        { receiverId: userId, status: ContactStatus.BLOCKED }
      ]
    });

    const blockedUserIds = blockedContacts.flatMap(contact => 
      contact.requesterId === userId ? [contact.receiverId] : [contact.requesterId]
    );
    blockedUserIds.push(userId); // Exclude self

    const queryBuilder = this.personRepository.createQueryBuilder('person')
      .where('(person.username ILIKE :query OR person.email ILIKE :query)', { query: `%${query}%` });

    if (blockedUserIds.length > 0) {
      queryBuilder.andWhere('person.idPerson NOT IN (:...blockedIds)', { blockedIds: blockedUserIds });
    }

    return await queryBuilder
      .select(['person.idPerson', 'person.username', 'person.email'])
      .limit(20)
      .getMany();
  }
}