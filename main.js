const { app, BrowserWindow } = require('electron');
const path = require('path');
const process = require('process');

// Далее создаётся ссылка на объект Window. Это делается для того, чтобы окно не 
// закрывалось автоматически, когда объект будет обработан сборщиком мусора.
var mainWindow = null;

// При установке расширений, они возвращают имя, по которому их нужно будет удалить.
var reactDevTools = null;

app.on('ready', function () {
    // Так как используем React, установим react-dev-tools.
    if (process.env.NODE_DEV === 'true') {
        const {
            default: installExtension,
            REACT_DEVELOPER_TOOLS
        } = require('electron-devtools-installer');
        
        installExtension(REACT_DEVELOPER_TOOLS)
            .then((name) => {
                reactDevTools = name;
                console.log(`Added Extension:  ${name}`)
            })
            .catch((err) => console.log('An error occurred: ', err));
    }

    mainWindow = new BrowserWindow({
        width: 800,
        height: 600
    });
    mainWindow.loadURL(path.join('file://', __dirname, '/main.html'));
    mainWindow.on('closed', function () {
        mainWindow = null;
    });
});

app.on('window-all-closed', function () {
    // Следует удалить установленные расширения при выходе. Иначе они так и останутся
    // существовать навсегда, даже если будут больше не нужны.
    BrowserWindow.removeDevToolsExtension(reactDevTools);

    // При закрытии всех окон приложения следует из него выйти. В OS X это событие 
    // является общим для приложений и их баров меню, поэтому здесь присутствует условие, 
    // отбрасывающее эту платформу.
    if (process.platform !== 'darwin') app.quit();
});