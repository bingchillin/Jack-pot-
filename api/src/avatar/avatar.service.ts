import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Avatar } from './entities/avatar.entity';
import { CreateAvatarDto } from './dto/create-avatar.dto';
import { UpdateAvatarDto } from './dto/update-avatar.dto';

@Injectable()
export class AvatarService {
  constructor(
    @InjectRepository(Avatar)
    private readonly avatarRepository: Repository<Avatar>,
  ) {}

  async create(createAvatarDto: CreateAvatarDto): Promise<Avatar> {
    const avatar = this.avatarRepository.create(createAvatarDto);
    return await this.avatarRepository.save(avatar);
  }

  async findAll(): Promise<Avatar[]> {
    return await this.avatarRepository.find({
      relations: ['plantType'],
    });
  }

  async findOne(id: number): Promise<Avatar> {
    const avatar = await this.avatarRepository.findOne({
      where: { idAvatar: id },
      relations: ['plantType'],
    });

    if (!avatar) {
      throw new NotFoundException(`Avatar with ID ${id} not found`);
    }

    return avatar;
  }

  async findByTitle(title: string): Promise<Avatar> {
    const avatar = await this.avatarRepository.findOne({
      where: { title },
      relations: ['plantType'],
    });

    if (!avatar) {
      throw new NotFoundException(`Avatar with title ${title} not found`);
    }

    return avatar;
  }

  async findByPlantType(plantTypeId: number): Promise<Avatar[]> {
    return await this.avatarRepository.find({
      where: { idPlantType: plantTypeId },
      relations: ['plantType'],
    });
  }

  async update(id: number, updateAvatarDto: UpdateAvatarDto): Promise<Avatar> {
    const avatar = await this.findOne(id);
    Object.assign(avatar, updateAvatarDto);
    return await this.avatarRepository.save(avatar);
  }

  async remove(id: number): Promise<void> {
    const avatar = await this.findOne(id);
    await this.avatarRepository.remove(avatar);
  }
} 