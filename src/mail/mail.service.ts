import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { MailOptions } from './interfaces/mail-options.interface';

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

      throw error;
    }
  }

  //* Sending email
  async sendMail(options: MailOptions) {
    const from = this.configService.getOrThrow<string>('mail.from');

    await this.transporter.sendMail({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
  }
  //TODO: As the project grows, if email functionality expands (welcome emails, newsletters, verification, notifications).
}
