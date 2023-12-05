import { Module } from "@nestjs/common";
import { FileScanTaskService } from "./FileScanTask.service";
import { FileScanModule } from "../video/file-scan/FileScan.module";
import { VideoProcessingModule } from "../video/video-processing/VideoProcessing.module";

@Module({
  imports: [FileScanModule, VideoProcessingModule],
  providers: [FileScanTaskService]
})
export class TasksModule {
}
