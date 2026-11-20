import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LogsController } from './logs.controller.js';
import { LogsService } from './logs.service.js';
import { LogEntry, LogEntrySchema } from './schemas/log-entry.schema.js';

@Module({
  imports: [MongooseModule.forFeature([{ name: LogEntry.name, schema: LogEntrySchema }])],
  controllers: [LogsController],
  providers: [LogsService],
})
export class LogsModule { }