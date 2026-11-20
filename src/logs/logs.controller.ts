import { Body, Controller, Delete, Get, HttpCode, Put, Query } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { CurrentUser } from '../common/current-user.decorator.js';
import type { AuthUser } from '../common/current-user.decorator.js';
import { RangeQueryDto } from '../common/date.js';
import { UpsertLogsDto } from './dto/log.dto.js';
import { LogsService } from './logs.service.js';

// The app saves as you type (debounced), so this controller gets a higher rate limit than the default
@Throttle({ default: { limit: 300, ttl: 60_000 } })
@Controller('logs')
export class LogsController {
  constructor(private logs: LogsService) { }

  @Get() // GET /logs?from=2026-11-01&to=2026-11-30
  get(@CurrentUser() user: AuthUser, @Query() q: RangeQueryDto) {
    return this.logs.getLogs(user.userId, q.from, q.to);
  }

  @Put() // PUT /logs   body: { entries: [{ date, planItemId, name, weight, sets, reps }] }
  upsert(@CurrentUser() user: AuthUser, @Body() dto: UpsertLogsDto) {
    return this.logs.upsert(user.userId, dto);
  }

  @Delete() // DELETE /logs, removes all of this user's logs ("Reset all data")
  @HttpCode(204)
  clear(@CurrentUser() user: AuthUser) {
    return this.logs.clear(user.userId);
  }
}