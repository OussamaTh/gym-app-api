import { Body, Controller, Get, Put } from '@nestjs/common';
import { CurrentUser } from '../common/current-user.decorator.js';
import type { AuthUser } from '../common/current-user.decorator.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { UsersService } from './users.service.js';

@Controller('profile')
export class UsersController {
    constructor(private users: UsersService) { }

    @Get()
    get(@CurrentUser() user: AuthUser) {
        return this.users.getProfile(user.userId);
    }

    @Put()
    update(@CurrentUser() user: AuthUser, @Body() dto: UpdateProfileDto) {
        return this.users.updateProfile(user.userId, dto);
    }
}