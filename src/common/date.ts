import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { IsOptional, Matches } from 'class-validator';

export const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Use as @Param('date', ParseDatePipe). Rejects anything that is not YYYY-MM-DD. */
@Injectable()
export class ParseDatePipe implements PipeTransform<string, string> {
  transform(value: string) {
    if (!DATE_RE.test(value)) throw new BadRequestException('Date must look like 2026-11-09');
    return value;
  }
}

/** ?from=2026-11-01&to=2026-11-30, both optional */
export class RangeQueryDto {
  @IsOptional() @Matches(DATE_RE)
  from?: string;

  @IsOptional() @Matches(DATE_RE)
  to?: string;
}