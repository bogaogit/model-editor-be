import { Module } from "@nestjs/common";
import { CodeGenerationService } from "./CodeGeneration.service";
import { CodeGenerationController } from "./CodeGeneration.controller";

@Module({
  providers: [CodeGenerationService],
  controllers: [CodeGenerationController],
})
export class CodeGenerationModule {}
