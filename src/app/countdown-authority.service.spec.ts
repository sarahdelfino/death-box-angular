import { TestBed } from '@angular/core/testing';

import { CountdownAuthorityService } from './countdown-authority.service';

describe('CountdownAuthorityService', () => {
  let service: CountdownAuthorityService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CountdownAuthorityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
