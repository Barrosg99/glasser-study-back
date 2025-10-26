import { Module } from '@nestjs/common';
import { UserResolver } from './user.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './models/user.model';
import { UserService } from './user.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => {
        return {
          transport: {
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
              user: config.get<string>('EMAIL_USERNAME'),
              pass: config.get<string>('EMAIL_PASSWORD'),
            },
          },
          defaults: {
            from: '"No Reply - Glasser Study" <glasser-study@hotmail.com>',
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [UserResolver, UserService],
  exports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    UserService,
  ],
})
export class UserModule {}
