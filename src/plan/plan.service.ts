import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model, Types } from 'mongoose';
import { AddPlanDto, AddVariationDto, EditPlanDto } from './dto/plan.dto.js';
import { PlanItem, PlanItemDocument } from './schemas/plan-item.schema.js';

const MAX_ITEMS_PER_DAY = 30;

/** The shape the app receives (same fields as the local plan in the Expo app). */
type PlanItemView = {
    id: string;
    weekday: number;
    name: string;
    position: number;
    variations: { id: string; name: string }[];
};

const toView = (p: PlanItemDocument): PlanItemView => ({
    id: p.id,
    weekday: p.weekday,
    name: p.name,
    position: p.position,
    variations: p.variations.map((v) => ({ id: String((v as any)._id), name: v.name })),
});

/** A malformed id is treated as "not found", otherwise Mongoose throws a cast error (500). */
const assertId = (id: string) => {
    if (!isValidObjectId(id)) throw new NotFoundException('Plan item not found');
};

@Injectable()
export class PlanService {
    constructor(@InjectModel(PlanItem.name) private model: Model<PlanItem>) { }

    /** All items of this user, grouped by weekday: { "1": [...], "3": [...] } */
    async getPlans(userId: string) {
        console.log('DB', this.model.db.name, '| COLLECTION', this.model.collection.name);
        console.log('SCHEMA userId type:', this.model.schema.path('userId').instance);
        const raw = await this.model.collection.find({}).toArray();
        console.log('RAW', raw.map((d: any) => ({ name: d.name, userIdType: d.userId?.constructor?.name, userId: String(d.userId) })));
        console.log('LOOKING FOR', userId, typeof userId);

        const items = await this.model.find({ userId }).sort({ weekday: 1, position: 1 });
        console.log('GET PLANS', { userId, mine: items.length, total: await this.model.countDocuments() }); // temporary

        const byDay: Record<number, PlanItemView[]> = {};
        for (const item of items) (byDay[item.weekday] ??= []).push(toView(item));
        return byDay;
    }

    async addPlan(userId: string, dto: AddPlanDto) {
        const count = await this.model.countDocuments({ userId, weekday: dto.weekday });
        if (count >= MAX_ITEMS_PER_DAY) {
            throw new BadRequestException(`You can plan up to ${MAX_ITEMS_PER_DAY} exercises per day`);
        }
        const item = await this.model.create({
            userId: new Types.ObjectId(userId),
            weekday: dto.weekday,
            name: dto.name.trim(),
            position: count, // added at the end of the day's list
        });
        return toView(item);
    }

    async editPlan(userId: string, planId: string, dto: EditPlanDto) {
        assertId(planId);
        const update = dto.name !== undefined ? { name: dto.name.trim() } : {};
        // Filtering by userId too means nobody can edit another user's item, even with its id
        const item = await this.model.findOneAndUpdate({ _id: planId, userId }, { $set: update }, { new: true });
        if (!item) throw new NotFoundException('Plan item not found');
        return toView(item);
    }

    async deletePlan(userId: string, planId: string) {
        assertId(planId);
        const res = await this.model.deleteOne({ _id: planId, userId });
        if (res.deletedCount === 0) throw new NotFoundException('Plan item not found');
    }

    async addVariation(userId: string, planId: string, dto: AddVariationDto) {
        assertId(planId);
        const item = await this.model.findOneAndUpdate(
            { _id: planId, userId },
            { $push: { variations: { name: dto.name.trim() } } },
            { new: true },
        );
        if (!item) throw new NotFoundException('Plan item not found');
        return toView(item);
    }

    async deletePlanVariation(userId: string, planId: string, varId: string) {
        assertId(planId);
        assertId(varId);
        const item = await this.model.findOneAndUpdate(
            { _id: planId, userId, 'variations._id': new Types.ObjectId(varId) },
            { $pull: { variations: { _id: new Types.ObjectId(varId) } } },
            { new: true },
        );
        if (!item) throw new NotFoundException('Variation not found');
    }
}