import { Controller, Get, HttpStatus } from '@nestjs/common';

@Controller()
export class AppController {

  /**
   * health check endpoint for target group
   */
  @Get('healthy')
  getHello() {
    return HttpStatus.OK;
  }
}
