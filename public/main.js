const fs = require("fs/promises")
const { app, BrowserWindow, ipcMain } = require('electron');
const { Client, MessageMedia, LocalAuth } = require('whatsapp-web.js');

const AUTH_DIR = "../WhatsApp_Web_Cache";
const DATA_DIR = "./data/";
const RESPONSES_FILE_NAME = DATA_DIR + "responses.json";
const CONTACTS_FILE_NAME = DATA_DIR + "contacts.json";

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


// Handling Files
const dirExists = async (dirName) => {
    try {
        await fs.access(dirName);
        return true;
    } catch (error) {
        return false;
    }
};

const fileExists = async (fileName) => dirExists(fileName)


const getFileData = async (fileName) => {
    try {
        const data = await fs.readFile(fileName);
        if (!data || !data.length) return [true, null]
        return [true, JSON.parse(data)];
    } catch (error) {
        console.log("DEBUG: File Read Error", error);
        return [false, {}];
    }
};

const getFileExtension = (fileName) => {
    const index = fileName.indexOf(".");
    return fileName.substring(index);
};


//Handling Responses
const addResponse = async (data, files) => {
    try {
        let writeObject;
        let newResponse = { ...data };
        if (files.length > 0) newResponse["hasMedia"] = true

        const dataDirExists = await dirExists(DATA_DIR);
        console.log("DEBUG: Data Dir Exists: ", dataDirExists);

        if (!dataDirExists) await fs.mkdir(DATA_DIR)

        const responsesExists = await fileExists(RESPONSES_FILE_NAME);
        console.log("DEBUG: Data Dir Exists: ", dataDirExists);

        if (!responsesExists) writeObject = [{ ...newResponse, selected: true }]

        else {
            const [readSuccess, fileData] = await getFileData(RESPONSES_FILE_NAME);
            console.log("DEBUG: Read Success: ", readSuccess);
            if (!readSuccess) return false
            writeObject = [...fileData, newResponse];
        }

        console.log("DEBUG: Write Data: ", writeObject);

        if (newResponse.hasMedia) {
            const filesPath = DATA_DIR + newResponse.name;
            await fs.mkdir(filesPath);
            let count = 1;
            for (let file of files) {
                const extension = getFileExtension(file.name);
                const targetFilePath = `${filesPath}/${count++}${extension}`;
                await fs.copyFile(file.path, targetFilePath);
            }
        }

        await fs.writeFile(RESPONSES_FILE_NAME, JSON.stringify(writeObject, null, 4));
        console.log("INFO: New Response Successfully Written To File...");
        return true;
    } catch (error) {
        console.log("ERROR: Error In Writing New Response To File ", error);
        return false
    }
};

const saveResponses = async (responses) => {
    try {
        await fs.writeFile(RESPONSES_FILE_NAME, JSON.stringify(responses, null, 4));
        return true;
    } catch (error) {
        console.log("ERROR: Error Saving Responses...", error);
        return false
    }
};

const getSelectedResponse = (responses) => {
    for (let element of responses) {
        selected = element["selected"]
        if (selected) return element
    }
    console.log("ERROR: No Selected Response Found");
};

//Contacts
const contactExists = async ({ phoneNumber }) => {
    try {
        const dataExists = await dirExists(DATA_DIR);
        if (!dataExists) return false

        const contactsFileExists = await fileExists(CONTACTS_FILE_NAME);
        if (!contactsFileExists) return false

        const [readSuccess, fileData] = await getFileData(CONTACTS_FILE_NAME);
        if (!readSuccess) return false

        const index = fileData.findIndex(c => c.phoneNumber === phoneNumber)

        return index !== -1;

    } catch (error) {
        console.log("ERROR: Error Occured When Checking Contact Existance...");
        return false;
    }
};

const saveContact = async (contact) => {
    try {
        let writeObject;
        const dataExists = await dirExists(DATA_DIR);
        if (!dataExists) await fs.mkdir(DATA_DIR)

        const contactsFileExists = await fileExists(CONTACTS_FILE_NAME);
        if (!contactsFileExists) writeObject = [contact]

        else {
            const [readSuccess, fileData] = await getFileData(CONTACTS_FILE_NAME);
            if (readSuccess) writeObject = [...fileData, contact];
        }
        await fs.writeFile(CONTACTS_FILE_NAME, JSON.stringify(writeObject, null, 4));
        console.log("INFO: Contact Saved Successfully...");
    } catch (error) {
        console.log("ERROR: Error Occured When Saving Contact:", error);
    }
}

//Responses Events
ipcMain.on("select-response", async (event, data) => {
    console.log("INFO: Initiate Select Response: ", data)
    const saved = await saveResponses(data);

    if (saved) {
        console.log("INFO: Select Saved Success...");
        event.reply("response-selected", data);
    } else {
        console.log("ERROR: Select Save Failed...");
        event.reply("response-select-failed");
    }
});

ipcMain.on("add-response", async (event, { data, files }) => {
    console.log("INFO: Initiate Add Response: ", data);
    const saved = await addResponse(data, files);

    if (saved) {
        console.log("INFO: Response Add Success...");
        event.reply("response-added", data);
    } else {
        console.log("ERROR: Response Add Failed...");
        event.reply("response-add-failed");
    }
});

ipcMain.on("load-responses", async (event, data) => {
    const [loadSuccess, responses] = await getFileData(RESPONSES_FILE_NAME)
    if (!loadSuccess) event.reply("responses-load-failed", "Load Failed")
    else event.reply("responses-loaded", { responses, selectedResponse: getSelectedResponse(responses) })
});

//WhatsApp Web Events
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
            const chat = await msg.getChat();
            const contact = await chat.getContact();
            const contactData = {
                name: contact.pushname,
                phoneNumber: contact.number
            };

            const exists = await contactExists(contactData);
            if (exists) return

            await saveContact(contactData);
            const [loadSuccess, responses] = await getFileData(RESPONSES_FILE_NAME);

            if (!loadSuccess) {
                msg.reply('Hi! Thank You For Messaging...');
                return
            }

            try {
                const selectedResponse = getSelectedResponse(responses);
                msg.reply(selectedResponse.message);
                if (!selectedResponse.hasMedia) return

                const dirName = `${DATA_DIR}${selectedResponse.name}/`;
                const files = await fs.readdir(dirName);
                for (let file of files) {
                    const media = MessageMedia.fromFilePath(`${dirName}${file}`);
                    chat.sendMessage(media);
                };

                console.log("INFO: Replied To First Message...")
            } catch (error) {
                console.log("ERROR: Error Occured Replying To First Message ", error);
                msg.reply('Hi! Thank You For Messaging...');
            }
        });
        client.initialize();


    } catch (error) {
        console.log("ERROR: Initializing Client Failed...");
        process.exit();
    }
})

