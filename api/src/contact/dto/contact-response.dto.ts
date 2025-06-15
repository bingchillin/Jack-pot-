import { ContactStatus } from "../entities/contact.entity";

export class ContactResponseDto {
    id: number;
    requesterId: number;
    receiverId: number;
    status: ContactStatus;
    blockedBy?: number;
    createdAt: Date;
    updatedAt: Date;
    requester: {
      id: number;
      username: string;
      email: string;
    };
    receiver: {
      id: number;
      username: string;
      email: string;
    };
  }