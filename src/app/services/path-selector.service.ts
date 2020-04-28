import { PathModel } from './../models/path.model';
import { Injectable, NgZone } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

const remote = require('electron').remote;
const fs = remote.require('fs');
const { execSync } = remote.require('child_process');

@Injectable({
    providedIn: 'root'
})
export class PathSelectorService {

    // private readonly LINUX_COMMAND: string = 'df -P | awk \'NR > 1\'';
    /// cristiammercado /node-disk-info
    // private readonly DARWIN_COMMAND: string = 'df -P | awk \'NR > 1\'';

    private readonly WINDOWS_COMMAND = 'wmic logicaldisk get name';

    private readonly _readFiles$ = new BehaviorSubject<PathModel[]>([]);
    private readonly _selectFullPaths$ = new BehaviorSubject<string>('');

    private readonly _pathStack = [];

    constructor(private readonly _zone: NgZone) {
    }

    loadDiskInfo() {

        const res = execSync(this.WINDOWS_COMMAND)
            .toString()
            .replace('Name', '')
            .trim()
            .split('\r\n')
            .map(s => ({ path: s.trim(), isFolder: true }));

        this._zone.run(() => this._readFiles$.next(res));
    }

    selectPaths$ = () => this._readFiles$.asObservable();

    selectFullPaths$ = () => this._selectFullPaths$.asObservable();

    loadFiles$(folderPath: string) {

        fs.readdir(folderPath, (errors, files) => {

            if (errors) {

                this._zone.run(() => this._readFiles$.error(errors));

            } else {

                this._zone.run(() => this._readFiles$.next(files.map(f => ({
                    path: f.trim(),
                    isFolder: this.isFolder(f)
                }))));
            }
        });
    }

    selectPath(path: string = '', calback: Function = null) {

        if (!!path) {

            this._pathStack.push(path + '\\');
        }

        const selectedPath = this._pathStack.join('\\');

        this._selectFullPaths$.next(this._pathStack.join(' > '));

        if (!selectedPath || this._pathStack.length === 0) {

            this.loadDiskInfo();

        } else {

            fs.lstat(selectedPath, (error, state) => {

                if (state.isDirectory()) {

                    this._zone.run(() => this.loadFiles$(selectedPath));

                } else if (state.isFile()) {

                    this._pathStack.pop();

                    this._zone.run(() => calback(selectedPath));

                } else if (state.isSymbolicLink()) {

                    this._pathStack.pop();
                }
            });
        }
    }

    goBack() {

        this._pathStack.pop();

        this.selectPath();
    }

    private isFolder(path) {

        const fullPath = this._pathStack.join('\\');

        try {
            return fs.statSync(fullPath + '\\' + path.trim()).isDirectory();
        }
        catch {
            return false;
        }
    }
}