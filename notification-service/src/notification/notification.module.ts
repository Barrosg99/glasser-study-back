import { Module } from '@nestjs/common';
import { NotificationResolver } from './notification.resolver';
import { NotificationService } from './notification.service';
import { pubSubProvider } from './pub-sub.provider';
import { Notification, NotificationSchema } from './models/notification.model';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Notification.name, schema: NotificationSchema }]),
  ],
  providers: [NotificationResolver, NotificationService, pubSubProvider],
})
export class NotificationModule {}
