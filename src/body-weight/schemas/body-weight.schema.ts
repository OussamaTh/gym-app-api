import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

@Schema({ timestamps: true })
export class BodyWeight {
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;

    @Prop({ required: true })
    date: string; // "YYYY-MM-DD"

    @Prop({ required: true, min: 1, max: 700 })
    kg: number;
}

export type BodyWeightDocument = HydratedDocument<BodyWeight>;
export const BodyWeightSchema = SchemaFactory.createForClass(BodyWeight);

// One weigh-in per day
BodyWeightSchema.index({ userId: 1, date: 1 }, { unique: true });