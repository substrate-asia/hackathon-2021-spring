/* eslint global-require: off, no-console: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./src/main.prod.js` using webpack. This gives us some performance wins.
 */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';

import fs from 'fs'
import { waitReady } from '@polkadot/wasm-crypto'
import { DB, IPFS, Metadata, Blockchain } from './client/index'
import path from 'path'

let instance: any = {}
const setUp = async () => {
  await waitReady()
  const filePath = path.resolve(__dirname + '/client/passwords.json')
  instance.db = new DB(filePath)

  console.log(instance.db.getCID())
  instance.ipfs = new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' })
}


// ipcMain.on('db.readItem', async (event, arg) => {
//   await setUp()
//   const uri = "second glad business heavy bargain dismiss evil cheap turtle lecture myself myself"
//   const blockchain = new Blockchain(uri,
//     '5H1u2yovWepdiMps1epY3NXmYNxffzojChsH4BMqZaL1WC1Y', instance.ipfs)

//   const x = await blockchain.buildVaultsCache()
//   event.returnValue = x
// })

// DB
ipcMain.on('db.readItem', async (event, arg) => {
  if (!instance.db) await setUp()

  const { appId } = arg
  event.returnValue = instance.db.readItems(appId)
})

ipcMain.on('db.addItem', async (event, arg) => {
  if (!instance.db) await setUp()

  const { appId, content } = arg
  instance.db.addItem(appId, content)
  event.returnValue = { status: 1 }
})

ipcMain.on('db.updateItem', async (event, arg) => {
  if (!instance.db) await setUp()

  const { appId, uuid, content } = arg
  instance.db.updateItem(appId, uuid, content)
  event.returnValue = { status: 1 }
})

ipcMain.on('db.deleteItem', async (event, arg) => {
  if (!instance.db) await setUp()

  const { appId, uuid } = arg
  instance.db.deleteItem(appId, uuid)
  event.returnValue = { status: 1 }
})

ipcMain.on('db.installApp', async (event, arg) => {
  if (!instance.db) await setUp()

  const { appId, appMetadata } = arg
  instance.db.installApp(appId, appMetadata)
  event.returnValue = { status: 1 }
})

// Metadata 
ipcMain.on('metadata.buildMetadata', async (event, arg) => {
  if (!instance.db) await setUp()

  const { encryptionSchema, name } = arg
  const metadata = new Metadata(encryptionSchema, name,
    instance.ipfs, instance.db
  )
  event.returnValue = (await metadata.buildMetadata()).cid
})

ipcMain.on('metadata.recover', async (event, arg) => {
  if (!instance.db) await setUp()
  const { encryptionSchema, cid } = arg
  if (!instance.blockchain)
    event.returnValue = { status: 0, msg: "no identity" }
  const data = JSON.parse(await instance.ipfs.cat(cid))

  const metadata = new Metadata(
    encryptionSchema, data.name, instance.ipfs, instance.db
  )
  event.returnValue = await metadata.recover(data, instance.blockchain.publicKey,
      instance.blockchain.privateKey)
})

// Blockchain
ipcMain.on('blockchain.injectIdentity', async (event, arg) => {
  if (!instance.db) await setUp()
  const { mnemonic, contract_address } = arg
  const ipfs = new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' })
  instance.blockchain = new Blockchain(mnemonic, contract_address, ipfs)
  event.returnValue = {
    address: instance.blockchain.address,
    publicKey: instance.blockchain.publicKey
  }
})

ipcMain.on('blockchain.getVaults', async (event, arg) => {
  if (!instance.db) await setUp()
  if (!instance.blockchain) {
    event.returnValue = { status: 0, msg: "no identity" }
    return
  }
  event.returnValue = JSON.stringify(await instance.blockchain.getVaults())
})

ipcMain.on('blockchain.createVault', async (event, arg) => {
  if (!instance.db) await setUp()
  const { cid } = arg
  if (!instance.blockchain) {
    event.returnValue = { status: 0, msg: "no identity" }
    return
  }
  await instance.blockchain.createVault(cid)
  event.returnValue = { status: 1 }
})
ipcMain.on('blockchain.refreshCache', async(event, arg) => {
  if (!instance.db) await setUp()
  if (!instance.blockchain) {
    event.returnValue = { status: 0, msg: "no identity" }
    return
  }
  fs.writeFileSync(path.resolve(__dirname + '/client/cache.json'), '{}')
  await instance.blockchain.buildVaultsCache()
})

ipcMain.on('blockchain.nominateMember', async (event, arg) => {
  if (!instance.db) await setUp()
  const { vault_id, address } = arg
  if (!instance.blockchain) {
    event.returnValue = { status: 0, msg: "no identity" }
    return
  }
  await instance.blockchain.nominateMember(vault_id, address)
  event.returnValue = { status: 1 }
})

ipcMain.on('blockchain.removeMember', async (event, arg) => {
  if (!instance.db) await setUp()
  const { vault_id, address } = arg
  if (!instance.blockchain) {
    event.returnValue = { status: 0, msg: "no identity" }
    return
  }
  await instance.blockchain.removeMember(vault_id, address)
  event.returnValue = { status: 1 }
})

ipcMain.on('blockchain.updateVault', async (event, arg) => {
  if (!instance.db) await setUp()
  const { vault_id, cid } = arg
  if (!instance.blockchain) {
    event.returnValue = { status: 0, msg: "no identity" }
    return
  }
  await instance.blockchain.updateMetadata(vault_id, cid)
  event.returnValue = { status: 1 }
})

ipcMain.on('blockchain.burnVault', async (event, arg) => {
  if (!instance.db) await setUp()
  const { vault_id } = arg
  if (!instance.blockchain) {
    event.returnValue = { status: 0, msg: "no identity" }
    return
  }
  await instance.blockchain.burnVault(vault_id)
  event.returnValue = { status: 1 }
})

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {

  await waitReady()

  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    frame: false,
    transparent: true,
    titleBarStyle: 'hidden',
    icon: getAssetPath('icon.png'),
    webPreferences: {
      nodeIntegration: true,
    },
  });

  mainWindow.loadURL(`file://${__dirname}/index.html`);

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.whenReady().then(createWindow).catch(console.log);

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});
