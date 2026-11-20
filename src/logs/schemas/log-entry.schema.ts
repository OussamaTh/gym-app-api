import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

@Schema({ timestamps: true })
export class LogEntry {
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;

    @Prop({ required: true })
    date: string; // "YYYY-MM-DD", the calendar day the user saw

    @Prop({ required: true })
    planItemId: string; // an exercise id, or a variation id

    @Prop({ required: true, trim: true })
    name: string; // snapshot, e.g. "Forearms – Cable", so history survives deleting the plan item

    @Prop({ type: Number, default: null }) weight: number | null;
    @Prop({ type: Number, default: null }) sets: number | null;
    @Prop({ type: Number, default: null }) reps: number | null;
}

export type LogEntryDocument = HydratedDocument<LogEntry>;
export const LogEntrySchema = SchemaFactory.createForClass(LogEntry);

// One entry per exercise per day
LogEntrySchema.index({ userId: 1, date: 1, planItemId: 1 }, { unique: true });