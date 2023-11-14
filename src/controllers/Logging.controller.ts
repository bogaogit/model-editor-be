import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UseGuards
} from "@nestjs/common";
import { ApplicationModelsService } from "../services/ApplicationModel.service";
import { ApplicationModel } from "../models/ApplicationModel.entity";
import { RolesGuard } from "../guards/roles.guard";
import { LoggingService } from "../services/Logging.service";

@Controller("logging")
export class LoggingController {
  constructor(
    private readonly loggingService: LoggingService
  ) {
  }

  @Get("fetch")
  fetch(): Promise<number[]> {
    return this.loggingService.fetch();
  }

  @Put("capture/:value")
  capture(@Param("value") value: number): void {
    return this.loggingService.capture(value);
  }
}
