import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from '@nestjs/common';
import { CurrentUser } from '../common/current-user.decorator.js';
import type { AuthUser } from '../common/current-user.decorator.js';
import { PlanService } from './plan.service.js';
import { AddPlanDto, AddVariationDto, EditPlanDto } from './dto/plan.dto.js';

@Controller('plan') // every route below starts with /api/v1/plan
export class PlanController {
    constructor(private plan: PlanService) { }

    @Get()                                   // GET /plan
    getPlans(@CurrentUser() user: AuthUser) {
        return this.plan.getPlans(user.userId);
    }

    @Post()                                  // POST /plan
    addPlan(@CurrentUser() user: AuthUser, @Body() dto: AddPlanDto) {
        return this.plan.addPlan(user.userId, dto);
    }

    @Patch(':id')                            // PATCH /plan/abc123
    editPlan(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: EditPlanDto) {
        return this.plan.editPlan(user.userId, id, dto);
    }

    @Delete(':id')                           // DELETE /plan/abc123
    @HttpCode(204)
    deletePlan(@CurrentUser() user: AuthUser, @Param('id') id: string) {
        return this.plan.deletePlan(user.userId, id);
    }

    @Post(':id/variations')                  // POST /plan/abc123/variations
    addVariation(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: AddVariationDto) {
        return this.plan.addVariation(user.userId, id, dto);
    }

    @Delete(':id/variations/:varId')         // DELETE /plan/abc123/variations/xyz789
    @HttpCode(204)
    deleteVariation(@CurrentUser() user: AuthUser, @Param('id') id: string, @Param('varId') varId: string) {
        return this.plan.deletePlanVariation(user.userId, id, varId);
    }
}