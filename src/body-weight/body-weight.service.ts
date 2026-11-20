import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BodyWeight } from './schemas/body-weight.schema.js';

@Injectable()
export class BodyWeightService {
  constructor(@InjectModel(BodyWeight.name) private model: Model<BodyWeight>) { }

  /** { "2026-11-09": 78.5, ... }, same shape as the app's local body data */
  async getAll(userId: string, from?: string, to?: string) {
    const filter: Record<string, any> = { userId: new Types.ObjectId(userId) };
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = from;
      if (to) filter.date.$lte = to;
    }
    const rows = await this.model.find(filter).sort({ date: 1 }).lean();
    const byDate: Record<string, number> = {};
    for (const r of rows) byDate[r.date] = r.kg;
    return byDate;
  }

  /** Creates the weigh-in for that day, or updates it */
  async set(userId: string, date: string, kg: number) {
    await this.model.updateOne(
      { userId: new Types.ObjectId(userId), date },
      { $set: { kg } },
      { upsert: true },
    );
    return { date, kg };
  }

  async remove(userId: string, date: string) {
    await this.model.deleteOne({ userId: new Types.ObjectId(userId), date });
  }

  async clear(userId: string) {
    await this.model.deleteMany({ userId: new Types.ObjectId(userId) });
  }
}