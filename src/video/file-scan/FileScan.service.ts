import { Injectable } from "@nestjs/common";
import { promises as fsPromises } from "fs";
import {
  AUDIO_DIR_NAME,
  CONVERTED_DIR,
  ConvertedFileInfo,
  HLS_DIR_NAME,
  SCREENSHOTS_DIR_NAME,
  TRANSCRIPT_DIR_NAME
} from "./FileScan.model";

const path = require("path");
const fs = require("fs");

@Injectable()
export class FileScanService {
  async scanFileNamesInDirectory(
    inputDirectoryPath: string
  ): Promise<ConvertedFileInfo[]> {
    const convertedFileInfos: ConvertedFileInfo[] = [];
    const fileNames = await fsPromises.readdir(inputDirectoryPath);
    for (const fileName of fileNames) {
      const extension = path.extname(fileName);
      const onlyFileName = path.basename(fileName, extension);
      const convertedFileInfo = await this.getFileConvertedInfo(onlyFileName, extension, inputDirectoryPath);
      if (convertedFileInfo) {
        convertedFileInfos.push(convertedFileInfo);
      }
    }

    return convertedFileInfos;
  }

  async getFileConvertedInfo(fileName: string, extension: string, inputDirectoryPath: string): Promise<ConvertedFileInfo> {
    const convertedFileInfo: ConvertedFileInfo = new ConvertedFileInfo();
    convertedFileInfo.fileName = fileName;
    convertedFileInfo.isEmpty = false;
    convertedFileInfo.extension = extension;
    convertedFileInfo.filePath = inputDirectoryPath;
    const directoryPath = `${CONVERTED_DIR}/${fileName}`;

    if (fs.existsSync(directoryPath)) {
      try {
        const dirs = await fsPromises.readdir(directoryPath);

        if (dirs.includes(AUDIO_DIR_NAME)) {
          convertedFileInfo.hasAudio = true;
        }

        if (dirs.includes(HLS_DIR_NAME)) {
          convertedFileInfo.hasHls = true;
        }

        if (dirs.includes(SCREENSHOTS_DIR_NAME)) {
          convertedFileInfo.hasScreenshots = true;
        }

        if (dirs.includes(TRANSCRIPT_DIR_NAME)) {
          convertedFileInfo.hasTranscript = true;
        }

        if (
          convertedFileInfo.hasAudio &&
          convertedFileInfo.hasHls &&
          convertedFileInfo.hasScreenshots &&
          convertedFileInfo.hasTranscript
        ) {
          convertedFileInfo.hasAll = true;
        }
      } catch (error) {
        throw new Error("Failed to read directory");
      }
    } else {
      convertedFileInfo.isEmpty = true;
    }

    return convertedFileInfo;
  }
}
