import { remote } from 'electron' 
import * as fs from 'fs' 

const dialog = remote.dialog;

const appFilesFilters = [{
    extensions: ['gph'],
    name: 'graph'
}];

/**
 * If saving was cancelled, returns an empty string.
 */
export function saveAs(contents: string): string {
    const file = dialog.showSaveDialog({
        defaultPath: 'new-graph',
        filters: appFilesFilters
    });

    if (!file) return '';

    fs.writeFileSync(file, contents);
    return file;
}

/**
 * If opening was cancelled, returns null.
 */
export function open(): {
    file: string,
    contents: string
} | null {
    const files = dialog.showOpenDialog({
        filters: appFilesFilters,
        properties: [
            'openFile'
        ]
    });

    if (!files.length) return null;

    return {
        file: files[0],
        contents: fs.readFileSync(files[0]).toString()
    };
}