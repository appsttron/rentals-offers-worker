import { EnvironmentConfigService } from '../environment-config/environment-config.service';
import * as nodemailer from 'nodemailer';

export const rentalEntitiesMailProvider = [
  {
    provide: 'RENTAL_MAIL_PROVIDER',
    useFactory: (environmentConfigService: EnvironmentConfigService) =>
      nodemailer.createTransport({
        host: 'smtp-mail.outlook.com',
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
          user: environmentConfigService.getEmail(),
          pass: environmentConfigService.getEmailPass(),
        },
        logger: true,
      }),
    inject: [EnvironmentConfigService],
  },
];
