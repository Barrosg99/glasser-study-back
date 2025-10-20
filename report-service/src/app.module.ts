import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { MongooseModule } from '@nestjs/mongoose';

import { ReportModule } from './report/report.module';
import { HealthController } from './app.controller';
import { Types } from 'mongoose';

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
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      context: ({ req }) => {
        const userId = req.headers['user-id'] as string;
        const from = req.headers['from'] as string;
        const isAdmin = req.headers['is-admin'] as string;
        const context: any = { from };
        if (userId) context.userId = new Types.ObjectId(userId);
        if (isAdmin) context.isAdmin = Boolean(isAdmin);
        return context;
      },
      autoSchemaFile: true,
      playground: false,
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
      path: '/',
    }),
    ReportModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
