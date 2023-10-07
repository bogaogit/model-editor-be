import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ApplicationModel } from "./models/ApplicationModel.entity";
import { ApplicationModelsModule } from "./modules/ApplicationModel.module";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "postgres",
      host: "localhost",
      port: 5432,
      username: "postgres",
      password: "postgres",
      database: "model-edit-be",
      entities: [ApplicationModel],
      synchronize: true,
    }),
    ApplicationModelsModule
  ],
})
export class AppModule {}
