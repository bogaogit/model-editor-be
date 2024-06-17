import { Body, Controller, Post } from "@nestjs/common";
import { RequestTestContract, CodeGenerationRequestContract } from "./RequestTest.contract";
import { CodeGenerationOutput, RequestTestService } from "./RequestTest.service";
import { ApplicationModel } from "../models/ApplicationModel.entity";

@Controller('code-generation')
export class RequestTestController {
  constructor(
    private readonly codeGenerationService: RequestTestService
  ) {
  }

  @Post()
  async generateCode(@Body() codeGenerationRequestContract: CodeGenerationRequestContract): Promise<CodeGenerationOutput> {
    return this.codeGenerationService.generateCode({
      applicationModelObject: codeGenerationRequestContract,
      codeTemplateData: codeGenerationRequestContract.entityData
    });
  }
}
