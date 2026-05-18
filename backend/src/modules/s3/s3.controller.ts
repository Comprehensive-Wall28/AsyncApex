import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { S3Service } from './s3.service';
import { CognitoAuthGuard } from '../../common/guards/cognito-auth.guard';

@ApiTags('S3')
@ApiBearerAuth('cognito-jwt')
@Controller('s3')
@UseGuards(CognitoAuthGuard)
export class S3Controller {
  constructor(private readonly s3Service: S3Service) {}

  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  @ApiOperation({
    summary: 'Upload a file',
    description: 'Stores the file in the originals S3 bucket under `uploads/{uuid}-{filename}`. Returns the key and a 1-hour presigned URL.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: { type: 'string', format: 'binary', description: 'The file to upload' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Upload successful', schema: { example: { key: 'uploads/uuid-photo.jpg', url: 'https://s3.amazonaws.com/...' } } })
  @ApiResponse({ status: 400, description: 'No file provided' })
  upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file provided');
    return this.s3Service.upload(file);
  }

  @Get('presigned/:key(*)')
  @ApiOperation({
    summary: 'Get a presigned download URL',
    description: 'Generates a presigned GET URL for any key in the originals bucket. Valid for 1 hour.',
  })
  @ApiParam({ name: 'key', description: 'S3 object key, e.g. uploads/uuid-photo.jpg' })
  @ApiResponse({ status: 200, description: 'Presigned URL', schema: { example: { url: 'https://s3.amazonaws.com/...' } } })
  getPresignedUrl(@Param('key') key: string, @Query('bucket') bucket?: string) {
    return this.s3Service.getPresignedUrl(key, bucket).then((url) => ({ url }));
  }

  @Delete(':key(*)')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a file from S3', description: 'Removes the object from the originals bucket.' })
  @ApiParam({ name: 'key', description: 'S3 object key, e.g. uploads/uuid-photo.jpg' })
  @ApiResponse({ status: 204, description: 'Deleted successfully' })
  async remove(@Param('key') key: string) {
    await this.s3Service.remove(key);
  }
}
