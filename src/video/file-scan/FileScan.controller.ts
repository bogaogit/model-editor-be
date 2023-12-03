import { Body, Controller, Get, Header, HttpStatus, Param, ParseUUIDPipe, Post, Res } from "@nestjs/common";
import * as fs from "fs";
import { join } from "path";
import ffmpeg from "fluent-ffmpeg";
import { FileScanService } from "./FileScan.service";
import { ConvertedFileInfo, ScanDirDto } from "./FileScan.model";
import _ from "lodash";

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
    let convertedFileInfos = []
    for (const inputDirectoryPath of scanDirDto.inputDirectoryPaths) {
      const newConvertedFileInfos = await this.fileScanService.scanFileNamesInDirectory(inputDirectoryPath)
      convertedFileInfos = _.concat(convertedFileInfos, newConvertedFileInfos)
    }

    //@ts-ignore
    res.status(HttpStatus.OK).json(convertedFileInfos);
  }
}
