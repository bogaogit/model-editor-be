import { Module } from "@nestjs/common";
import { FilesController } from "../controllers/Files.controller";

@Module({
  imports: [],
  providers: [],
  controllers: [FilesController]
})
export class FilesModule {
}
