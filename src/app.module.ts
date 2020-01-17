import { HttpModule, Module } from '@nestjs/common';
import { AppController } from './app.controller';
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
    ContentService,
  ],
})
export class AppModule {}
