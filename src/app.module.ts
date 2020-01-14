import { HttpModule, HttpService, Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ContentController } from './controllers/content/content.controller';
import { ContentService } from './services/content/content.service';

@Module({
  imports: [
    HttpModule,
  ],
  controllers: [
    AppController,
    ContentController,
  ],
  providers: [
    AppService,
    ContentService,
  ],
})
export class AppModule {}
