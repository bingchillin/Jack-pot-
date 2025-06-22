import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ClassSerializerInterceptor, UseInterceptors } from '@nestjs/common';
import { PersonService } from './person.service';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { CreatePersonResponseDto } from './dto/create-person-response.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBody, ApiExcludeEndpoint, ApiResponse } from '@nestjs/swagger';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('person')
export class PersonController {
    constructor(private readonly personService: PersonService) {}

    @Post()
    @ApiExcludeEndpoint()
    @ApiBody({ type: CreatePersonDto })
    @ApiResponse({ 
        status: 201, 
        description: 'The person has been successfully created.',
        type: CreatePersonResponseDto 
    })
    create(@Body() createPersonDto: CreatePersonDto) {
        return this.personService.create(createPersonDto);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiExcludeEndpoint()
    findAll() {
        return this.personService.findAll();
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    @ApiExcludeEndpoint()
    findOne(@Param('id') id: string) {
        return this.personService.findOne(+id);
    }

    @Get(':id/objects')
    @UseGuards(JwtAuthGuard)
    @ApiExcludeEndpoint()
    findObjectsByPersonId(@Param('id') id: string) {
        return this.personService.findObjectsByPersonId(+id);
    }

    @Get(':id/object-profiles')
    @UseGuards(JwtAuthGuard)
    @ApiExcludeEndpoint()
    findObjectsProfileByPersonId(@Param('id') id: string) {
        return this.personService.findObjectsProfileByPersonId(+id);
    }

    @Get(':id/object-profiles/favoris')
    @UseGuards(JwtAuthGuard)
    @ApiExcludeEndpoint()
    findObjectsProfileByPersonIdFavoris(@Param('id') id: string) {
        return this.personService.findObjectsProfileByPersonIdFavoris(+id);
    }
   

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    @ApiExcludeEndpoint()
    @ApiBody({ type: UpdatePersonDto })
    update(@Param('id') id: string, @Body() updatePersonDto: UpdatePersonDto) {
        return this.personService.update(+id, updatePersonDto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiExcludeEndpoint()
    remove(@Param('id') id: string) {
        return this.personService.remove(+id);
    }

    @Get(':id/payment-ready')
    @UseGuards(JwtAuthGuard)
    @ApiExcludeEndpoint()
    @ApiResponse({ 
        status: 200, 
        description: 'Check if person is ready for payments (has Stripe customer)' 
    })
    async checkPaymentReady(@Param('id') id: string) {
        const person = await this.personService.findOne(+id);
        return {
            personId: +id,
            hasStripeCustomer: !!person.stripeCustomerId,
            isPaymentReady: !!person.stripeCustomerId,
            stripeCustomerId: person.stripeCustomerId
        };
    }

    @Post(':id/prepare-payment')
    @UseGuards(JwtAuthGuard)
    @ApiExcludeEndpoint()
    @ApiResponse({ 
        status: 200, 
        description: 'Prepare person for payments by ensuring Stripe customer exists' 
    })
    async prepareForPayment(@Param('id') id: string) {
        try {
            const stripeCustomerId = await this.personService.ensureStripeCustomer(+id);
            return {
                success: true,
                message: 'User is ready for payments',
                personId: +id,
                stripeCustomerId,
                isPaymentReady: true
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to prepare user for payments',
                error: error.message,
                personId: +id,
                isPaymentReady: false
            };
        }
    }

    // Payment management endpoints

    @Get('admin/without-stripe')
    @UseGuards(JwtAuthGuard)
    @ApiExcludeEndpoint()
    @ApiResponse({ 
        status: 200, 
        description: 'List of persons without Stripe customer IDs.' 
    })
    async findPersonsWithoutStripe() {
        const persons = await this.personService.findPersonsWithoutStripeCustomer();
        return {
            count: persons.length,
            persons: persons.map(person => ({
                idPerson: person.idPerson,
                email: person.email,
                firstname: person.firstname,
                surname: person.surname,
                stripeCustomerId: person.stripeCustomerId
            }))
        };
    }

    @Post('admin/create-missing-stripe-customers')
    @UseGuards(JwtAuthGuard)
    @ApiExcludeEndpoint()
    @ApiResponse({ 
        status: 201, 
        description: 'Batch create Stripe customers for all persons who don\'t have them.' 
    })
    async createMissingStripeCustomers() {
        return await this.personService.createMissingStripeCustomers();
    }
} 