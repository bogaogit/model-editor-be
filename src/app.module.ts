import { MiddlewareConsumer, Module, NestModule, RequestMethod } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ApplicationModel } from "./models/ApplicationModel.entity";
import { ApplicationModelsModule } from "./modules/ApplicationModel.module";
import { FilesModule } from "./modules/Files.module";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
import { LoggerMiddleware } from "./middlewares/logger.middleware";
import { ConfigModule } from "@nestjs/config";
import { VideoProcessingModule } from "./video/video-processing/VideoProcessing.module";
import { AnalysedVideoModule } from "./video/analysed-video/AnalysedVideo.module";
import { FileScanModule } from "./video/file-scan/FileScan.module";
import { TranscribeModule } from "./aws/transcribe/Transcribe.module";
import { S3Module } from "./aws/s3/S3.module";
import { ConvertedFileInfo } from "./video/file-scan/FileScan.entity";
import { ScheduleModule } from "@nestjs/schedule";
import { TasksModule } from "./tasks/Tasks.module";
import { CodeGenerationModule } from "./code-generation/CodeGeneration.module";
import { RtspModule } from "./live-streaming/Rtsp.module";

/**
 * http://localhost:3000/static/unnamed.png to access images
 */
@Module({
  imports: [
    ConfigModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/static'
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'model-edit-be',
      entities: [ApplicationModel, ConvertedFileInfo],
      synchronize: true,
    }),
    ScheduleModule.forRoot(),
    TasksModule,
    ApplicationModelsModule,
    VideoProcessingModule,
    FilesModule,
    AnalysedVideoModule,
    FileScanModule,
    TranscribeModule,
    S3Module,
    CodeGenerationModule,
    RtspModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
