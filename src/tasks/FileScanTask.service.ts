import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { FileScanService } from "../video/file-scan/FileScan.service";
import { VideoProcessingService } from "../video/video-processing/VideoProcessing.service";

@Injectable()
export class FileScanTaskService {
  private readonly logger = new Logger(FileScanTaskService.name);

  constructor(
    private fileScanService: FileScanService,
    private videoProcessingService: VideoProcessingService
  ) {
  }

  @Cron('*/30 * * * * *')
  async scanFiles() {
    this.logger.log('Scanning Directories ...');
    await this.fileScanService.scanDirectories()
  }

  // @Cron('*/10 * * * * *')
  // async pickNewJob() {
  //   this.logger.log('Scanning and Picking new job ...');
  //   await this.videoProcessingService.findNextFileAndProcess()
  // }
}
