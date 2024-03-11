import { Module } from "@nestjs/common";
import { FileScanController } from "./FileScan.controller";
import { FileScanService } from "./FileScan.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConvertedFileInfo } from "./FileScan.entity";
import { AnalysedVideoModule } from "../analysed-video/AnalysedVideo.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([ConvertedFileInfo]),
    AnalysedVideoModule
  ],
  providers: [FileScanService],
  controllers: [FileScanController],
  exports: [FileScanService]
})
export class FileScanModule {
}
