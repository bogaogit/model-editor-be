import { Injectable, Logger } from "@nestjs/common";
import { promises as fsPromises } from "fs";
import {
  AUDIO_DIR_NAME,
  CONVERTED_DIR,
  HLS_DIR_NAME,
  ProcessType,
  SCREENSHOTS_DIR_NAME,
  TRANSCRIPT_DIR_NAME
} from "./FileScan.model";
import { ConvertedFileInfo } from "./FileScan.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsWhere, Repository, UpdateResult } from "typeorm";
import _ from "lodash";
import ffmpeg from "fluent-ffmpeg";
import { AnalysedVideoService } from "../analysed-video/AnalysedVideo.service";

const ffmpegStatic = require("ffmpeg-static");
ffmpeg.setFfmpegPath(ffmpegStatic);

const path = require("path");
const fs = require("fs");

export type FieldName = "img" | "hls" | "audio" | "transcript" | "processing"


interface FileToProcess {
  id: string,
  convertedFileInfo: ConvertedFileInfo,
  processType: ProcessType
}

@Injectable()
export class FileScanService {
  private readonly logger = new Logger(FileScanService.name);
  private PROCESS_TRANSCRIBE_TASK: string = process.env.PROCESS_TRANSCRIBE_TASK
  private INPUT_DIRECTORY: string = process.env.INPUT_DIRECTORY
  inputDirectoryPaths = JSON.parse(this.INPUT_DIRECTORY);

  constructor(
    @InjectRepository(ConvertedFileInfo)
    private convertedFileInfoRepository: Repository<ConvertedFileInfo>,
    private analysedVideoService: AnalysedVideoService
  ) {
    this.clearProcessingFileFlag().then(() => {})
  }

  async scanDirectories() {
    let convertedFileInfos = [];
    for (const inputDirectoryPath of this.inputDirectoryPaths) {
      const newConvertedFileInfos = await this.scanFileNamesInDirectory(inputDirectoryPath);
      convertedFileInfos = _.concat(convertedFileInfos, newConvertedFileInfos);
    }

    return convertedFileInfos;
  }

  async scanFileNamesInDirectory(
    inputDirectoryPath: string
  ): Promise<ConvertedFileInfo[]> {
    const convertedFileInfos: ConvertedFileInfo[] = [];
    const fileNames = await fsPromises.readdir(inputDirectoryPath);
    for (const fileName of fileNames) {
      const extension = path.extname(fileName);
      const onlyFileName = path.basename(fileName, extension);
      const convertedFileInfo = await this.buildFileConvertedInfo(onlyFileName, extension, inputDirectoryPath);
      if (convertedFileInfo) {
        await this.createIfNotExistByFileName(convertedFileInfo);
        convertedFileInfos.push(convertedFileInfo);
      }
    }

    return convertedFileInfos;
  }

  async buildFileConvertedInfo(fileName: string, extension: string, inputDirectoryPath: string): Promise<ConvertedFileInfo> {
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

    if (!convertedFileInfo.videoInfo){
      const fullFileName = `${convertedFileInfo.filePath}/${convertedFileInfo.fileName}${convertedFileInfo.extension}`
      convertedFileInfo.videoInfo = await this.analysedVideoService.getVideoInfoFromFullPath(fullFileName)
    }

    return convertedFileInfo;
  }

  findAll(): Promise<ConvertedFileInfo[]> {
    return this.convertedFileInfoRepository.find();
  }

  findOne(id: string): Promise<ConvertedFileInfo> {
    return this.convertedFileInfoRepository.findOneBy({ id });
  }

  findOneByName(name: string): Promise<ConvertedFileInfo> {
    return this.convertedFileInfoRepository.findOneBy({ fileName: name });
  }

  async delete(id: string): Promise<void> {
    await this.convertedFileInfoRepository.delete(id);
  }

  async save(entityData: ConvertedFileInfo): Promise<ConvertedFileInfo> {
    return this.convertedFileInfoRepository.save(entityData);
  }

  async createOrUpdateByFileName(entityData: ConvertedFileInfo): Promise<ConvertedFileInfo | UpdateResult> {
    const findItem = await this.convertedFileInfoRepository.findOneBy({ fileName: entityData.fileName });
    if (findItem) {
      return await this.convertedFileInfoRepository.update({ id: findItem.id }, { ...entityData });
    } else {
      return await this.convertedFileInfoRepository.save(entityData);
    }
  }

  async createIfNotExistByFileName(entityData: ConvertedFileInfo): Promise<ConvertedFileInfo | undefined> {
    const findItem = await this.convertedFileInfoRepository.findOneBy({ fileName: entityData.fileName });
    if (findItem) {
      return undefined;
    } else {
      return await this.convertedFileInfoRepository.save(entityData);
    }
  }

  async serviceIsProcessingFile(): Promise<boolean> {
    const findItem = await this.convertedFileInfoRepository.findOneBy({ processing: true });
    return !!findItem;
  }

  async clearProcessingFileFlag() {
    return await this.convertedFileInfoRepository.update({ processing: true }, { processing: false });
  }

  async findNextFileToProcess(): Promise<FileToProcess | undefined> {
    let whereCondition: FindOptionsWhere<ConvertedFileInfo>[] = [
      { hasScreenshots: false },
      { hasHls: false },
      { hasAudio: false },
    ];

    if (this.PROCESS_TRANSCRIBE_TASK === "true"){
      whereCondition.push({ hasTranscript: false })
    }

    const findItem = await this.convertedFileInfoRepository.findOneBy(
      whereCondition
    );

    if (findItem) {
      let processType: ProcessType;
      if (!findItem.hasScreenshots) {
        processType = "screenshots";
      } else if (!findItem.hasHls) {
        processType = "hls";
      } else if (!findItem.hasAudio) {
        processType = "audio";
      } else if (!findItem.hasTranscript) {
        processType = "transcript";
      }

      return {
        id: findItem.id,
        convertedFileInfo: findItem,
        processType: processType
      };
    } else {
      this.logger.log("No tasks found");
    }
  }

  async setFieldValue(entityData: ConvertedFileInfo, fieldName: FieldName, fieldValue: any): Promise<void> {
    const findItem = await this.convertedFileInfoRepository.findOneBy({ fileName: entityData.fileName });
    let updateField;
    if (findItem) {
      switch (fieldName) {
        case "img":
          updateField = { hasScreenshots: fieldValue };
          break;
        case "hls":
          updateField = { hasHls: fieldValue };
          break;
        case "audio":
          updateField = { hasAudio: fieldValue };
          break;
        case "transcript":
          updateField = { hasTranscript: fieldValue };
          break;
        case "processing":
          updateField = { processing: fieldValue };
          break;
      }

      await this.convertedFileInfoRepository.update({ id: findItem.id }, updateField);
    }
  }
}
