import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { PrismaService } from '../prisma.service';
import { CreateUserekDto } from './dto/create-userek.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { LoginUserekDto } from './dto/login-userek.dto';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { UpdateUserekDto } from './dto/update-userek.dto';

@Injectable()
export class UserekService {
  constructor(private readonly prisma: PrismaService) {}

  private hashPassword(password: string) {
    const salt = randomBytes(16).toString('hex');
    const hash = scryptSync(password, salt, 64).toString('hex');

    return `${salt}:${hash}`;
  }

  private verifyPassword(password: string, storedHash: string) {
    const [salt, hashedPassword] = storedHash.split(':');

    if (!salt || !hashedPassword) {
      return false;
    }

    const keyBuffer = Buffer.from(hashedPassword, 'hex');
    const derivedKey = scryptSync(password, salt, keyBuffer.length);

    return (
      keyBuffer.length === derivedKey.length &&
      timingSafeEqual(keyBuffer, derivedKey)
    );
  }

  private extractPassword(payload: { jelszo?: string; jelszo_hash?: string }) {
    return payload.jelszo ?? payload.jelszo_hash ?? '';
  }

  private sanitizeUser<T extends { jelszo_hash: string }>(user: T) {
    const { jelszo_hash, ...safeUser } = user;

    return safeUser;
  }

  async create(createUserekDto: CreateUserekDto) {
    try {
      const createdUser = await this.prisma.userek.create({
        data: {
          ...createUserekDto,
          jelszo_hash: this.hashPassword(createUserekDto.jelszo_hash),
        },
      });

      return this.sanitizeUser(createdUser);
    } catch (error) {
      if ((error as { code?: string }).code === 'P2002') {
        throw new ConflictException('Ezzel az email címmel már van regisztráció.');
      }

      throw error;
    }
  }

  async register(registerAuthDto: RegisterAuthDto) {
    const { jelszo, ...userData } = registerAuthDto;

    return this.create({
      ...userData,
      jelszo_hash: jelszo,
    });
  }

  async login(loginUserekDto: LoginUserekDto) {
    const user = await this.prisma.userek.findUnique({
      where: {
        email: loginUserekDto.email,
      },
    });

    if (!user || !this.verifyPassword(loginUserekDto.jelszo_hash, user.jelszo_hash)) {
      throw new UnauthorizedException('Hibás email vagy jelszó.');
    }

    return this.sanitizeUser(user);
  }

  async loginWithPlainPassword(loginAuthDto: LoginAuthDto) {
    return this.login({
      email: loginAuthDto.email,
      jelszo_hash: this.extractPassword({ jelszo: loginAuthDto.jelszo }),
    });
  }

  async findAll() {
    const users = await this.prisma.userek.findMany({
      orderBy: {
        id: 'asc',
      },
      include: {
        edzestervek: true,
      },
    });

    return users.map(({ jelszo_hash, ...safeUser }) => safeUser);
  }

  async findOne(id: number) {
    const user = await this.prisma.userek.findUnique({
      where: { id },
      include: {
        edzestervek: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`Felhasználó ${id} nem található`);
    }

    return this.sanitizeUser(user);
  }

  async update(id: number, updateUserekDto: UpdateUserekDto) {
    await this.findOne(id);

    const updatedUser = await this.prisma.userek.update({
      where: { id },
      data: updateUserekDto,
    });

    return this.sanitizeUser(updatedUser);
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.userek.delete({
      where: { id },
    });
  }
}
