import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PlanController } from './plan.controller.js';
import { PlanService } from './plan.service.js';
import { PlanItem, PlanItemSchema } from './schemas/plan-item.schema.js';

@Module({
    imports: [MongooseModule.forFeature([{ name: PlanItem.name, schema: PlanItemSchema }])],
    controllers: [PlanController],
    providers: [PlanService],
})
export class PlanModule { }