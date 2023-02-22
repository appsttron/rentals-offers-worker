import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {MicroserviceOptions, Transport} from "@nestjs/microservices";
import {EnvironmentConfigService} from "./environment-config/environment-config.service";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.enableCors();
    const environmentConfigService = app.get<EnvironmentConfigService>(EnvironmentConfigService);
    app.connectMicroservice<MicroserviceOptions>(
        {
            transport: Transport.RMQ,
            options: {
                urls: [environmentConfigService.getRMQUrl()],
                queue: environmentConfigService.getRMQQueueName(),
                prefetchCount: 1,
                noAck: false,
                queueOptions: { durable: true },
            },
        },
    );
    await app.startAllMicroservices();
    await app.listen(3001);
}
bootstrap();
