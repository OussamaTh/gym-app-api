import { Type } from 'class-transformer';
import {
  ArrayMaxSize, ArrayMinSize, IsArray, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Matches, Max, MaxLength, Min, ValidateNested,
} from 'class-validator';
import { DATE_RE } from '../../common/date.js';

export class LogItemDto {
  @Matches(DATE_RE)
  date: string;

  @IsString() @IsNotEmpty() @MaxLength(40)
  planItemId: string;

  @IsString() @IsNotEmpty() @MaxLength(120)
  name: string;

  // null or missing means "empty field"
  @IsOptional() @IsNumber() @Min(0) @Max(2000)
  weight?: number | null;

  @IsOptional() @IsInt() @Min(0) @Max(1000)
  sets?: number | null;

  @IsOptional() @IsInt() @Min(0) @Max(1000)
  reps?: number | null;
}

export class UpsertLogsDto {
  @IsArray() @ArrayMinSize(1) @ArrayMaxSize(500)
  @ValidateNested({ each: true }) @Type(() => LogItemDto)
  entries: LogItemDto[];
}