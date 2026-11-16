import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { User, UserDocument } from './schemas/user.schema.js';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private model: Model<User>) { }

  findByEmail(email: string) {
    return this.model.findOne({ email: email.toLowerCase().trim() });
  }

  findById(id: string) {
    return this.model.findById(id);
  }

  create(data: Pick<User, 'email' | 'passwordHash' | 'firstName' | 'lastName'>) {
    return this.model.create(data);
  }

  setRefreshHash(id: string, hash: string | null) {
    return this.model.updateOne({ _id: id }, { refreshTokenHash: hash });
  }

  /** The only shape of a user that ever leaves the server. */
  toPublic(u: UserDocument) {
    return { id: u.id as string, email: u.email, firstName: u.firstName, lastName: u.lastName };
  }

  async getProfile(id: string) {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return this.toPublic(user);
  }

  async updateProfile(id: string, dto: UpdateProfileDto) {
    const user = await this.model.findByIdAndUpdate(id, dto, { new: true });
    if (!user) throw new NotFoundException('User not found');
    return this.toPublic(user);
  }
}