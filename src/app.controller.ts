import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Server Connection Testing')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({
    summary: 'Server connection',
    description: 'Testing if the server is online',
  })
  @ApiOkResponse({
    description: 'Simple response from server that it is running.',
    example: 'Hello World!, Welcome to Bible Verse!',
  })
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
