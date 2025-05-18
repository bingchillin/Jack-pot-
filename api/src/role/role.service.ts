import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RoleService {
    constructor(
        @InjectRepository(Role)
        private roleRepository: Repository<Role>,
    ) {}

    async create(createRoleDto: CreateRoleDto): Promise<Role> {
        const role = this.roleRepository.create(createRoleDto);
        return await this.roleRepository.save(role);
    }

    async findAll(): Promise<Role[]> {
        return await this.roleRepository.find({
            relations: ['persons']
        });
    }

    async findOne(id: number): Promise<Role> {
        const role = await this.roleRepository.findOne({ 
            where: { idRole: id },
            relations: ['persons']
        });
        if (!role) {
            throw new NotFoundException(`Role with ID ${id} not found`);
        }
        return role;
    }

    async findByTitle(title: string): Promise<Role> {
        const role = await this.roleRepository.findOne({
            where: { title },
            relations: ['persons']
        });
        if (!role) {
            throw new NotFoundException(`Role with title ${title} not found`);
        }
        return role;
    }

    async update(id: number, updateRoleDto: UpdateRoleDto): Promise<Role> {
        const role = await this.findOne(id);
        Object.assign(role, updateRoleDto);
        return await this.roleRepository.save(role);
    }

    async remove(id: number): Promise<void> {
        const role = await this.findOne(id);
        await this.roleRepository.remove(role);
    }
} 