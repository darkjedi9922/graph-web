var app = require('electron').app;
var BrowserWindow = require('electron').BrowserWindow;
var path = require('path');

// Далее создаётся ссылка на объект Window. Это делается для того, чтобы окно не 
// закрывалось автоматически, когда объект будет обработан сборщиком мусора.
var mainWindow = null;

// При закрытии всех окон приложения следует из него выйти. В OS X это событие 
// является общим для приложений и их баров меню, поэтому здесь присутствует условие, 
// отбрасывающее эту платформу.
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('ready', function () {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600
    });
    mainWindow.loadURL(path.join('file://', __dirname, '/index.html'));
    mainWindow.on('closed', function () {
        mainWindow = null;
    });
});