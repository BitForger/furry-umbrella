import { BadRequestException, Controller, Get, Param } from '@nestjs/common';
import { ContentService } from '../../services/content/content.service';

@Controller('content')
export class ContentController {

  constructor(private readonly contentService: ContentService) {
  }

  /**
   * Take in an ID or media type and query the acoustic content management service
   * for it. Take the response from the CMS and filter down to the minimum properties
   * needed to display on the frontend
   * @param contentId
   */
  @Get(':id')
  public async getById(@Param('id') contentId: string) {
    let response;
    let caughtError = false;
    try {
      response = await this.contentService.getById(contentId);
    } catch (e) {
      caughtError = true;
      response = e;
    }

    // if the value we have isn't an id/couldn't be found try to search for it
    if (!caughtError) {
      const returnObject = await this.contentService.getFields(['id', 'name', 'created', 'url'], response.data);
      if (returnObject && !Array.isArray(returnObject)) {
        returnObject.url = this.contentService.getContentUrl(contentId);
        return returnObject;
      } else {
        throw new BadRequestException();
      }
    } else if (caughtError) {
      // Execute check if this is a type request
      try {
        return await this.contentService.searchByType(contentId);
      } catch (e) {
        throw e;
      }
    }
  }
}
