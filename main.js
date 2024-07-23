const { app, BrowserWindow, Menu} = require('electron');
const path = require('path');

const isMac = process.platform === 'darwin'
const isDev = process.platform.NODE_ENV !== 'development';

function createMainWindow(){
    const mainWindow = new BrowserWindow({
        title: 'Image Resizer',
        width: isDev ? 1000 : 500,
        height: '800',
        icon: __dirname + '/fdered.png',
    })

    //open devtools if in dev mode
    if(isDev){
        //mainWindow.webContents.openDevTools();
    }

    mainWindow.loadFile(path.join(__dirname,'./renderer/index.html'));
    //mainWindow.loadURL('https://www.calesa.cafe')
}



app.whenReady().then(()=>{
    createMainWindow();

    const mainMenu = Menu.buildFromTemplate(menu);    
    Menu.setApplicationMenu(mainMenu)

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
          createMainWindow()
        }
      })
});

app.on('window-all-closed', () => {
    if (isMac) {
      app.quit()
    }
})

const menu = [
    {
        label: 'File',
        submenu: [{
            label: 'Cerrar Sesion',
            click: ()=> {
                
            }
        },{
            label: 'Quit',
            click: ()=> app.quit(),
            accelerator: 'CmdOrCtrl+Q'
        }]
    }
]
