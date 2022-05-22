const fs = require("fs/promises")
const { app, BrowserWindow, ipcMain } = require('electron');
const { Client, LocalAuth } = require('whatsapp-web.js');

const AUTH_DIR = "../WhatsApp_Web_Cache";
const DATA_DIR = "./data/";
const RESPONSES_FILE_NAME = DATA_DIR + "responses.json";

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

const fileExists = async (fileName) => {
    try {
        await fs.access(fileName);
        return true;
    } catch (error) {
        return false;
    }
};


const getFileData = async (fileName) => {
    try {
        const data = await fs.readFile(fileName);
        console.log("DEBUG: File Data: ", data);
        if (!data || !data.length) return [true, null]
        return [true, JSON.parse(data)];
    } catch (error) {
        console.log("DEBUG: File Read Error", error)
        return [false, {}];
    }
}

const addResponse = async (data) => {
    try {
        let writeObject;
        const exists = await fileExists(RESPONSES_FILE_NAME)
        console.log("DEBUG: File Exists: ", exists);
        if (exists) {
            const [readSuccess, fileData] = await getFileData(RESPONSES_FILE_NAME);
            console.log("DEBUG: Read Success: ", readSuccess);
            if (!readSuccess) return false
            if (!fileData) {
                writeObject = [{ ...data, selected: true }];
            } else {
                writeObject = [...fileData, data];
                console.log("DEBUG: Write Data: ", writeObject)
            }
        }
        await fs.writeFile(RESPONSES_FILE_NAME, JSON.stringify(writeObject, null, 4));
        return true;
    } catch (error) {
        console.log("ERROR: ", error);
        return false
    }
};


const getSelectedResponse = (data) => {
    for (let element of data) {
        selected = element["selected"]
        if (selected) {
            return element
        }
    }
};

const saveResponses = async (data) => {
    try {
        console.log("DEBUG: Data: ", data);
        console.log("DEBUG: Type:", JSON.stringify(data, null, 4))
        await fs.writeFile(RESPONSES_FILE_NAME, JSON.stringify(data, null, 4));
        return true;
    } catch (error) {
        console.log("ERROR: ", error);
        return false
    }
}

ipcMain.on("select-response", async (event, data) => {
    console.log("INFO: Starting To Save To File: ", data)
    const saved = await saveResponses(data);
    console.log("DEBUG: Saved", saved)
    if (saved) {
        console.log("INFO:Saved");
        event.reply("response-selected", data);
    } else {
        console.log("ERROR: Not Saved");
        event.reply("response-select-failed");
    }
});

ipcMain.on("add-response", async (event, data) => {
    console.log("INFO: Starting To Save To File: ", data)
    const saved = await addResponse(data);
    console.log("DEBUG: Saved", saved)
    if (saved) {
        console.log("INFO:Saved");
        event.reply("response-added", data);
    } else {
        console.log("ERROR: Not Saved");
        event.reply("response-add-failed");
    }
});

ipcMain.on("load-responses", async (event, data) => {
    const [loadSuccess, responses] = await getFileData(RESPONSES_FILE_NAME)
    if (!loadSuccess) {
        event.reply("responses-load-failed", "Load Failed")
    } else {
        event.reply("responses-loaded", { responses, selectedResponse: getSelectedResponse(responses) })
    }
});

ipcMain.on("init-WhatsApp", (event, data) => {
    console.log("INFO: Init WhatsApp...");
    try {
        let client
        client = new Client({
            puppeteer: {
                headless: false
            },
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
        client.on('disconnected', () => {
            console.log('INFO: Disconnected...');
        });

        client.on('authenticated', () => {
            console.log("INFO: Authenticated..");
            event.reply("authenticated", "Successfully Authenticated...")
        });

        client.on('auth_failure', () => {
            console.log("INFO: Auth Failed..");
            event.reply("auth-failed", "Auth Failed...")
        });

        client.on('message', async (msg) => {
            const [loadSuccess, responses] = await getFileData(RESPONSES_FILE_NAME)
            if (loadSuccess) {
                const selectedResponse = getSelectedResponse(responses);
                msg.reply(selectedResponse.message)
            }
            else {
                msg.reply('Hi');
            }

        });
        client.initialize();


    } catch (error) {
        console.log("ERROR: Initializing Client Failed...");
        process.exit();

    }

})

