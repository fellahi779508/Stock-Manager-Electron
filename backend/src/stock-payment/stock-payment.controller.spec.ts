import { Test, TestingModule } from '@nestjs/testing';
import { StockPaymentController } from './stock-payment.controller';
import { StockPaymentService } from './stock-payment.service';

describe('StockPaymentController', () => {
  let controller: StockPaymentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StockPaymentController],
      providers: [StockPaymentService],
    }).compile();

    controller = module.get<StockPaymentController>(StockPaymentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
