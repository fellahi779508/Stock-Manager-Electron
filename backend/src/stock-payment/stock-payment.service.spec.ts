import { Test, TestingModule } from '@nestjs/testing';
import { StockPaymentService } from './stock-payment.service';

describe('StockPaymentService', () => {
  let service: StockPaymentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StockPaymentService],
    }).compile();

    service = module.get<StockPaymentService>(StockPaymentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
