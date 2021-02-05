import { Injectable, NgZone } from '@angular/core';

import { ipcRenderer } from 'electron';

import { BehaviorSubject } from 'rxjs';
import { ChromeCastState } from '../components/chrome-cast-connector/connect.enum';

@Injectable({
  providedIn: 'root'
})
export class ChromeCastService {

  private readonly _chromeCastState$ = new BehaviorSubject<ChromeCastState>(ChromeCastState.NotConnected);

  private readonly _searchDevices$ = new BehaviorSubject<any>(null);

  get chromeCastState$() {

    return this._chromeCastState$.asObservable();
  }

  get devices$() {

    return this._searchDevices$.asObservable();
  }

  constructor(private readonly _ngZone: NgZone) {
  }

  init() {

    ipcRenderer.on('chrome-cast-search-result', (error, args) => {
      this._ngZone.run(() => {
        this._searchDevices$.next(args);
        this._chromeCastState$.next(ChromeCastState.DisplayAllDevices);
      })
    });

    ipcRenderer.on('chrome-cast-status-changed', (error, args) => {
      this._ngZone.run(() => {
        console.log('statuechaged');
      })
    });

    ipcRenderer.on('chrome-cast-connected', (error, args) => {
      this._ngZone.run(() => {
        this._chromeCastState$.next(ChromeCastState.Connected);
      })
    });

    ipcRenderer.on('start-media-success', (error, args) => {
      this._ngZone.run(() => {
        this._chromeCastState$.next(ChromeCastState.Connected);
      })
    });

    ipcRenderer.on('start-media-error', (error, args) => {
      this._ngZone.run(() => {
        this._chromeCastState$.next(ChromeCastState.ErrorConnecting);
      })
    });

    ipcRenderer.on('chrome-cast-disconnected', (error, args) => {
      this._ngZone.run(() => {
        this._chromeCastState$.next(ChromeCastState.NotConnected);
      })
    });
  }

  searchDevises() {

    this._chromeCastState$.next(ChromeCastState.Searching);

    ipcRenderer.send('chrome-cast-search');
  }

  connectToDevice(device) {

    if (device && device.host) {

      ipcRenderer.send('connect-to-device', { host: device.host });
    }
  }

  play(mediaUrl: string, subsUrl: string) {

    if (this._chromeCastState$.value === ChromeCastState.Connected) {

      ipcRenderer.send('play-media', { mediaURL: mediaUrl, subsUrl: subsUrl });
    }
  }

  disconnect() {

    ipcRenderer.send('disconnect-device');
  }

  seekTo(seconds) {

    ipcRenderer.send('seek-to', { time: seconds });
  }
}
