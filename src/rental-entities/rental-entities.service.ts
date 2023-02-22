import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateRentalEntityDto } from './dtos/create-rental-entity.dto';
import { RentalEntityDocument } from './rental-entities.schema';
import { UpdateRentalEntityStatusDto } from './dtos/update-rental-entity-status.dto';
import { RentalEntitiesDtoMapper } from './rental-entities.dto.mapper';
import { RentalEntitiesMongoRepository } from './rental-entities.mongo.repository';
import { HttpService } from '@nestjs/axios';
import { EnvironmentConfigService } from '../environment-config/environment-config.service';
import { Transporter } from 'nodemailer';

@Injectable()
export class RentalEntitiesService {
  constructor(
    private readonly httpService: HttpService,
    private readonly rentalEntitiesRepository: RentalEntitiesMongoRepository,
    private readonly rentalEntitiesDtoMapper: RentalEntitiesDtoMapper,
    private readonly environmentConfigService: EnvironmentConfigService,
    @Inject('RENTAL_MAIL_PROVIDER')
    private readonly emailTransporter: Transporter
  ) {}

  async syncCommand(url: string): Promise<any> {
    return new Promise((resolve) => {
      this.httpService.get(url).subscribe(async (r) => {
        await r.data.map(
          async (createRentalEntityDto: CreateRentalEntityDto) => {
            await this.httpService
              .post(
                `${this.environmentConfigService.getServiceEndpoint()}/rental-entities/queue`,
                { ...createRentalEntityDto },
                {
                  headers: {
                    api_key: this.environmentConfigService.getApiKey(),
                  },
                }
              )
              .subscribe();
          }
        );
        resolve(r.data);
      });
    });
  }

  async processRentalEntity(
    createRentalEntityDto: CreateRentalEntityDto
  ): Promise<any> {
    return new Promise(async (resolve) => {
      const existing = await this.findByPermit(createRentalEntityDto.permit);
      if (existing) {
        if (existing.permit_status !== createRentalEntityDto.permit_status) {
          await this.updateStatus({
            permit: createRentalEntityDto.permit,
            status: createRentalEntityDto.permit_status,
          });
          await this.sendEmail(createRentalEntityDto.address);
        }
      } else {
        await this.create(createRentalEntityDto);
        await this.sendEmail(createRentalEntityDto.address);
      }
      await setTimeout(() => resolve('Success'), 10000);
    });
  }

  async sendEmail(address: string) {
    const info = await this.emailTransporter.sendMail({
      to: 'oscar.rdoriguez2@asurion.com',
      subject: 'Communication Order',
      html: `${address}`,
    });

    console.log('Message sent: %s', info.messageId);
  }

  async create(
    createRentalEntityDto: CreateRentalEntityDto
  ): Promise<RentalEntityDocument> {
    return this.rentalEntitiesRepository.create(
      this.rentalEntitiesDtoMapper.mapCreateRentalEntity(createRentalEntityDto)
    );
  }

  async findByPermit(permit: string): Promise<RentalEntityDocument> {
    return this.rentalEntitiesRepository.findByPermit(permit);
  }

  async findAll(): Promise<RentalEntityDocument[]> {
    return this.rentalEntitiesRepository.findAll();
  }

  async delete(name: string): Promise<RentalEntityDocument> {
    return this.rentalEntitiesRepository.delete(name);
  }

  async updateStatus(
    updateConfigValueDto: UpdateRentalEntityStatusDto
  ): Promise<RentalEntityDocument> {
    return this.rentalEntitiesRepository
      .updateStatus(updateConfigValueDto.permit, updateConfigValueDto.status)
      .then((result) => {
        if (result) return result;
        else throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
      });
  }
}
