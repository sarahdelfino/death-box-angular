import { TestBed } from '@angular/core/testing';

import { AnalyticsserviceService } from './analyticsservice.service';

describe('AnalyticsserviceService', () => {
  let service: AnalyticsserviceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnalyticsserviceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
