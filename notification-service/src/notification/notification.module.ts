import { Module } from '@nestjs/common';
import { NotificationResolver } from './notification.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { Notification, NotificationSchema } from './models/notification.model';
import { NotificationService } from './notification.service';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forFeature([{ name: Notification.name, schema: NotificationSchema }]),
    RabbitMQModule.forRootAsync(RabbitMQModule, {
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        return {
          uri:
            configService.get('RABBITMQ_URI') ||
            `amqp://${configService.get('RABBITMQ_USER')}:${configService.get(
              'RABBITMQ_PASSWORD',
            )}@${configService.get('RABBITMQ_HOST')}:${configService.get(
              'RABBITMQ_PORT',
            )}`,
          connectionInitOptions: { wait: false },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [NotificationResolver, NotificationService],
  exports: [
    MongooseModule.forFeature([{ name: Notification.name, schema: NotificationSchema }]),
    NotificationService,
  ],
})
export class NotificationModule {}
