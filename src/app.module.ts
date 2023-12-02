import { MiddlewareConsumer, Module, NestModule, RequestMethod } from "@nestjs/common";
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationModel } from './models/ApplicationModel.entity';
import { ApplicationModelsModule } from './modules/ApplicationModel.module';
import { FilesModule } from './modules/Files.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { LoggerMiddleware } from "./middlewares/logger.middleware";
import { ConfigModule } from "@nestjs/config";
import { VideoProcessingModule } from "./video/video-processing/VideoProcessing.module";
import { AnalysedVideoModule } from "./video/analysed-video/AnalysedVideo.module";
import { FileScanModule } from "./video/file-scan/FileScan.module";

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
      entities: [ApplicationModel],
      synchronize: true,
    }),
    ApplicationModelsModule,
    VideoProcessingModule,
    FilesModule,
    AnalysedVideoModule,
    FileScanModule
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
