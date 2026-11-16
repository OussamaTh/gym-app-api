import { IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class AddPlanDto {
    @IsInt() @Min(0) @Max(6)
    weekday: number;

    @IsString() @IsNotEmpty() @MaxLength(60)
    name: string;
}

export class EditPlanDto {
    @IsOptional() @IsString() @IsNotEmpty() @MaxLength(60)
    name?: string;
}

export class AddVariationDto {
    @IsString() @IsNotEmpty() @MaxLength(60)
    name: string;
}