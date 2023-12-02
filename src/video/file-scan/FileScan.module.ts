import { Module } from "@nestjs/common";
import { FileScanController } from "./FileScan.controller";
import { FileScanService } from "./FileScan.service";

@Module({
  imports: [],
  providers: [FileScanService],
  controllers: [FileScanController]
})
export class FileScanModule {
}
