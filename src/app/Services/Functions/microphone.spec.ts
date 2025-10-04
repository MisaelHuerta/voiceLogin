import { TestBed } from '@angular/core/testing';

import { Microphone } from './microphone';

describe('Microphone', () => {
  let service: Microphone;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Microphone);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
