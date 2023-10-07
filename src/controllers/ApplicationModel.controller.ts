import { All, Controller, Get, Param } from "@nestjs/common";
import { ApplicationModelsService } from '../services/ApplicationModel.service';
import { ApplicationModel } from '../models/ApplicationModel.entity';

@Controller('application-models')
export class ApplicationModelController {
  constructor(
    private readonly applicationModelsService: ApplicationModelsService,
  ) {}

  @All()
  findAll(): Promise<ApplicationModel[]> {
    return this.applicationModelsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<ApplicationModel> {
    return this.applicationModelsService.findOne(id);
  }
}
