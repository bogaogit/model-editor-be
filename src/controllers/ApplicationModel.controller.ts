import { All, Body, Controller, Delete, Get, Param, Post } from "@nestjs/common";
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
  findOne(@Param('id') id: number): Promise<ApplicationModel> {
    return this.applicationModelsService.findOne(id);
  }

  @Post()
  async save(@Body() entityData: ApplicationModel) {
    return this.applicationModelsService.save(entityData);
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    return this.applicationModelsService.delete(id);
  }
}
