const fs = require("fs/promises");
const path = require('path');
const isDev = require('electron-is-dev');
const { app, BrowserWindow, ipcMain } = require('electron');
const log = require("electron-log");
const { Client, MessageMedia, LocalAuth } = require('whatsapp-web.js');

const AUTH_DIR = "./WhatsApp_Web_Cache";
const DATA_DIR = "./data/";
const KEYWORDS_DIR = `${DATA_DIR}keywordMessages/`;
const RESPONSES_FILE_NAME = DATA_DIR + "responses.json";
const CONTACTS_FILE_NAME = DATA_DIR + "contacts.json";
const SETTINGS_FILE_NAME = DATA_DIR + "settings.json";

require('@electron/remote/main').initialize();

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
        log.debug("DEBUG: File Read Error", error);
        return [false, {}];
    }
};

const getFileExtension = (fileName) => {
    const index = fileName.indexOf(".");
    return fileName.substring(index);
};


const deleteResponseMedia = async (responseName) => {
    const dirName = `${DATA_DIR}${responseName}`;
    const exists = await dirExists(dirName);
    if (!exists) return true

    try {
        await fs.rm(dirName, { force: true, recursive: true });
        log.info("INFO: Response Media Deleted Successfully...");
        return true;
    } catch (error) {
        log.error("ERROR: Response Media Delete Failed...", error);
        return false;
    }
};

const deleteKeywordMedia = async (responseName, keyword) => {
    const dirName = `${KEYWORDS_DIR}${responseName}${keyword}`;
    const exists = await dirExists(dirName);
    if (!exists) return true

    try {
        await fs.rm(dirName, { force: true, recursive: true });
        log.info("INFO: Keyword Media Deleted Successfully...");
        return true;
    } catch (error) {
        log.error("ERROR: Keyword Media Delete Failed...", error);
        return false;
    }
};

function createWindow() {
    // Create the browser window.
    const win = new BrowserWindow({
        title: "WhatsApp Business Assisstant",
        backgroundColor: "#ece5dd",
        minWidth: 900,
        minHeight: 600,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation: false
        }
    })

    win.loadURL(
        isDev
            ? 'http://localhost:3000'
            : `file://${path.join(__dirname, '../build/index.html')}`
    )
}

app.on('ready', async () => {
    try {
        const dataDirExists = await dirExists(DATA_DIR);
        if (!dataDirExists) await fs.mkdir(DATA_DIR);
        const responsesExists = await fileExists(RESPONSES_FILE_NAME);
        if (!responsesExists) {
            let writeObject = [{
                name: "Default",
                message: "Hi! Thank you for reaching out...",
                selected: true
            }];
            await fs.writeFile(RESPONSES_FILE_NAME, JSON.stringify(writeObject, null, 4));
        };

        const settingsExists = await fileExists(SETTINGS_FILE_NAME);
        if (!settingsExists) {
            let writeObject = {
                showBrowser: true,
                pathToChrome: ""
            };
            await fs.writeFile(SETTINGS_FILE_NAME, JSON.stringify(writeObject, null, 4));
        };

        const contactsExists = await fileExists(CONTACTS_FILE_NAME);
        if (!contactsExists) {
            let writeObject = [];
            await fs.writeFile(CONTACTS_FILE_NAME, JSON.stringify(writeObject, null, 4));
        };

        if (!responsesExists) {
            let writeObject = [{
                name: "Default",
                message: "Hi! Thank you for reaching out...",
                selected: true
            }];
            await fs.writeFile(RESPONSES_FILE_NAME, JSON.stringify(writeObject, null, 4));
        }
    } catch (error) {
        log.error("ERROR: Error Writing Default Data: ", error);
    }

    createWindow();
})

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

//Handling Settings
const saveSettings = async (settings) => {
    try {
        await fs.writeFile(SETTINGS_FILE_NAME, JSON.stringify(settings, null, 4));
        return true;
    } catch (error) {
        log.error("ERROR: Error Saving Settings...", error);
        return false
    }
};

//Handling Responses
const addResponse = async (data, files) => {
    try {
        let writeObject;
        let newResponse = { ...data };
        if (files.length > 0) newResponse["hasMedia"] = true

        const dataDirExists = await dirExists(DATA_DIR);
        log.debug("DEBUG: Data Dir Exists: ", dataDirExists);

        if (!dataDirExists) await fs.mkdir(DATA_DIR)

        const responsesExists = await fileExists(RESPONSES_FILE_NAME);
        log.debug("DEBUG: Data Dir Exists: ", dataDirExists);

        if (!responsesExists) writeObject = [{ ...newResponse, selected: true }]

        else {
            const [readSuccess, fileData] = await getFileData(RESPONSES_FILE_NAME);
            log.debug("DEBUG: Read Success: ", readSuccess);
            if (!readSuccess) return false
            writeObject = [...fileData, newResponse];
        }

        log.debug("DEBUG: Write Data: ", writeObject);

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
        log.info("INFO: New Response Successfully Written To File...");
        return true;
    } catch (error) {
        log.error("ERROR: Error In Writing New Response To File ", error);
        return false
    }
};

const saveResponses = async (responses) => {
    try {
        await fs.writeFile(RESPONSES_FILE_NAME, JSON.stringify(responses, null, 4));
        return true;
    } catch (error) {
        log.error("ERROR: Error Saving Responses...", error);
        return false
    }
};

const getSelectedResponse = (responses) => {
    for (let element of responses) {
        selected = element["selected"]
        if (selected) return element
    }
    log.error("ERROR: No Selected Response Found");
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
        log.error("ERROR: Error Occured When Checking Contact Existance...:", error);
        return false;
    }
};

const saveContact = async (contact) => {
    try {
        console.log("DEBUG: Saving Contact:", contact);
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
        log.info("INFO: Contact Saved Successfully...");
    } catch (error) {
        log.error("ERROR: Error Occured When Saving Contact:", error);
    }
}

ipcMain.on("restart-app", () => {
    log.debug("DEBUG: Relaunch Kicked In")
    app.relaunch();
    app.quit();
});

//Responses Events
ipcMain.on("select-response", async (event, data) => {
    log.info("INFO: Initiate Select Response: ", data)
    const saved = await saveResponses(data);

    if (saved) {
        log.info("INFO: Select Saved Success...");
        event.reply("response-selected", data);
    } else {
        log.error("ERROR: Select Save Failed...");
        event.reply("response-select-failed");
    }
});

ipcMain.on("add-response", async (event, { data, files }) => {
    log.info("INFO: Initiate Add Response: ", data);
    const saved = await addResponse(data, files);

    if (saved) {
        log.info("INFO: Response Add Success...");
        event.reply("response-added", data);
    } else {
        log.error("ERROR: Response Add Failed...");
        event.reply("response-add-failed");
    }
});

ipcMain.on("load-responses", async (event, data) => {
    const [loadSuccess, responses] = await getFileData(RESPONSES_FILE_NAME);
    // let index = 0;
    // for (let response of responses) {
    //     let files = [];
    //     if (response.hasMedia) {
    //         try {
    //             const dirName = `${DATA_DIR}${response.name}/`;
    //             const fileNames = await fs.readdir(dirName);
    //             for (let fileName of fileNames) {
    //                 let file = new LocalFileData(dirName + fileName);
    //                 console.log("DEBUG: File: ", file);
    //                 files.push(file);
    //             }
    //         } catch (error) {
    //             console.log("ERROR: Error occured getting file names of media directory...", error);
    //         }

    //     }
    //     responses[index]["files"] = files;
    //     index++;
    // }
    // console.log("DEBUG: Responses: ", responses);
    if (!loadSuccess) event.reply("responses-load-failed", "Load Failed")
    else event.reply("responses-loaded", { responses, selectedResponse: getSelectedResponse(responses) })
});


ipcMain.on("delete-response", async (event, response) => {
    let deleteSuccess = false;
    const [loadSuccess, responses] = await getFileData(RESPONSES_FILE_NAME);
    let newResponses = [];
    if (loadSuccess) {
        newResponses = responses.filter(r => r.name !== response.name);
        const saved = await saveResponses(newResponses);
        const deleted = await deleteResponseMedia(response.name);
        deleteSuccess = saved && deleted;
    }

    if (deleteSuccess) event.reply("response-deleted", newResponses)
    else event.reply("response-delete-failed")

});

ipcMain.on("update-responses", async (event, { responses }) => {
    console.log("INFO: Initiate Update Response: ", responses);
    const saved = await saveResponses(responses);

    if (saved) {
        log.info("INFO: Response Update Success...");
        event.reply("response-updated", responses);
    } else {
        log.error("ERROR: Response Update Failed...");
        event.reply("response-update-failed");
    }
})

//Keyword Messages
ipcMain.on("add-keyword-message", async (event, { newResponse, keywordMessage, files }) => {
    console.log("INFO: Initiate Add Keyword Message: ", newResponse);
    console.log("INFO: Files: ", files);

    try {
        const [readSuccess, responses] = await getFileData(RESPONSES_FILE_NAME);
        if (readSuccess) {
            const index = responses.findIndex(r => r.name === newResponse.name);
            const updatedResponses = [...responses];
            if (index === -1) {
                log.error("Response not found when adding keyword...")
                event.reply("keyword-message-add-failed");
                return;
            }
            updatedResponses[index] = { ...newResponse }
            const saved = await saveResponses(updatedResponses);

            if (keywordMessage.hasMedia) {
                const keywordDirExists = await dirExists(KEYWORDS_DIR);
                log.debug("DEBUG: Keyword Dir Exists: ", keywordDirExists);

                if (!keywordDirExists) await fs.mkdir(KEYWORDS_DIR);
                const responseDirName = `${KEYWORDS_DIR}${newResponse.name}/`;
                const responseDirExists = await dirExists(responseDirName);
                log.debug("DEBUG: Response Dir Exists: ", responseDirExists);

                if (!responseDirExists) await fs.mkdir(responseDirName)

                const responseKeywordDirName = `${responseDirName}${keywordMessage.keyword}/`;
                const responseKeywordDirExists = await dirExists(responseKeywordDirName);
                if (!responseKeywordDirExists) await fs.mkdir(responseKeywordDirName);
                const filesPath = responseKeywordDirName;
                let count = 1;
                for (let file of files) {
                    const extension = getFileExtension(file.name);
                    const targetFilePath = `${filesPath}/${count++}${extension}`;
                    await fs.copyFile(file.path, targetFilePath);
                }
            }
            if (saved) event.reply("keyword-message-add-success")
            else {
                log.error("Error Adding Keyword Message");
                event.reply("keyword-message-add-failed");
            }

        } else {
            event.reply("keyword-message-add-failed");
        }
    } catch (e) {
        log.error("Error Adding Keyword Message", e);
        event.reply("keyword-message-add-failed")
    }
});

ipcMain.on("delete-keyword-message", async (event, { keyword, responseName, hasMedia }) => {


    try {
        let deleteSuccess;
        if (hasMedia)
            deleteSuccess = await deleteKeywordMedia(responseName, keyword);

        const [readSuccess, responses] = await getFileData(RESPONSES_FILE_NAME);
        if (!readSuccess) {
            log.error("Couldn't read responses...");
            event.reply("keyword-message-delete-failed")
        }
        const updatedResponses = [...responses];
        const index = responses.findIndex(r => r.name === responseName);
        const newResponse = { ...responses[index] };
        const keywordMessages = [...responses[index]["keywordMessages"]];
        const updatedKeywordMessages = keywordMessages.filter(km => km.keyword !== keyword);
        newResponse["keywordMessages"] = updatedKeywordMessages;
        updatedResponses[index] = newResponse;

        const saved = await saveResponses(updatedResponses);
        if (saved) {
            event.reply("keyword-message-delete-success");
            return;
        }
        event.reply("keyword-message-delete-failed")


    } catch (e) {
        log.error("Error Delete Keyword Message", e);
        event.reply("keyword-message-delete-failed")
    }
});

ipcMain.on("edit-keyword-message", async (event, updatedResponse) => {
    try {
        const [readSuccess, responses] = await getFileData(RESPONSES_FILE_NAME);
        if (!readSuccess) {
            event.reply("keyword-message-edit-failed");
            return;
        }
        const updated = [...responses];
        const index = updated.findIndex(r => r.name === updatedResponse.name);
        updated[index] = updatedResponse;
        const saved = await saveResponses(updated);
        if (saved) {
            event.reply("keyword-message-edit-success")
            return
        }
        event.reply("keyword-message-edit-failed")

    } catch (e) {
        log.error("Error Edit Keyword Message", e);
        event.reply("keyword-message-edit-failed")
    }
});


//Contacts Events
ipcMain.on("load-contacts", async (event, data) => {
    const [loadSuccess, contacts] = await getFileData(CONTACTS_FILE_NAME);
    if (!loadSuccess) event.reply("contacts-load-failed", "Load Failed");
    else event.reply("contacts-loaded", contacts);
});

//WhatsApp Web Events
ipcMain.on("init-WhatsApp", async (event, data) => {
    log.info("INFO: Init WhatsApp...");
    const [readSuccess, fileData] = await getFileData(SETTINGS_FILE_NAME);
    let puppeteerObject = {
        headless: false,

    };
    if (readSuccess) {
        puppeteerObject.headless = !fileData.showBrowser
        let path = fileData.pathToChrome;
        if (path && path !== "") puppeteerObject["executablePath"] = path
    }
    if (!puppeteerObject.executablePath) {
        const PCR = require("puppeteer-chromium-resolver");
        const option = {
            revision: "",
            detectionPath: "",
            folderName: ".chromium-browser-snapshots",
            defaultHosts: ["https://storage.googleapis.com", "https://npm.taobao.org/mirrors"],
            hosts: [],
            cacheRevisions: 2,
            retry: 3,
            silent: false
        };
        const stats = await PCR(option);
        puppeteerObject["executablePath"] = stats.executablePath;
    }
    try {
        let client
        client = new Client({
            puppeteer: { ...puppeteerObject },
            authStrategy: new LocalAuth({
                dataPath: AUTH_DIR
            })
        });
        client.on('qr', (qr) => {
            // Generate and scan this code with your phone
            log.info("INFO: QR Code Sending To View...");
            event.reply('qr-code', qr);
        });

        client.on('ready', async () => {
            log.info('INFO: Client is ready...');

            const contacts = await client.getContacts();
            const index = contacts.findIndex(c => c.isMe);
            const myAccount = contacts[index];
            // log.info("INFO: My Account: ", myAccount);
            const auth = {
                name: myAccount.pushname,
                phoneNumber: myAccount.id.user
            };

            event.reply('user-recieved', auth);

        });
        client.on('disconnected', () => {
            log.info('INFO: Disconnected...');
        });

        client.on('authenticated', async () => {
            log.info("INFO: Authenticated..");
            event.reply("authenticated", "Successfully Authenticated...")
        });

        client.on('auth_failure', () => {
            log.info("INFO: Auth Failed..");
            event.reply("auth-failed", "Auth Failed...")
        });

        client.on('message', async (msg) => {
            console.log("INFO: Message Body: ", msg.body);
            const chat = await msg.getChat();
            const contact = await chat.getContact();
            const contactData = {
                name: contact.pushname,
                phoneNumber: contact.number
            };

            const exists = await contactExists(contactData);
            const [loadSuccess, responses] = await getFileData(RESPONSES_FILE_NAME);

            if (!loadSuccess && !exists) {
                msg.reply('Hi! Thank You For Messaging...');
                return
            }

            try {
                const selectedResponse = getSelectedResponse(responses);
                if (exists && selectedResponse.keywordMessages) {
                    const { keywordMessages } = selectedResponse;
                    for (let keywordMessage of keywordMessages) {
                        const { keyword, message, hasMedia } = keywordMessage;
                        if (msg.body.toLowerCase().includes(keyword.toLowerCase())) {
                            msg.reply(message);
                            if (!hasMedia) return
                            const dirName = `${KEYWORDS_DIR}${selectedResponse.name}/${keyword}/`;
                            const files = await fs.readdir(dirName);
                            for (let file of files) {
                                const media = MessageMedia.fromFilePath(`${dirName}${file}`);
                                chat.sendMessage(media);
                            };
                            log.info("INFO: Replied For Keyword:", keyword)
                            return;
                        }
                    }
                }
                if (!exists) {
                    await saveContact(contactData);
                    msg.reply(selectedResponse.message);
                    if (!selectedResponse.hasMedia) return

                    const dirName = `${DATA_DIR}${selectedResponse.name}/`;
                    const files = await fs.readdir(dirName);
                    for (let file of files) {
                        const media = MessageMedia.fromFilePath(`${dirName}${file}`);
                        chat.sendMessage(media);
                    };

                    log.info("INFO: Replied To First Message...");
                }
            } catch (error) {
                log.error("ERROR: Error Occured Replying To Message ", error);
                msg.reply('Hi! Thank You For Messaging...');
            }
        });
        client.initialize();
        log.debug("Initialized...");

    } catch (error) {
        log.error("ERROR: Initializing Client Failed...");
        process.exit();
    }
});

ipcMain.on("load-settings", async (event) => {
    const [readSuccess, fileData] = await getFileData(SETTINGS_FILE_NAME);
    if (readSuccess) event.reply("settings-loaded", fileData)
    else event.reply("settings-load-failed")
});

ipcMain.on("update-settings", async (event, settings) => {
    const saved = await saveSettings(settings);
    if (saved) event.reply("settings-updated", settings)
    else event.reply("settings-update-failed")
});

