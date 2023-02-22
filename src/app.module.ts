import { Module } from '@nestjs/common';
import { EnvironmentConfigModule } from './environment-config/environment-config.module';
import { RentalEntitiesModule } from './rental-entities/rental-entities.module';
import {MockDataModule} from "./mock-data/mock-data.module";

@Module({
  imports: [EnvironmentConfigModule, RentalEntitiesModule, MockDataModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
