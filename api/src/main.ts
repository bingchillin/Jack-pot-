import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as hbs from 'express-handlebars';
import * as cookieParser from 'cookie-parser';
import {HttpExceptionFilter} from "./http-exception/http-exception.filter";
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(cookieParser());

  app.useGlobalFilters(new HttpExceptionFilter());

    // Set the views directory
  app.setBaseViewsDir(join(__dirname, '..', '/src/views'));
  app.useStaticAssets(join(__dirname, '..', '/src/public'));

  // Set Handlebars as the rendering engine
  app.engine(
    'hbs',
    hbs.engine({
      extname: 'hbs',
      partialsDir: join(__dirname, '..', '/src/views/partials'),
      layoutsDir: join(__dirname, '..', '/src/views/layouts'),
      defaultLayout: 'template.hbs',
      helpers: {
        formatDate: (date: Date) => {
          const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
          return new Date(date).toLocaleDateString('fr-FR', options);
        }
      },
    }),
  );

  app.setViewEngine('hbs');

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Jackpot\' API')
    .setDescription('The Jackpot\' API documentation')
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
