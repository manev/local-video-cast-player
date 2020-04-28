import { Component, OnInit } from '@angular/core';

import { Observable } from 'rxjs';

import { ChromeCastService } from './services/chrome-cast.service';
import { PathSelectorService } from './services/path-selector.service';
import { PathModel } from './models/path.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {

  paths$: Observable<PathModel[]>;
  selectedPaths$: Observable<string>;

  selectedSubFileName;
  selectedVideoFile;

  isServerStarted = false;

  constructor(
    private readonly _chromeCastService: ChromeCastService,
    private readonly _pathSelector: PathSelectorService) {
  }

  ngOnInit() {

    this.paths$ = this._pathSelector.selectPaths$();

    this.selectedPaths$ = this._pathSelector.selectFullPaths$();

    this._pathSelector.loadDiskInfo();
  }

  fileSelected(path: string) {

    this._pathSelector.selectPath(path, selectedFilePath => {

      this.selectedVideoFile = `http://192.168.1.9:8080/videos/${encodeURI(selectedFilePath)}`;

      this._chromeCastService.play(selectedFilePath, '');
    });
  };

  goBack() {

    this._pathSelector.goBack();
  }
}
