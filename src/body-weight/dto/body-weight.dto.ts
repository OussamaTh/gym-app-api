import { IsNumber, Max, Min } from 'class-validator';

export class SetBodyWeightDto {
    @IsNumber({ maxDecimalPlaces: 2 }) @Min(1) @Max(700)
    kg: number;
}