import {
  Controller,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
  HttpStatus,
} from '@nestjs/common';
import express, {Request, Response} from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Controller('files')
export class FilesController {
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file',  {
      storage: diskStorage({
        destination: './uploads/',
      }),
    }),
  )
  uploadMultipleFiles(
    @UploadedFile() file: Express.Multer.File,
  ) {
    const fileResponse = {
      filename: file.filename,
    };
    return fileResponse;
  }
}
