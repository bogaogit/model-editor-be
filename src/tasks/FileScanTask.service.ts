import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { FileScanService } from "../video/file-scan/FileScan.service";
import { VideoProcessingService } from "../video/video-processing/VideoProcessing.service";

@Injectable()
export class FileScanTaskService {
  private readonly logger = new Logger(FileScanTaskService.name);
  private RUN_TASKS: string = process.env.RUN_TASKS

  constructor(
    private fileScanService: FileScanService,
    private videoProcessingService: VideoProcessingService
  ) {
  }

  @Cron('*/30 * * * * *')
  async scanFiles() {
    if (this.RUN_TASKS === "true") {
      this.logger.log('Scanning Directories ...');
      await this.fileScanService.scanDirectories()
    }
  }

  @Cron('*/10 * * * * *')
  async pickNewJob() {
    if (this.RUN_TASKS === "true") {
      this.logger.log('Scanning and Picking new job ...');
      await this.videoProcessingService.findNextFileAndProcess()
    }
  }
}
