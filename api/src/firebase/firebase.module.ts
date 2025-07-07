import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FirebaseService } from './firebase.service';
import { PersonModule } from '../person/person.module';

@Module({
  imports: [
    ConfigModule,
    forwardRef(() => PersonModule),
  ],
  providers: [FirebaseService],
  exports: [FirebaseService],
})
export class FirebaseModule {} 