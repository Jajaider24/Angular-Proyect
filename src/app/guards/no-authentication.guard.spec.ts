import { TestBed } from '@angular/core/testing';

import { NoAuthenticationGuard } from './no-authentication.guard';

describe('NoAuthenticationGuard', () => {
  let guard: NoAuthenticationGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(NoAuthenticationGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
