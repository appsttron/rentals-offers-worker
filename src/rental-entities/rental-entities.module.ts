import { RentalEntitiesService } from './rental-entities.service';
import { RentalEntitiesDtoMapper } from './rental-entities.dto.mapper';
import { RentalEntitiesMongoRepository } from './rental-entities.mongo.repository';
import { rentalEntitiesProviders } from './rental-entities.provider';
import { DatabaseModule } from '../db-config/database.module';
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { EnvironmentConfigModule } from '../environment-config/environment-config.module';
import { RentalEntitiesQueueController } from './rental-entities.queue.controller';
import { rentalEntitiesMailProvider } from './rental-entities.mail.provider';

@Module({
  imports: [DatabaseModule, HttpModule, EnvironmentConfigModule],
  controllers: [RentalEntitiesQueueController],
  providers: [
    RentalEntitiesService,
    RentalEntitiesDtoMapper,
    RentalEntitiesMongoRepository,
    ...rentalEntitiesProviders,
    ...rentalEntitiesMailProvider,
  ],
})
export class RentalEntitiesModule {}
