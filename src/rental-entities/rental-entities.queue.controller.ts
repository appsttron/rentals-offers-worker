import {Controller} from '@nestjs/common';
import { RentalEntitiesService } from './rental-entities.service';
import { CreateRentalEntityDto } from './dtos/create-rental-entity.dto';
import {Ctx, EventPattern, MessagePattern, Payload, RmqContext} from "@nestjs/microservices";

@Controller()
export class RentalEntitiesQueueController {
    constructor(private readonly rentalEntityService: RentalEntitiesService) {}

    @MessagePattern('SyncCommand')
    async syncCommand(@Payload() data: any,  @Ctx() context: RmqContext) {
        const result = await this.rentalEntityService.syncCommand((JSON.parse(data) as {url: string}).url);
        const channel = context.getChannelRef();
        const originalMsg = context.getMessage();
        channel.ack(originalMsg);
        return result;
    }

    @MessagePattern('CreateRentalEntityDto')
    processRentalEntity(@Payload() data: any,  @Ctx() context: RmqContext) {
        this.rentalEntityService.processRentalEntity(JSON.parse(data) as CreateRentalEntityDto).then(
            () => {
                const channel = context.getChannelRef();
                const originalMsg = context.getMessage();
                channel.ack(originalMsg);
            }
        );
    }
}
