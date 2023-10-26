import {
  All,
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put, UseGuards
} from "@nestjs/common";
import { ApplicationModelsService } from '../services/ApplicationModel.service';
import { ApplicationModel } from '../models/ApplicationModel.entity';
import { RolesGuard } from "../guards/roles.guard";
import { Roles } from "../decorators/roles.decorator";

@Controller('application-models')
@UseGuards(RolesGuard)
export class ApplicationModelController {
  constructor(
    private readonly applicationModelsService: ApplicationModelsService,
  ) {}

  @Get()
  @Roles(['admin'])
  findAll(): Promise<ApplicationModel[]> {
    return this.applicationModelsService.findAll();
  }

  @Get(':id')
  @Roles(['admin'])
  findOne(@Param('id', new ParseUUIDPipe()) id: string): Promise<ApplicationModel> {
    try {
      return this.applicationModelsService.findOne(id);
    } catch (error) {
      throw new HttpException({
        status: HttpStatus.NOT_FOUND,
        error: 'Cannot find record',
      }, HttpStatus.NOT_FOUND, {
        cause: error
      });
    }
  }

  @Post()
  async save(@Body() entityData: ApplicationModel) {
    return this.applicationModelsService.save(entityData);
  }

  @Put()
  async saveOrUpdate(@Body() entityData: ApplicationModel) {
    return this.applicationModelsService.save(entityData);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.applicationModelsService.delete(id);
  }
}
