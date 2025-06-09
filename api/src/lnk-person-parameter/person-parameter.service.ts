import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PersonParameter } from './entities/person-parameter.entity';
import { CreatePersonParameterDto } from './dto/create-person-parameter.dto';
import { UpdatePersonParameterDto } from './dto/update-person-parameter.dto';

@Injectable()
export class PersonParameterService {
  constructor(
    @InjectRepository(PersonParameter)
    private readonly personParameterRepository: Repository<PersonParameter>,
  ) {}

  async create(createPersonParameterDto: CreatePersonParameterDto): Promise<PersonParameter> {
    const personParameter = this.personParameterRepository.create(createPersonParameterDto);
    return await this.personParameterRepository.save(personParameter);
  }

  async findAll(): Promise<PersonParameter[]> {
    return await this.personParameterRepository.find({
      relations: ['person', 'parameterType'],
    });
  }

  async findOne(id: number): Promise<PersonParameter> {
    const personParameter = await this.personParameterRepository.findOne({
      where: { idLnkPersonParameter: id },
      relations: ['person', 'parameterType'],
    });

    if (!personParameter) {
      throw new NotFoundException(`PersonParameter with ID ${id} not found`);
    }

    return personParameter;
  }

  async findByTitle(title: string): Promise<PersonParameter> {
    const personParameter = await this.personParameterRepository.findOne({
      where: { title },
      relations: ['person', 'parameterType'],
    });

    if (!personParameter) {
      throw new NotFoundException(`PersonParameter with title ${title} not found`);
    }

    return personParameter;
  }

  async findByPerson(personId: number): Promise<PersonParameter[]> {
    return await this.personParameterRepository.find({
      where: { idPerson: personId },
      relations: ['person', 'parameterType'],
    });
  }

  async findByParameterType(parameterTypeId: number): Promise<PersonParameter[]> {
    return await this.personParameterRepository.find({
      where: { idParameterType: parameterTypeId },
      relations: ['person', 'parameterType'],
    });
  }

  async findByPersonAndParameterType(personId: number, parameterTypeId: number): Promise<PersonParameter> {
    const personParameter = await this.personParameterRepository.findOne({
      where: { idPerson: personId, idParameterType: parameterTypeId },
      relations: ['person', 'parameterType'],
    });

    if (!personParameter) {
      throw new NotFoundException(`PersonParameter not found for person ${personId} and parameter type ${parameterTypeId}`);
    }

    return personParameter;
  }

  async update(id: number, updatePersonParameterDto: UpdatePersonParameterDto): Promise<PersonParameter> {
    const personParameter = await this.findOne(id);
    Object.assign(personParameter, updatePersonParameterDto);
    return await this.personParameterRepository.save(personParameter);
  }

  async remove(id: number): Promise<void> {
    const personParameter = await this.findOne(id);
    await this.personParameterRepository.remove(personParameter);
  }
} 