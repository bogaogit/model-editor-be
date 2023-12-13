import { Body, Controller, Get, HttpStatus, Param, Post, Res, Response } from "@nestjs/common";
import ffmpeg from "fluent-ffmpeg";
import { FileScanService } from "./FileScan.service";
import { ScanDirDto } from "./FileScan.model";
import _ from "lodash";

const ffmpegStatic = require("ffmpeg-static");
ffmpeg.setFfmpegPath(ffmpegStatic);
const fs = require("fs");

@Controller("file")
export class FileScanController {
  constructor(
    private readonly fileScanService: FileScanService
  ) {
  }

  @Post("scan-dir")
  async scanDirectory(
    @Body() scanDirDto: ScanDirDto,
    @Res() res: Response
  ) {
    const convertedFileInfos = await this.getFileInfos("", scanDirDto.inputDirectoryPaths);

    //@ts-ignore
    res.status(HttpStatus.OK).json(convertedFileInfos);
  }

  async getFileInfos(basePath: string, inputDirectoryPaths: string[]) {
    let convertedFileInfos = [];
    for (const inputDirectoryPath of inputDirectoryPaths) {
      const newConvertedFileInfos = await this.fileScanService.scanFileNamesInDirectory(basePath + inputDirectoryPath);
      convertedFileInfos = _.concat(convertedFileInfos, newConvertedFileInfos);
    }

    return convertedFileInfos;
  }

  getDirectories = function getDirectories(path) {
    return fs.readdirSync(path).filter(function(file) {
      return fs.statSync(path + "/" + file).isDirectory();
    });
  };

  @Get("processed-file/:fileName")
  async processedFile(@Param("fileName") fileName: string, @Res() res: Response) {
    const inputDirectoryPath = `uploads/converted/`;
    const convertedFileInfos = await this.fileScanService.getFileConvertedInfo(fileName, "mp4", inputDirectoryPath);

    //@ts-ignore
    res.status(HttpStatus.OK).json(convertedFileInfos);
  }

  @Get("processed-files")
  async processedFiles(@Res() res: Response) {
    const convertedFileInfos = [];
    const inputDirectoryPath = `uploads/converted/`;
    const fileNames = this.getDirectories(inputDirectoryPath);

    for (const fileName of fileNames) {
      const convertedFileInfo = await this.fileScanService.getFileConvertedInfo(fileName, "mp4", inputDirectoryPath);
      convertedFileInfos.push(convertedFileInfo);
    }

    //@ts-ignore
    res.status(HttpStatus.OK).json(convertedFileInfos);
  }
}
