import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationModel } from '../models/ApplicationModel.entity';

@Injectable()
export class ApplicationModelsService {
  constructor(
    @InjectRepository(ApplicationModel)
    private applicationModelsRepository: Repository<ApplicationModel>,
  ) {}

  findAll(): Promise<ApplicationModel[]> {
    return this.applicationModelsRepository.find();
  }

  findOne(id: string): Promise<ApplicationModel | null> {
    return this.applicationModelsRepository.findOneBy({ id });
  }

  async delete(id: string): Promise<void> {
    await this.applicationModelsRepository.delete(id);
  }

  async save(entityData: ApplicationModel): Promise<ApplicationModel> {
    return this.applicationModelsRepository.save(entityData);
  }
}
