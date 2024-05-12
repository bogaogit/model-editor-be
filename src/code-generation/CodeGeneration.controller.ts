import { Body, Controller, Post } from "@nestjs/common";
import { CodeGenerationContract } from "./CodeGeneration.contract";
import { CodeGenerationOutput, CodeGenerationService } from "./CodeGeneration.service";
import { ApplicationModel } from "../models/ApplicationModel.entity";

@Controller('code-generation')
export class CodeGenerationController {
  constructor(
    private readonly codeGenerationService: CodeGenerationService
  ) {
  }

  @Post()
  async generateCode(@Body() codeGenerationContract: CodeGenerationContract): Promise<CodeGenerationOutput> {
    return this.codeGenerationService.generateCode(codeGenerationContract);
  }
}
