import { remote } from 'electron' 
import * as fs from 'fs' 

const dialog = remote.dialog;

const appFilesFilters = [{
    extensions: ['gph'],
    name: 'graph'
}];

export function saveAs(contents: string): string {
    const file = dialog.showSaveDialog({
        defaultPath: 'new-graph',
        filters: appFilesFilters
    });

    if (!file) return '';

    fs.writeFileSync(file, contents);
    return file;
}

export function open(): string {
    const files = dialog.showOpenDialog({
        filters: appFilesFilters,
        properties: [
            'openFile'
        ]
    });

    if (!files.length) return '';

    return fs.readFileSync(files[0]).toString();
}