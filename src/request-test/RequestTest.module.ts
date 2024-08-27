import { Module } from "@nestjs/common";
import { RequestTestService } from "./RequestTest.service";
import { RequestTestController } from "./RequestTest.controller";

@Module({
  providers: [RequestTestService],
  controllers: [RequestTestController],
})
export class RequestTestModule {}
