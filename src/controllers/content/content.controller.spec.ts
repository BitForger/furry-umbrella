import { Test, TestingModule } from '@nestjs/testing';
import { ContentController } from './content.controller';
import { ContentService } from '../../services/content/content.service';
import { HttpModule } from '@nestjs/common';

describe('Content Controller', () => {
  let controller: ContentController;
  const id = 'fa9519d5-0363-4b8d-8e1f-627d802c08a8';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [ContentService],
      controllers: [ContentController],
    }).compile();

    controller = module.get<ContentController>(ContentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return a valid filtered json when a valid id is passed', async () => {
    const value = await controller.getById(id);
    expect(value).toBeDefined();
    expect(value).toBeInstanceOf(Object);
  });
});
