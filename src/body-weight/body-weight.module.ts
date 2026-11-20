import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BodyWeightService } from './body-weight.service.js';
import { BodyWeight, BodyWeightSchema } from './schemas/body-weight.schema.js';
import { BodyWeightController } from './body-weight.controller.js';

@Module({
    imports: [MongooseModule.forFeature([{ name: BodyWeight.name, schema: BodyWeightSchema }])],
    controllers: [BodyWeightController],
    providers: [BodyWeightService],
})
export class BodyWeightModule { }