import { Injectable, ConflictException, NotFoundException, Logger, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { Person } from './entities/person.entity';
import { Comment } from '../comment/entities/comment.entity';
import { CommentLike } from '../comment/entities/comment-like.entity';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { CreatePersonResponseDto } from './dto/create-person-response.dto';
import * as bcrypt from 'bcrypt';
import { RoleService } from '../role/role.service';
import { ObjectEntity } from 'src/object/entities/object.entity';
import { ObjectProfile } from 'src/object-profile/entities/object-profile.entity';
import { StripeService } from '../stripe/stripe.service';

@Injectable()
export class PersonService {
    private readonly logger = new Logger(PersonService.name);

    constructor(
        @InjectRepository(Person)
        private personRepository: Repository<Person>,
        @InjectRepository(Comment)
        private commentRepository: Repository<Comment>,
        @InjectRepository(CommentLike)
        private commentLikeRepository: Repository<CommentLike>,
        private roleService: RoleService,
        @Inject(forwardRef(() => StripeService))
        private stripeService: StripeService,
    ) {}

    async create(createPersonDto: CreatePersonDto): Promise<CreatePersonResponseDto> {
        const existingPerson = await this.personRepository.findOne({
            where: { email: createPersonDto.email }
        });

        if (existingPerson) {
            throw new ConflictException('Email already exists');
        }

        // Hash the password before creating the person
        const hashedPassword = await bcrypt.hash(createPersonDto.password, 10);
        
        const person = this.personRepository.create({
            ...createPersonDto,
            password: hashedPassword
        });

        if (createPersonDto.idRole) {
            const role = await this.roleService.findOne(createPersonDto.idRole);
            person.role = role;
        }

        const savedPerson = await this.personRepository.save(person);
        this.logger.log(`✅ Person created with ID: ${savedPerson.idPerson}`);

        // Create Stripe customer
        let stripeCustomerId = null;
        try {
            this.logger.log('Creating Stripe customer...');
            const stripeCustomer = await this.stripeService.createCustomer(savedPerson);
            stripeCustomerId = stripeCustomer.id;
            
            // Update person with Stripe customer ID
            savedPerson.stripeCustomerId = stripeCustomerId;
            await this.personRepository.save(savedPerson);
            
            this.logger.log(`✅ Stripe customer created: ${stripeCustomerId}`);
        } catch (error) {
            this.logger.error(`❌ Failed to create Stripe customer for person ${savedPerson.idPerson}:`, error);
            // Don't fail the person creation if Stripe fails
        }
        
        // Map to response DTO
        const response: CreatePersonResponseDto = {
            idPerson: savedPerson.idPerson,
            email: savedPerson.email,
            firstname: savedPerson.firstname,
            surname: savedPerson.surname,
            numberPhone: savedPerson.numberPhone,
            idRole: savedPerson.idRole,
            isEmailVerified: savedPerson.isEmailVerified,
            stripeCustomerId: stripeCustomerId
        };

        return response;
    }

    async findAll(): Promise<Person[]> {
        return await this.personRepository.find({
            relations: ['role']
        });
    }

    async findOne(id: number): Promise<Person> {
        const person = await this.personRepository.findOne({
            where: { idPerson: id },
            relations: ['role']
        });

        if (!person) {
            throw new NotFoundException(`Person with ID ${id} not found`);
        }

        return person;
    }

    async findByEmail(email: string): Promise<Person | null> {
        const person = await this.personRepository.findOne({
            where: { email: email },
            relations: ['role']
        });

        return person;
    }

    async update(id: number, updatePersonDto: UpdatePersonDto): Promise<Person> {
        const person = await this.findOne(id);

        if (updatePersonDto.password) {
            updatePersonDto.password = await bcrypt.hash(updatePersonDto.password, 10);
        }

        if (updatePersonDto.idRole) {
            const role = await this.roleService.findOne(updatePersonDto.idRole);
            person.role = role;
        }

        Object.assign(person, updatePersonDto);
        
        const savedPerson = await this.personRepository.save(person);
        
        return savedPerson;
    }

    async findObjectsByPersonId(id: number): Promise<ObjectEntity[]> {
        const person = await this.personRepository.findOne({
            where: { idPerson: id },
            relations: [
                'objectProfiles', 
                'objectProfiles.object', 
                'objectProfiles.plantType'
            ]
        });
    
        if (!person) {
            throw new NotFoundException(`Person with ID ${id} not found`);
        }
    
        const objectMap = new Map<number, any>();
        
        person.objectProfiles.forEach(profile => {
            const objectId = profile.object.idObject;
            
            if (!objectMap.has(objectId)) {
                // Initialize object without objectProfiles to avoid duplication
                const { objectProfiles, ...objectData } = profile.object;
                objectMap.set(objectId, {
                    ...objectData,
                    profiles: []
                });
            }
            
            // Add cleaned profile to the object
            const cleanProfile = {
                idObjectProfile: profile.idObjectProfile,
                title: profile.title,
                description: profile.description,
                advise: profile.advise,
                createdAt: profile.createdAt,
                updatedAt: profile.updatedAt,
                plantType: profile.plantType ? {
                    idPlantType: profile.plantType.idPlantType,
                    title: profile.plantType.title
                } : null
            };
            
            objectMap.get(objectId).profiles.push(cleanProfile);
        });
    
        return Array.from(objectMap.values());
    }

    async remove(id: number): Promise<void> {
        const person = await this.findOne(id);
        await this.personRepository.remove(person);
    }

    async hashPassword(password: string): Promise<string> {
        const salt = await bcrypt.genSalt();
        return bcrypt.hash(password, salt);
    }

    async findObjectsProfileByPersonId(id: number): Promise<ObjectProfile[]> {
        const person = await this.personRepository.findOne({
            where: { idPerson: id },
            relations: ['objectProfiles', 'objectProfiles.object', 'objectProfiles.plantType']
        });

        if (!person) {
            throw new NotFoundException(`Person with ID ${id} not found`);
        }

        // Return the object profiles with their associated objects and plant types
        return person.objectProfiles;
    }

    async findObjectsProfileByPersonIdFavoris(id: number): Promise<ObjectProfile[]> {
        const person = await this.personRepository.findOne({
            where: { idPerson: id },
            relations: ['objectProfiles', 'objectProfiles.object', 'objectProfiles.plantType']
        });

        if (!person) {
            throw new NotFoundException(`Person with ID ${id} not found`);
        }

        const filteredProfiles = person.objectProfiles.filter(profile => profile.favoris !== null).sort((a, b) => a.favoris - b.favoris);;

        return filteredProfiles;
    }

    async count(options?: FindManyOptions<Person>): Promise<number> {
        return await this.personRepository.count(options);
    }

    async updateStripeCustomerId(id: number, stripeCustomerId: string): Promise<Person> {
        const person = await this.findOne(id);
        person.stripeCustomerId = stripeCustomerId;
        return await this.personRepository.save(person);
    }

    async findByStripeCustomerId(stripeCustomerId: string): Promise<Person | null> {
        return await this.personRepository.findOne({
            where: { stripeCustomerId },
            relations: ['role']
        });
    }

    async ensureStripeCustomer(personId: number): Promise<string> {
        const person = await this.findOne(personId);
        
        // If they already have a Stripe customer ID, return it
        if (person.stripeCustomerId) {
            this.logger.log(`Person ${personId} already has Stripe customer: ${person.stripeCustomerId}`);
            return person.stripeCustomerId;
        }

        // Create a new Stripe customer
        try {
            this.logger.log(`Creating Stripe customer for existing person ${personId}`);
            const stripeCustomer = await this.stripeService.createCustomer(person);
            
            // Update the person with the new Stripe customer ID
            person.stripeCustomerId = stripeCustomer.id;
            await this.personRepository.save(person);
            
            this.logger.log(`✅ Created Stripe customer ${stripeCustomer.id} for existing person ${personId}`);
            return stripeCustomer.id;
        } catch (error) {
            this.logger.error(`❌ Failed to create Stripe customer for person ${personId}:`, error);
            throw new Error(`Failed to create Stripe customer: ${error.message}`);
        }
    }

    async findPersonsWithoutStripeCustomer(): Promise<Person[]> {
        return await this.personRepository.find({
            where: { stripeCustomerId: null },
            relations: ['role']
        });
    }

    async createMissingStripeCustomers(): Promise<{ success: number; failed: number; errors: any[] }> {
        const personsWithoutStripe = await this.findPersonsWithoutStripeCustomer();
        let success = 0;
        let failed = 0;
        const errors = [];

        this.logger.log(`Found ${personsWithoutStripe.length} persons without Stripe customers. Starting batch creation...`);

        for (const person of personsWithoutStripe) {
            try {
                await this.ensureStripeCustomer(person.idPerson);
                success++;
            } catch (error) {
                failed++;
                errors.push({
                    personId: person.idPerson,
                    email: person.email,
                    error: error.message
                });
                this.logger.error(`Failed to create Stripe customer for person ${person.idPerson}: ${error.message}`);
            }
        }

        this.logger.log(`Batch Stripe customer creation completed: ${success} success, ${failed} failed`);
        return { success, failed, errors };
    }
    
    async getParentCommentsByPersonId(personId: number, currentUserId?: number): Promise<any[]> {
        // First verify that the person exists
        const person = await this.findOne(personId);
        if (!person) {
            throw new NotFoundException(`Person with ID ${personId} not found`);
        }

        const queryBuilder = this.commentRepository
            .createQueryBuilder('comment')
            .leftJoinAndSelect('comment.person', 'person')
            .leftJoin('comment.likes', 'likes')
            .addSelect('COUNT(likes.idCommentLike) as likeCount')
            .where('comment.idPerson = :personId', { personId })
            .andWhere('comment.parentCommentId IS NULL')
            .andWhere('comment.isDeleted = false')
            .groupBy('comment.idComment')
            .addGroupBy('person.idPerson')
            .addGroupBy('userLike.id_comment_like')
            .orderBy('comment.createdAt', 'DESC');

        // Add current user like status if provided
        if (currentUserId) {
            queryBuilder
                .leftJoin('comment.likes', 'userLike', 'userLike.idPerson = :currentUserId', { currentUserId })
                .addSelect('CASE WHEN userLike.idCommentLike IS NOT NULL THEN true ELSE false END as isLikedByCurrentUser');
        }

        const rawResults = await queryBuilder.getRawAndEntities();

        // Format the results with like statistics
        return rawResults.entities.map((comment, index) => {
            const rawResult = rawResults.raw[index];
            return {
                idComment: comment.idComment,
                content: comment.content,
                idPerson: comment.idPerson,
                parentCommentId: comment.parentCommentId,
                isDeleted: comment.isDeleted,
                deletedAt: comment.deletedAt,
                createdAt: comment.createdAt,
                updatedAt: comment.updatedAt,
                person: {
                    idPerson: comment.person.idPerson,
                    email: comment.person.email,
                    firstname: comment.person.firstname,
                    surname: comment.person.surname,
                },
                likeCount: parseInt(rawResult.likeCount) || 0,
                ...(currentUserId && { isLikedByCurrentUser: rawResult.isLikedByCurrentUser === '1' || rawResult.isLikedByCurrentUser === true }),
            };
        });
    }
} 