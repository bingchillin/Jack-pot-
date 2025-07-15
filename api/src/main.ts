import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { json, raw } from 'express';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true, // Enable raw body for all requests
  });
  
  // Enable CORS
  app.enableCors({
    origin: [
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
      process.env.NEXT_PUBLIC_FRONT_URL || 'http://localhost:3001',
      'http://192.168.0.231:3000', // Allow local IP for mobile app
      'http://10.0.2.2:3000', // Allow emulator access
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

  // Serve static files from uploads directory
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
    setHeaders: (res, path) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    },
  });

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
  await app.listen(3000, '0.0.0.0');
}
bootstrap();
