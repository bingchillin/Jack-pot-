import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonService } from './person.service';
import { PersonController } from './person.controller';
import { Person } from './entities/person.entity';
import { Comment } from '../comment/entities/comment.entity';
import { CommentLike } from '../comment/entities/comment-like.entity';
import { RoleModule } from '../role/role.module';
import { StripeModule } from '../stripe/stripe.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Person, Comment, CommentLike]),
        RoleModule,
        forwardRef(() => StripeModule)
    ],
    controllers: [PersonController],
    providers: [PersonService],
    exports: [PersonService, TypeOrmModule]
})
export class PersonModule {} 