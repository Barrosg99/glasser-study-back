import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { Types } from 'mongoose';

import { MessageModule } from './message/message.module';
import { ChatModule } from './chat/chat.module';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';

import { HealthController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot(),
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      context: ({ req }) => {
        const userId = req.headers['user-id'] as string;
        if (userId) return { userId: new Types.ObjectId(userId) };
      },
      autoSchemaFile: true,
      playground: false,
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
      path: '/',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const mongoUser = configService.get<string>('MONGO_USERNAME');
        const mongoPassword = configService.get<string>('MONGO_PASSWORD');
        const mongoHost = configService.get<string>('MONGO_HOST');
        const mongoPort = configService.get<string>('MONGO_PORT');
        const mongoDB = configService.get<string>('MONGO_DB');

        return {
          uri:
            configService.get<string>('MONGO_URI') ||
            `mongodb://${mongoUser}:${mongoPassword}@${mongoHost}:${mongoPort}/${mongoDB}?authSource=admin`,
        };
      },
      inject: [ConfigService],
    }),
    MessageModule,
    ChatModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
