import { MiddlewareConsumer, Module, NestModule, RequestMethod } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ApplicationModel } from "./models/ApplicationModel.entity";
import { ApplicationModelsModule } from "./modules/ApplicationModel.module";
import { FilesModule } from "./modules/Files.module";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
import { LoggerMiddleware } from "./middlewares/logger.middleware";
import { ConfigModule } from "@nestjs/config";
import { TranscribeModule } from "./aws/transcribe/Transcribe.module";
import { S3Module } from "./aws/s3/S3.module";
import { ScheduleModule } from "@nestjs/schedule";
import { CodeGenerationModule } from "./code-generation/CodeGeneration.module";
import { RtspModule } from "./live-streaming/Rtsp.module";
import { RequestTestModule } from "./request-test/RequestTest.module";
import { TranscriptionModule } from "./transcription/transcription.module";

/**
 * http://localhost:3000/static/unnamed.png to access images
 */
@Module({
  imports: [
    ConfigModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'uploads'),
      serveRoot: '/static'
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'model-edit-be',
      entities: [ApplicationModel],
      synchronize: true,
    }),
    ScheduleModule.forRoot(),
    ApplicationModelsModule,
    FilesModule,
    TranscribeModule,
    S3Module,
    CodeGenerationModule,
    RtspModule,
    RequestTestModule,
    TranscriptionModule
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
