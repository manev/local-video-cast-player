import { Injectable, NgZone } from '@angular/core';

import { ipcRenderer } from 'electron';
import { ChromeCastState } from '../components/connect.enum';
import { BehaviorSubject, Observable } from 'rxjs';

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

    ipcRenderer.send('connect-to-device', { host: device.host });
  }

  play(mediaUrl: string, subsUrl: string) {

    ipcRenderer.send('play-media', { mediaURL: mediaUrl, subsUrl: subsUrl });

    // const subUrl = `${this._folderName}\\Mr.Robot.S04E09.WEB.h264-TBS.srt`;

    // // this._chromeCast.connect(fullVideoPath, subUrl);

    // this.selectedFileName = `http://192.168.1.9:8080/videos/${encodeURI(fullVideoPath)}`;

    // this.selectedSubFileName = `http://192.168.1.9:8080/subs/${encodeURI(subUrl)}`;
  }

  disconnect() {

    ipcRenderer.send('disconnect-device');
  }
}
