import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { json, raw } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true, // Enable raw body for all requests
  });
  
  // Enable CORS
  app.enableCors({
    origin: [
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
      process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3001'
    ],
    credentials: true,
  });

  // Custom middleware for webhook raw body parsing
  app.use((req, res, next) => {
    if (req.path === '/orders/webhook') {
      // For webhook endpoint, use raw body parsing
      raw({ type: 'application/json', limit: '10mb' })(req, res, (err) => {
        if (err) {
          console.error('Raw body parsing error:', err);
          return next(err);
        }
        // Store the raw body in req.rawBody for the controller to access
        req.rawBody = req.body;
        next();
      });
    } else {
      // For all other routes, use JSON parsing
      json({ limit: '10mb' })(req, res, next);
    }
  });

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
