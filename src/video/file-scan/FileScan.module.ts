import { forwardRef, Module } from "@nestjs/common";
import { FileScanController } from "./FileScan.controller";
import { FileScanService } from "./FileScan.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConvertedFileInfo } from "./FileScan.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([ConvertedFileInfo]),
  ],
  providers: [FileScanService],
  controllers: [FileScanController],
  exports: [FileScanService]
})
export class FileScanModule {
}
