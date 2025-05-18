import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ParameterType } from './entities/parameter-type.entity';
import { CreateParameterTypeDto } from './dto/create-parameter-type.dto';
import { UpdateParameterTypeDto } from './dto/update-parameter-type.dto';

@Injectable()
export class ParameterTypeService {
  constructor(
    @InjectRepository(ParameterType)
    private readonly parameterTypeRepository: Repository<ParameterType>,
  ) {}

  async create(createParameterTypeDto: CreateParameterTypeDto): Promise<ParameterType> {
    const parameterType = this.parameterTypeRepository.create(createParameterTypeDto);
    return await this.parameterTypeRepository.save(parameterType);
  }

  async findAll(): Promise<ParameterType[]> {
    return await this.parameterTypeRepository.find({
      relations: ['personParameters'],
    });
  }

  async findOne(id: number): Promise<ParameterType> {
    const parameterType = await this.parameterTypeRepository.findOne({
      where: { idParameterType: id },
      relations: ['personParameters'],
    });

    if (!parameterType) {
      throw new NotFoundException(`ParameterType with ID ${id} not found`);
    }

    return parameterType;
  }

  async findByTitle(title: string): Promise<ParameterType> {
    const parameterType = await this.parameterTypeRepository.findOne({
      where: { title },
      relations: ['personParameters'],
    });

    if (!parameterType) {
      throw new NotFoundException(`ParameterType with title ${title} not found`);
    }

    return parameterType;
  }

  async update(id: number, updateParameterTypeDto: UpdateParameterTypeDto): Promise<ParameterType> {
    const parameterType = await this.findOne(id);
    Object.assign(parameterType, updateParameterTypeDto);
    return await this.parameterTypeRepository.save(parameterType);
  }

  async remove(id: number): Promise<void> {
    const parameterType = await this.findOne(id);
    await this.parameterTypeRepository.remove(parameterType);
  }
} 