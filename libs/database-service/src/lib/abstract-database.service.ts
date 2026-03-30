import { PreconditionFailedException } from '@nestjs/common';
import { Mapper } from '@dto';
import { JsonModel } from './json-model';

export abstract class AbstractDatabaseService<DTO, Entity> {

  constructor(
    protected readonly model: JsonModel<Entity>,
    protected readonly clazz: new () => DTO
  ) {
    if (!model || !clazz) {
      throw new PreconditionFailedException(`Either model or clazz were not provided for ${this.constructor.name}`);
    }
  }

  async create(data: Entity): Promise<DTO> {
    const result = await this.model.create(data);
    return Mapper.map(this.clazz, result as object);
  }

  async update(data: Partial<Entity>, key: string, value: unknown): Promise<DTO> {
    const result = await this.model.update(data, key, value);
    return Mapper.map(this.clazz, result as object);
  }

  async delete(key: string, value: unknown): Promise<void> {
    await this.model.delete(key, value);
  }

  async get(key: string, value: unknown): Promise<DTO | null> {
    const result = await this.model.get(key, value);
    return result ? Mapper.map(this.clazz, result as object) : null;
  }
}
