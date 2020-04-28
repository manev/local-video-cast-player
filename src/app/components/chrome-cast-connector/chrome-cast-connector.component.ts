import { Observable } from 'rxjs';
import { ChromeCastService } from './../../services/chrome-cast.service';
import { ChromeCastState } from './../connect.enum';
import { Component, NgZone, OnInit } from '@angular/core';

import { ipcRenderer } from 'electron';
import { MatMenu, MatMenuItem } from '@angular/material/menu';

@Component({
  selector: 'chrome-cast-connector',
  templateUrl: './chrome-cast-connector.component.html'
})
export class ChromeCastsConnectorComponent implements OnInit {

  ChromeCastState = ChromeCastState;

  chromeCastState$: Observable<ChromeCastState>;

  devices$: Observable<any>;

  selectedDevice: any;

  constructor(private readonly _chromeCastService: ChromeCastService) {
  }

  ngOnInit() {

    this.chromeCastState$ = this._chromeCastService.chromeCastState$;

    this.devices$ = this._chromeCastService.devices$;

    this._chromeCastService.init();
  }

  deviceSelected(device) {

    this.selectedDevice = device;

    this._chromeCastService.connectToDevice(device);
  }

  searchDevices() {

    this._chromeCastService.searchDevises();
  }

  diconnect() {
    this._chromeCastService.disconnect();
  }
}
