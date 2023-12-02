import { Body, Controller, Get, Header, HttpStatus, Param, ParseUUIDPipe, Post, Res } from "@nestjs/common";
import * as fs from "fs";
import { join } from "path";
import ffmpeg from "fluent-ffmpeg";
import { FileScanService } from "./FileScan.service";
import { ConvertedFileInfo, ScanDirDto } from "./FileScan.model";

const ffmpegStatic = require("ffmpeg-static");
ffmpeg.setFfmpegPath(ffmpegStatic);


@Controller("file")
export class FileScanController {
  constructor(
    private readonly fileScanService: FileScanService
  ) {
  }

  @Post("scan-dir")
  async scanDirectory(
    @Body() scanDirDto: ScanDirDto,
    @Res() res: Response,
  ) {
    const convertedFileInfos = await this.fileScanService.scanFileNamesInDirectory(scanDirDto.inputDirectoryPath)
    //@ts-ignore
    res.status(HttpStatus.OK).json(convertedFileInfos);
  }
}
