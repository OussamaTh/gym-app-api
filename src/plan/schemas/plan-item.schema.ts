import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

// A variation lives inside its exercise. Mongoose gives each one its own _id automatically.
@Schema()
export class Variation {
    @Prop({ required: true, trim: true })
    name: string;
}
export const VariationSchema = SchemaFactory.createForClass(Variation);

@Schema({ timestamps: true })
export class PlanItem {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;

    @Prop({ required: true, min: 0, max: 6 }) // 0 = Sunday ... 6 = Saturday
    weekday: number;

    @Prop({ required: true, trim: true })
    name: string;

    @Prop({ default: 0 })
    position: number; // order within the day

    @Prop({ type: [VariationSchema], default: [] })
    variations: Variation[];
}

export type PlanItemDocument = HydratedDocument<PlanItem>;
export const PlanItemSchema = SchemaFactory.createForClass(PlanItem);

// Speeds up "all items for this user, grouped by day"
PlanItemSchema.index({ userId: 1, weekday: 1, position: 1 });