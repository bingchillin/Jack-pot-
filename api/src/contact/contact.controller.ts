import { 
    Controller, 
    Get, 
    Post, 
    Body, 
    Patch, 
    Param, 
    Delete, 
    UseGuards,
    Request,
    Query,
    ParseIntPipe
  } from '@nestjs/common';
  import { ContactsService } from './contact.service';
  import { CreateContactDto } from './dto/create-contact.dto';
  import { ContactStatus } from './entities/contact.entity';
  import { JwtAuthGuard } from '../auth/jwt-auth.guard';
  
  @Controller('contacts')
  @UseGuards(JwtAuthGuard)
  export class ContactController {
    constructor(private readonly contactsService: ContactsService) {}
  
    @Post('send-request')
    async sendContactRequest(@Request() req, @Body() createContactDto: CreateContactDto) {
      return await this.contactsService.sendContactRequest(req.user.idPerson, createContactDto);
    }
  
    @Patch(':id/accept')
    async acceptContactRequest(@Request() req, @Param('id', ParseIntPipe) id: number) {
      return await this.contactsService.respondToContactRequest(req.user.idPerson, id, ContactStatus.ACCEPTED);
    }
  
    @Patch(':id/reject')
    async rejectContactRequest(@Request() req, @Param('id', ParseIntPipe) id: number) {
      return await this.contactsService.respondToContactRequest(req.user.idPerson, id, ContactStatus.REJECTED);
    }
  
    @Patch(':id/block')
    async blockContact(@Request() req, @Param('id', ParseIntPipe) id: number) {
      return await this.contactsService.blockContact(req.user.idPerson, id);
    }
  
    @Delete(':id/unblock')
    async unblockContact(@Request() req, @Param('id', ParseIntPipe) id: number) {
      return await this.contactsService.unblockContact(req.user.idPerson, id);
    }
  
    @Delete(':id')
    async removeContact(@Request() req, @Param('id', ParseIntPipe) id: number) {
      return await this.contactsService.removeContact(req.user.idPerson, id);
    }
  
    @Get('my-contacts')
    async getMyContacts(@Request() req) {
      return await this.contactsService.getMyContacts(req.user.idPerson);
    }
  
    @Get('pending-requests')
    async getPendingRequests(@Request() req) {
      return await this.contactsService.getPendingRequests(req.user.idPerson);
    }
  
    @Get('sent-requests')
    async getSentRequests(@Request() req) {
      return await this.contactsService.getSentRequests(req.user.idPerson);
    }
  
    @Get('blocked')
    async getBlockedContacts(@Request() req) {
      return await this.contactsService.getBlockedContacts(req.user.idPerson);
    }
  
    @Get('search')
    async searchUsers(@Request() req, @Query('q') query: string) {
      return await this.contactsService.searchUsers(req.user.idPerson, query);
    }
  }