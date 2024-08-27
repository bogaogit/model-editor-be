import { Body, Controller, Post } from "@nestjs/common";
import { RequestTestContract } from "./RequestTest.contract";
import { RequestTestService } from "./RequestTest.service";

@Controller('request-test')
export class RequestTestController {
  constructor(
    private readonly requestTestService: RequestTestService
  ) {
  }

  @Post()
  async postRequest(@Body() requestTestContract: RequestTestContract): Promise<RequestTestContract> {
    return this.requestTestService.postRequest({
      applicationModelObject: requestTestContract.applicationModelObject,
      entityData: requestTestContract.entityData
    });
  }
}
