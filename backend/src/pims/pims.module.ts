import { Module } from '@nestjs/common';
import { PimsService } from './pims.service';
import { RapidOneAdapter } from './adapters/rapidone.adapter';
import { PrizaAdapter } from './adapters/priza.adapter';
import { ProvetAdapter } from './adapters/provet.adapter';
import { DigitailAdapter } from './adapters/digitail.adapter';

@Module({
  providers: [PimsService, RapidOneAdapter, PrizaAdapter, ProvetAdapter, DigitailAdapter],
  exports: [PimsService],
})
export class PimsModule {}
