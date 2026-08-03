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

  //* Send OTP
  // Add this method inside your MailService class
  async sendOtpEmail(email: string, otp: string) {
    await this.sendMail({
      to: email,
      subject: 'Password Reset OTP',
      html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>Password Reset Request</h2>
        <p>Your One-Time Password (OTP) is:</p>
        <h1 style="color: #2563eb; letter-spacing: 5px;">${otp}</h1>
        <p>This code is valid for 10 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
      </div>
    `,
    });

    this.logger.log(`OTP email sent to ${email}`);
  }
  //TODO: As the project grows, if email functionality expands (welcome emails, newsletters, verification, notifications).
}
