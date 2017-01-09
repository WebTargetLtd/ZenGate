/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { DbsettingsService } from './dbsettings.service';

describe('DbsettingsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DbsettingsService]
    });
  });

  it('should ...', inject([DbsettingsService], (service: DbsettingsService) => {
    expect(service).toBeTruthy();
  }));
});
