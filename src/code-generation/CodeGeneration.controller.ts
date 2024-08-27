import { Body, Controller, Get, Post } from "@nestjs/common";
import { CodeGenerationContract, CodeGenerationRequestContract } from "./CodeGeneration.contract";
import { CodeGenerationOutput, CodeGenerationService } from "./CodeGeneration.service";
import { ApplicationModel } from "../models/ApplicationModel.entity";

@Controller("code-generation")
export class CodeGenerationController {
  constructor(
    private readonly codeGenerationService: CodeGenerationService
  ) {
  }

  @Post()
  async generateCode(@Body() codeGenerationRequestContract: CodeGenerationRequestContract): Promise<CodeGenerationOutput> {
    return this.codeGenerationService.generateCode({
      applicationModelObject: codeGenerationRequestContract.applicationModelObject,
      codeTemplateData: codeGenerationRequestContract.entityData
    });
  }

  @Post("all")
  async generateCodeAllTemplates(@Body() codeGenerationRequestContract: CodeGenerationRequestContract): Promise<CodeGenerationOutput> {
    return this.codeGenerationService.generateCodeAllTemplates({
      applicationModelObject: codeGenerationRequestContract.applicationModelObject,
      codeTemplateData: codeGenerationRequestContract.entityData
    });
  }
}
