import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

export const editFileName = (req, file, callback) => {
  const name = file.originalname.split('.')[0];
  const fileExtName = file.originalname;
  const randomName = Array(4)
    .fill(null)
    .map(() => Math.round(Math.random() * 16).toString(16))
    .join('');
  callback(null, file.originalname);
};

@Controller('files')
export class FilesController {
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file',  {
      storage: diskStorage({
        destination: './uploads/',
        filename: editFileName,
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
