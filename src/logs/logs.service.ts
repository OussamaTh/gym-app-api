import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UpsertLogsDto } from './dto/log.dto.js';
import { LogEntry } from './schemas/log-entry.schema.js';

type LogView = { name: string; weight: number | null; sets: number | null; reps: number | null };

@Injectable()
export class LogsService {
  constructor(@InjectModel(LogEntry.name) private model: Model<LogEntry>) { }

  /** { "2026-11-09": { "<planItemId>": { name, weight, sets, reps } } }, same shape as the app's local logs */
  async getLogs(userId: string, from?: string, to?: string) {
    const filter: Record<string, any> = { userId: new Types.ObjectId(userId) };
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = from; // YYYY-MM-DD strings sort correctly as text
      if (to) filter.date.$lte = to;
    }
    const rows = await this.model.find(filter).sort({ date: 1 }).lean();

    const byDate: Record<string, Record<string, LogView>> = {};
    for (const r of rows) {
      (byDate[r.date] ??= {})[r.planItemId] = {
        name: r.name,
        weight: r.weight ?? null,
        sets: r.sets ?? null,
        reps: r.reps ?? null,
      };
    }
    return byDate;
  }

  /** Creates or updates many entries at once. Used for a single edit and for the first upload. */
  async upsert(userId: string, dto: UpsertLogsDto) {
    const owner = new Types.ObjectId(userId);
    await this.model.bulkWrite(
      dto.entries.map((e) => ({
        updateOne: {
          filter: { userId: owner, date: e.date, planItemId: e.planItemId },
          update: { $set: { name: e.name.trim(), weight: e.weight ?? null, sets: e.sets ?? null, reps: e.reps ?? null } },
          upsert: true,
        },
      })),
    );
    return { saved: dto.entries.length };
  }

  async clear(userId: string) {
    await this.model.deleteMany({ userId: new Types.ObjectId(userId) });
  }
}