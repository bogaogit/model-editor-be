import { MiddlewareConsumer, Module, NestModule, RequestMethod } from "@nestjs/common";
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationModel } from './models/ApplicationModel.entity';
import { ApplicationModelsModule } from './modules/ApplicationModel.module';
import { FilesModule } from './modules/Files.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { LoggerMiddleware } from "./middleware/logger.middleware";

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
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
    FilesModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
