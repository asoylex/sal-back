import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm/repository/Repository';
import { LogsService } from '../logs/logs.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly logService: LogsService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const newUser = this.userRepository.create(createUserDto);
      const savedUser = await this.userRepository.save(newUser);
      await this.logService.create({
        action: 'SAVE_USER',
        userId: savedUser.id,
        details: `Usuario ${savedUser.email} guardado en la base de datos.`,
      });
      return savedUser;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al crear el usuario.');
    }
  }

  async findAll() {
    try {
      const users = await this.userRepository.find();
      await this.logService.create({
        action: 'FIND_ALL_USERS',
        details: `Se obtuvieron ${users.length} usuarios.`,
      });
      return users;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al obtener los usuarios.');
    }
  }

  async findOne(id: number) {
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) {
        throw new NotFoundException(`Usuario con ID ${id} no encontrado.`);
      }
      await this.logService.create({
        action: 'FIND_ONE_USER',
        userId: id,
        details: `Usuario con ID ${id} encontrado.`,
      });
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al buscar el usuario.');
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    try {
      if (updateUserDto.password) {
        updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
      }
      const result = await this.userRepository.update(id, updateUserDto);
      if (result.affected === 0) {
        throw new NotFoundException(`Usuario con ID ${id} no encontrado.`);
      }
      await this.logService.create({
        action: 'UPDATE_USER',
        userId: id,
        details: `Usuario con ID ${id} actualizado.`,
      });
      return result;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al actualizar el usuario.');
    }
  }

  async remove(id: number) {
    try {
      const result = await this.userRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`Usuario con ID ${id} no encontrado.`);
      }
      await this.logService.create({
        action: 'REMOVE_USER',
        userId: id,
        details: `Usuario con ID ${id} eliminado.`,
      });
      return result;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al eliminar el usuario.');
    }
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    try {
      const user = await this.userRepository.findOne({
        where: { email },
      });
      if (!user) {
        await this.logService.create({
          action: 'VALIDATE_USER',
          details: `Validación fallida: Usuario con email ${email} no encontrado.`,
        });
        return null;
      }
      if (!user.status) {
        await this.logService.create({
          action: 'VALIDATE_USER',
          userId: user.id,
          details: `Validación fallida: Usuario con email ${email} está inactivo.`,
        });
        return null;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      await this.logService.create({
        action: 'VALIDATE_USER',
        userId: user.id,
        details: isPasswordValid
          ? `Validación exitosa para el usuario con email ${email}.`
          : `Validación fallida: Contraseña incorrecta para el usuario con email ${email}.`,
      });
      return isPasswordValid ? user : null;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al validar el usuario.');
    }
  }
}
