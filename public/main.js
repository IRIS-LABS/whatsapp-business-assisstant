const { app, BrowserWindow, ipcMain } = require('electron');
const { Client, LocalAuth } = require('whatsapp-web.js');
const AUTH_DIR = "../WhatsApp_Web_Cache";

require('@electron/remote/main').initialize();

function createWindow() {
    // Create the browser window.
    const win = new BrowserWindow({
        title: "WhatsApp Business Assisstant",
        backgroundColor: "#ece5dd",
        minWidth: 900,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation: false,
        }
    })

    win.loadURL('http://localhost:3000')
}

app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
});

ipcMain.on("init-WhatsApp", (event, arg) => {
    console.log("INFO: Init WhatsApp...");
    try {
        let client
        client = new Client({
            authStrategy: new LocalAuth({
                dataPath: AUTH_DIR
            })
        });
        client.on('qr', (qr) => {
            // Generate and scan this code with your phone
            console.log("INFO: QR Code Sending To View...");
            event.reply('qr-code', qr);
            client.removeListener("qr", () => console.log("Listener Removed"))
        });

        client.on('ready', () => {
            console.log('INFO: Client is ready...');
            event.reply('ready', "Client Is ready");
        });

        client.on('authenticated', () => {
            console.log("INFO: Authenticated..");
        });

        client.on('message', msg => {
            msg.reply('Hi Bathalii!!!');
        });
        client.initialize();


    } catch (error) {
        console.log("ERROR: Initializing Client Failed...");
        process.exit();

    }

})

