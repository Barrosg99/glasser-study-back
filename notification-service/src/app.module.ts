import { Module } from '@nestjs/common';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { Context } from 'graphql-ws';
import { JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { NotificationModule } from './notification/notification.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
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
    RabbitMQModule.forRoot({
      exchanges: [
        {
          name: 'notifications_exchange',
          type: 'topic',
        },
      ],
      uri: 'amqp://guest:guest@localhost:5672',
      connectionInitOptions: { wait: false },
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      playground: false,
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
      path: '/',
      sortSchema: true,
      subscriptions: {
        'graphql-ws': {
          path: '/',
          onConnect: (context: Context<any>) => {
            const { connectionParams, extra } = context as any;

            const jwtService = new JwtService({
              secret: process.env.JWT_SECRET,
            });

            const authHeader = connectionParams.Authorization;

            if (authHeader) {
              const token = authHeader;
              try {
                const decoded = jwtService.verify(token);
                extra.userId = decoded.user.id;
              } catch (err) {
                throw new Error('Token Inválido');
              }
            }
          },
        },
      },
      context: ({ extra }) => {
        return { userId: extra?.userId };
      },
    }),
    NotificationModule,
  ],
})
export class AppModule {}
