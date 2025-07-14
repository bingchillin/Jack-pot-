import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact, ContactStatus } from './entities/contact.entity';
import { CreateContactDto } from './dto/create-contact.dto';
import { Person } from '../person/entities/person.entity';
import { ContactResponseDto } from './dto/contact-response.dto';
import { ContactQueryDto, ContactStatsDto } from './dto/contact-query.dto';

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(Contact)
    private contactRepository: Repository<Contact>,
    @InjectRepository(Person)
    private personRepository: Repository<Person>,
  ) {}

  private transformContactToResponse(contact: Contact): ContactResponseDto {
    const response = {
      id: contact.id,
      requesterId: contact.requesterId,
      receiverId: contact.receiverId,
      status: contact.status,
      blockedBy: contact.blockedBy,
      createdAt: contact.createdAt,
      updatedAt: contact.updatedAt,
      requester: contact.requester ? {
        id: contact.requester.idPerson,
        email: contact.requester.email,
        firstname: contact.requester.firstname,
        surname: contact.requester.surname
      } : null,
      receiver: contact.receiver ? {
        id: contact.receiver.idPerson,
        email: contact.receiver.email,
        firstname: contact.receiver.firstname,
        surname: contact.receiver.surname
      } : null
    };
    
    return response;
  }

  async sendContactRequest(requesterId: number, createContactDto: CreateContactDto): Promise<ContactResponseDto> {
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
      ],
      relations: ['requester', 'receiver']
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
        const savedContact = await this.contactRepository.save(existingContact);
        return this.transformContactToResponse(savedContact);
      }
    }

    const contact = new Contact();
    contact.requesterId = requesterId;
    contact.receiverId = receiverId;
    contact.status = ContactStatus.PENDING;

    const savedContact = await this.contactRepository.save(contact);
    const contactWithRelations = await this.contactRepository.findOne({
      where: { id: savedContact.id },
      relations: ['requester', 'receiver']
    });
    return this.transformContactToResponse(contactWithRelations);
  }

  async respondToContactRequest(userId: number, contactId: number, status: ContactStatus): Promise<ContactResponseDto> {
    const contact = await this.contactRepository.findOne({
      where: { id: contactId },
      relations: ['requester', 'receiver']
    });

    if (!contact) {
      throw new NotFoundException('Contact request not found');
    }

    // Get the user to check if they are an admin
    const user = await this.personRepository.findOne({
      where: { idPerson: userId }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Allow admins (idRole === 1) to respond to any request
    if (user.idRole !== 1 && contact.receiverId !== userId) {
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

    const savedContact = await this.contactRepository.save(contact);
    return this.transformContactToResponse(savedContact);
  }

  async blockContact(userId: number, contactId: number): Promise<ContactResponseDto> {
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

    const savedContact = await this.contactRepository.save(contact);
    return this.transformContactToResponse(savedContact);
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

  async getMyContacts(userId: number): Promise<ContactResponseDto[]> {
    const contacts = await this.contactRepository.find({
      where: [
        { requesterId: userId, status: ContactStatus.ACCEPTED },
        { receiverId: userId, status: ContactStatus.ACCEPTED }
      ],
      relations: ['requester', 'receiver'],
      order: { updatedAt: 'DESC' }
    });

    return contacts.map(contact => this.transformContactToResponse(contact));
  }

  async getPendingRequests(userId: number): Promise<ContactResponseDto[]> {
    const contacts = await this.contactRepository.find({
      where: { receiverId: userId, status: ContactStatus.PENDING },
      relations: ['requester', 'receiver'],
      order: { createdAt: 'DESC' }
    });

    return contacts.map(contact => this.transformContactToResponse(contact));
  }

  async getSentRequests(userId: number): Promise<ContactResponseDto[]> {
    const contacts = await this.contactRepository.find({
      where: { requesterId: userId, status: ContactStatus.PENDING },
      relations: ['requester', 'receiver'],
      order: { createdAt: 'DESC' }
    });

    return contacts.map(contact => this.transformContactToResponse(contact));
  }

  async getBlockedContacts(userId: number): Promise<ContactResponseDto[]> {
    console.log(`[BLOCKED] API - Getting blocked contacts for user ${userId}`);
    
    const contacts = await this.contactRepository.find({
      where: [
        { requesterId: userId, status: ContactStatus.BLOCKED },
        { receiverId: userId, status: ContactStatus.BLOCKED }
      ],
      relations: ['requester', 'receiver'],
      order: { updatedAt: 'DESC' }
    });

    console.log(`[BLOCKED] API - Found ${contacts.length} blocked contacts in database:`);
    contacts.forEach(contact => {
      console.log(`[BLOCKED] API - Raw contact: id=${contact.id}, requester=${contact.requesterId}, receiver=${contact.receiverId}, status=${contact.status}, blockedBy=${contact.blockedBy}`);
    });

    const response = contacts.map(contact => this.transformContactToResponse(contact));
    
    console.log(`[BLOCKED] API - Transformed response:`);
    response.forEach(contact => {
      console.log(`[BLOCKED] API - Response contact: id=${contact.id}, requester=${contact.requesterId}, receiver=${contact.receiverId}, status=${contact.status}, blockedBy=${contact.blockedBy}`);
    });

    return response;
  }

  async unblockContact(userId: number, contactId: number): Promise<ContactResponseDto> {
    console.log(`[UNBLOCK] API - Starting unblock process: contactId=${contactId}, userId=${userId}`);
    
    const contact = await this.contactRepository.findOne({
      where: { id: contactId },
      relations: ['requester', 'receiver']
    });

    if (!contact) {
      console.log(`[UNBLOCK] ERROR - Contact ${contactId} not found in database`);
      throw new NotFoundException('Contact not found');
    }

    console.log(`[UNBLOCK] Found contact: id=${contact.id}, status=${contact.status}, blockedBy=${contact.blockedBy}, requester=${contact.requesterId}, receiver=${contact.receiverId}`);

    if (contact.status !== ContactStatus.BLOCKED) {
      console.log(`[UNBLOCK] ERROR - Contact ${contactId} is not blocked (current status: ${contact.status})`);
      throw new BadRequestException('Contact is not blocked');
    }

    // Get the user to check if they are an admin
    const user = await this.personRepository.findOne({
      where: { idPerson: userId }
    });

    if (!user) {
      console.log(`[UNBLOCK] ERROR - User ${userId} not found in database`);
      throw new NotFoundException('User not found');
    }

    console.log(`[UNBLOCK] User details: id=${userId}, role=${user.idRole}, contact blockedBy=${contact.blockedBy}`);

    // Allow admins (idRole === 1) to unblock any contact
    if (user.idRole !== 1 && contact.blockedBy !== userId) {
      console.log(`[UNBLOCK] ERROR - Permission denied: User ${userId} (role=${user.idRole}) cannot unblock contact ${contactId} (blocked by ${contact.blockedBy})`);
      throw new ForbiddenException('You can only unblock contacts you blocked');
    }

    console.log(`[UNBLOCK] Permission granted - proceeding with unblock`);
    contact.status = ContactStatus.ACCEPTED;
    contact.blockedBy = null;

    const savedContact = await this.contactRepository.save(contact);
    console.log(`[UNBLOCK] SUCCESS - Contact ${contactId} unblocked successfully, new status: ${savedContact.status}`);
    
    return this.transformContactToResponse(savedContact);
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

  async getAllContacts(query: ContactQueryDto): Promise<{ data: ContactResponseDto[]; total: number }> {
    const { status, search, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.contactRepository.createQueryBuilder('contact')
      .leftJoinAndSelect('contact.requester', 'requester')
      .leftJoinAndSelect('contact.receiver', 'receiver');

    if (status) {
      queryBuilder.andWhere('contact.status = :status', { status });
    }

    if (search) {
      queryBuilder.andWhere(
        '(requester.email ILIKE :search OR requester.firstname ILIKE :search OR requester.surname ILIKE :search OR receiver.email ILIKE :search OR receiver.firstname ILIKE :search OR receiver.surname ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    const [contacts, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('contact.updatedAt', 'DESC')
      .getManyAndCount();

    return {
      data: contacts.map(contact => this.transformContactToResponse(contact)),
      total
    };
  }

  async getContactStats(): Promise<ContactStatsDto> {
    const [
      totalContacts,
      pendingRequests,
      acceptedContacts,
      blockedContacts,
      rejectedContacts
    ] = await Promise.all([
      this.contactRepository.count(),
      this.contactRepository.count({ where: { status: ContactStatus.PENDING } }),
      this.contactRepository.count({ where: { status: ContactStatus.ACCEPTED } }),
      this.contactRepository.count({ where: { status: ContactStatus.BLOCKED } }),
      this.contactRepository.count({ where: { status: ContactStatus.REJECTED } })
    ]);

    return {
      totalContacts,
      pendingRequests,
      acceptedContacts,
      blockedContacts,
      rejectedContacts
    };
  }
}