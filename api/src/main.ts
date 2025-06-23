import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { json, raw } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  app.enableCors({
    origin: [
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
      'http://localhost:3001'
    ],
    credentials: true,
  });

  // Configure raw body parsing for Stripe webhooks only
  app.use('/stripe/webhook', raw({ type: 'application/json' }));
  
  // Use JSON parsing for all other routes
  app.use(json());

  // Use cookie parser
  app.use(cookieParser());

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe());

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Jack Pot API')
    .setDescription('The Jack Pot API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {

    swaggerOptions: {

      tagsSorter: 'alpha',

      operationsSorter: 'alpha',

      tags: ['Person', 'Auth', 'z-Deprecated'],

    },

  });
  await app.listen(3000);
}
bootstrap();
