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
import { cloudWatchClient } from "../clients/Cloudwatch.client";
import { PutMetricDataCommand, PutMetricDataCommandInput } from "@aws-sdk/client-cloudwatch";

@Controller('application-models')
@UseGuards(RolesGuard)
export class ApplicationModelController {
  constructor(
    private readonly applicationModelsService: ApplicationModelsService,
  ) {}

  @Get()
  // @Roles(['admin'])
  async findAll(): Promise<ApplicationModel[]> {
    const metricData: PutMetricDataCommandInput = {
      Namespace: "MyApp/Metrics2", // Replace "MyApp/Metrics" with your desired metric namespace
      MetricData: [
        {
          MetricName: "MyCustomMetric", // Replace "MyCustomMetric" with your desired metric name
          Dimensions: [
            { Name: "Environment", Value: "Production" }, // Add any extra dimensions as required
          ],
          Unit: "Count",
          Value: -200, // Set your desired metric value here
        },
      ],
    };

    // https://ap-southeast-2.console.aws.amazon.com/cloudwatch/home?region=ap-southeast-2#metricsV2?graph=~(metrics~(~(~'MyApp*2fMetrics~'MyCustomMetric~'Environment~'Production))~sparkline~true~view~'timeSeries~stacked~false~region~'ap-southeast-2~start~'-PT3H~end~'P0D~stat~'Average~period~10)&query=~'*7bMyApp*2fMetrics*2cEnvironment*7d
    const command = new PutMetricDataCommand(metricData);

    try {
      const response = await cloudWatchClient.send(command);
      console.log(response);
      console.log("Metrics data sent successfully.");
    } catch (error) {
      console.error("Failed to send metrics data.", error);
    }

    return this.applicationModelsService.findAll();
  }

  @Get(':id')
  // @Roles(['admin'])
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
