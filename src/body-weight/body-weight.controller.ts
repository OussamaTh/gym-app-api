import { Body, Controller, Delete, Get, HttpCode, Param, Put, Query } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { CurrentUser } from '../common/current-user.decorator.js';
import type { AuthUser } from '../common/current-user.decorator.js';
import { ParseDatePipe, RangeQueryDto } from '../common/date.js';
import { BodyWeightService } from './body-weight.service.js';
import { SetBodyWeightDto } from './dto/body-weight.dto.js';

@Throttle({ default: { limit: 300, ttl: 60_000 } })
@Controller('body-weight')
export class BodyWeightController {
  constructor(private bodyWeight: BodyWeightService) { }

  @Get() // GET /body-weight?from=&to=
  getAll(@CurrentUser() user: AuthUser, @Query() q: RangeQueryDto) {
    return this.bodyWeight.getAll(user.userId, q.from, q.to);
  }

  @Put(':date') // PUT /body-weight/2026-11-09   body: { kg: 78.5 }
  set(@CurrentUser() user: AuthUser, @Param('date', ParseDatePipe) date: string, @Body() dto: SetBodyWeightDto) {
    return this.bodyWeight.set(user.userId, date, dto.kg);
  }

  @Delete(':date') // DELETE /body-weight/2026-11-09
  @HttpCode(204)
  remove(@CurrentUser() user: AuthUser, @Param('date', ParseDatePipe) date: string) {
    return this.bodyWeight.remove(user.userId, date);
  }

  @Delete() // DELETE /body-weight, removes everything ("Reset all data")
  @HttpCode(204)
  clear(@CurrentUser() user: AuthUser) {
    return this.bodyWeight.clear(user.userId);
  }
}