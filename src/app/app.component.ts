import { Component, OnInit } from '@angular/core';

import { Observable } from 'rxjs';

import { ChromeCastService } from './services/chrome-cast.service';
import { PathSelectorService } from './services/path-selector.service';
import { PathModel } from './models/path.model';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {

  paths$: Observable<PathModel[]>;
  breadcrumb$: Observable<string>;

  selectedSubFileName;
  selectedVideoFile;

  isServerStarted = false;

  constructor(
    private readonly _chromeCastService: ChromeCastService,
    private readonly _pathSelector: PathSelectorService,
    private readonly _sanitizer: DomSanitizer) {
  }

  ngOnInit() {

    this.paths$ = this._pathSelector.selectPaths$();

    this.breadcrumb$ = this._pathSelector.selectFullPaths$();

    this._pathSelector.loadDiskInfo();
  }

  fileSelected(path: string) {

    this._pathSelector.selectPath(path, selectedFilePath => {

      this.selectedVideoFile = this._sanitizer.bypassSecurityTrustResourceUrl(`http://192.168.1.96:8080/videos/${encodeURI(selectedFilePath)}`);

      this._chromeCastService.play(selectedFilePath, '');
    });
  };

  goBack() {

    this._pathSelector.goBack();
  }

  seekTo() {
    this._chromeCastService.seekTo(3000);
  }
}
