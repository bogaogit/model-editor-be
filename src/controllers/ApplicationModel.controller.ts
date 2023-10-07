import { Controller, Get } from '@nestjs/common';
import { ApplicationModelsService } from '../services/ApplicationModel.service';
import { ApplicationModel } from '../models/ApplicationModel.entity';

@Controller('application-models')
export class ApplicationModelController {
  constructor(
    private readonly applicationModelsService: ApplicationModelsService,
  ) {}

  @Get()
  findAll(): Promise<ApplicationModel[]> {
    return this.applicationModelsService.findAll();
  }

  @Get(':id')
  findOne(): Promise<ApplicationModel[]> {
    return this.applicationModelsService.findAll();
  }
}
