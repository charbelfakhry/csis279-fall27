import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ForeignKeyConstraintError, UniqueConstraintError } from 'sequelize';
import { UserDto } from './dto/user.dto.js';
import { UsersRepository } from './users.repository.js';

// users.email is unique (ignoring case), so a duplicate is a 409 instead of a 500
const toConflict = (error: unknown) =>
  error instanceof UniqueConstraintError ? new ConflictException('A user with this email already exists') : error;

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  findAll() {
    return this.usersRepository.findAll();
  }

  async findOne(id: number) {
    const user = await this.usersRepository.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async create(user: UserDto) {
    try {
      return await this.usersRepository.create(user);
    } catch (error) {
      throw toConflict(error);
    }
  }

  async update(id: number, user: UserDto) {
    let updated;
    try {
      updated = await this.usersRepository.update(id, user);
    } catch (error) {
      throw toConflict(error);
    }
    if (!updated) throw new NotFoundException('User not found');
    return updated;
  }

  async remove(id: number) {
    if (!(await this.usersRepository.remove(id))) throw new NotFoundException('User not found');
  }

  // replaces the user's roles. changing your own roles is blocked so an admin
  // can't accidentally remove their own access
  async updateRoles(id: number, roleIds: number[], currentUserId: number) {
    if (id === currentUserId) throw new ConflictException("You can't change your own roles");
    await this.findOne(id);

    try {
      await this.usersRepository.setRoles(id, [...new Set(roleIds)]);
    } catch (error) {
      if (error instanceof ForeignKeyConstraintError) {
        throw new BadRequestException('One or more roles do not exist');
      }
      throw error;
    }
    return this.findOne(id);
  }
}
