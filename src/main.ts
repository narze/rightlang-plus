import { app, BrowserWindow, clipboard, globalShortcut } from "electron"
import * as iohook from "iohook"
import * as path from "path"
import * as robot from "robotjs"

let bufferEn = ""
let bufferTh = ""
let bufferCombined = ""
let robotIsTyping = false

robot.setKeyboardDelay(0)

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
    width: 800,
  })

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, "../index.html"))

  // Open the DevTools.
  mainWindow.webContents.openDevTools()
}

// function backupClipboard() {
//   tempClipboard = clipboard.readText()
//   clipboard.clear()
// }

// function restoreClipboard() {
//   clipboard.writeText(tempClipboard)
//   tempClipboard = ""
// }

// async function copySelectionToClipboard() {
//   robot.keyTap("c", ["command"])

//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve(clipboard.readText())
//     }, 2000)
//   })
// }

// function transformText(text: string) {
//   const alphabets = text.split("")
//   return alphabets.join(" ")
// }

// function typeText(text: string) {
//   robot.typeString(text)
// }

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
  // createWindow()
  // app.on("activate", function () {
  //   // On macOS it's common to re-create a window in the app when the
  //   // dock icon is clicked and there are no other windows open.
  //   if (BrowserWindow.getAllWindows().length === 0) createWindow()
  // })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.

// const text = clipboard.readText()
// console.log(text)

// app.whenReady().then(() => {
//   // Register a 'CmdOrCtrl+Shift+C' shortcut listener.
//   const ret = robot.register("CmdOrCtrl+Shift+C", async () => {
//     console.log("CmdOrCtrl+Shift+C is pressed")
//     // backupClipboard()
//     // const text = await copySelectionToClipboard()
//     // const transformedText = transformText(text as string)
//     // console.log({ text, transformedText })
//     // typeText(transformedText)
//     // restoreClipboard()
//   })

//   if (!ret) {
//     console.log("registration failed")
//   }

//   // Check whether a shortcut is registered.
//   console.log(globalShortcut.isRegistered("CmdOrCtrl+Shift+C"))
// })

// app.on("will-quit", () => {
//   // Unregister a shortcut.
//   globalShortcut.unregister("CmdOrCtrl+Shift+C")

//   // Unregister all shortcuts.
//   globalShortcut.unregisterAll()
// })

iohook.on("keypress", (event) => {
  if (robotIsTyping) {
    return
  }
  console.log(event) // { type: 'mousemove', x: 700, y: 400 }
  const char = String.fromCharCode(event["keychar"])

  if (
    event["shiftKey"] &&
    !event["altKey"] &&
    !event["ctrlKey"] &&
    char == "\b"
  ) {
    console.log("TRIGGER")
    robotIsTyping = true
    robot.keyTap("backspace", ["alt"])
    robot.typeString(bufferCombined.split("").join(" "))
    bufferCombined = ""
    bufferEn = ""
    bufferTh = ""
    setTimeout(() => {
      robotIsTyping = false
    }, 1000)
    return
  } else if (char.match(/[a-zA-Z]/)) {
    bufferEn += char
    bufferCombined += char
  } else if (char.match(/[\u0E00-\u0E7F]/)) {
    bufferTh += char
    bufferCombined += char
  } else {
    bufferEn = ""
    bufferTh = ""
    bufferCombined = ""
  }

  console.log({ char, bufferEn, bufferTh, bufferCombined })
})

// Register and start hook
iohook.start()
