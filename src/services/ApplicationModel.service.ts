import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationModel } from '../models/ApplicationModel.entity';
import { MetricCollector } from "../metricCollection";
import { StandardUnit } from "@aws-sdk/client-cloudwatch/dist-types/models";

@Injectable()
export class ApplicationModelsService {
  constructor(
    @InjectRepository(ApplicationModel)
    private applicationModelsRepository: Repository<ApplicationModel>,
    private readonly metricCollector: MetricCollector
  ) {}

  private captureOptional(
    metric: string,
    value: number | undefined | null,
    units: StandardUnit,
    tags: Record<string, string> = {},
    namespace: string | undefined = "runtime_recorder",
  ): void {
    if (value) {
      this.metricCollector.capture(metric, value, units, tags, namespace)
    }
  }

  private captureStorageMetrics(value: number, prefix: string, tags: Record<string, string>): void {
    this.captureOptional(prefix + 'storage:current-recording-size', value, 'Bytes', tags)
    // this.captureOptional(prefix + 'storage:storage-free', metrics.freeStorageBytes, 'bytes', tags)
    // this.captureOptional(prefix + 'storage:storage-used', metrics.localStorageUsedBytes, 'bytes', tags)
  }

  findAll(): Promise<ApplicationModel[]> {
    return this.applicationModelsRepository.find();
  }

  findOne(id: string): Promise<ApplicationModel | null> {
    const tags: Record<string, string> = {
      tag1: "tag1"
    }

    this.captureStorageMetrics(Math.random(), "prefix", tags)
    // return this.applicationModelsRepository.findOneBy({ id });
    return null
  }

  async delete(id: string): Promise<void> {
    await this.applicationModelsRepository.delete(id);
  }

  async save(entityData: ApplicationModel): Promise<ApplicationModel> {
    return this.applicationModelsRepository.save(entityData);
  }
}
