import { Controller, Get } from '@nestjs/common';

@Controller('status')
export class AppController {
  @Get()
  getStatus() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
