import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { MailOptions } from 'nodemailer/lib/json-transport';

@Injectable()
export class MailService implements OnModuleInit {
  //? For logging
  private readonly logger = new Logger(MailService.name);

  //? Transporter type
  private transporter!: nodemailer.Transporter;

  //? Constructor
  constructor(private readonly configService: ConfigService) {}

  //? This runs automatically when the app starts
  async onModuleInit() {
    //? Create Transporter
    this.transporter = nodemailer.createTransport({
      host: this.configService.getOrThrow<string>('mail.host'),
      port: this.configService.getOrThrow<number>('mail.port'),
      secure: false,
      auth: {
        user: this.configService.getOrThrow<string>('mail.user'),
        pass: this.configService.getOrThrow<string>('mail.password'),
      },
    });

    //? Verify SMTP Connection
    try {
      await this.transporter.verify();

      this.logger.log('SMTP connection established');
    } catch (error: any) {
      this.logger.error(
        'SMTP connection failed',
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  async sendMail(options: MailOptions) {
    //
  }
  //TODO: As the project grows, if email functionality expands (welcome emails, newsletters, verification, notifications).
}
