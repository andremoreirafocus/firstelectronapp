const fs = require('fs');
const { app, BrowserWindow, dialog, Menu } = require ('electron');

let mainWindow = null;

app.on('ready', () => {
  console.log('Apllication ready!');
  mainWindow = new BrowserWindow({ show: false});
  mainWindow.loadFile(`${__dirname}/index.html`);

  // getFileFromUser();
  Menu.setApplicationMenu(applicationMenu);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });
});

exports.getFileFromUser = () => {
  const files = dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    buttonLabel: 'Read now',
    title: 'Select file to be edited',
    filters: [
      { name: 'Markdown files', extensions: ['md', 'mdown']},
      { name: 'Text Files', extensions: ['txt', 'text']}
    ]
  });
  if (!files) 
    return;
  console.log(files);
  const file = files[0];
  openFile(file);
  // const content = fs.readFileSync(file).toString();
  // // console.log(content);
  // console.log('returning...');
  // return content;
};

exports.saveMarkDown = (file, content) => {

  if (!file) {
    file = dialog.showSaveDialog({
      title: 'Save Markdown',
      defaultPath: app.getPath('desktop'),
      filters: [
        { name: 'Markdown files', extensions: ['md', 'mdown']}
      ]
    });
  }

  if (!file) {
    return;
  }

  fs.writeFileSync(file, content);
  
  mainWindow.webContents.send('file-saved', file, content);
};

exports.saveHTML = (file, content) => {

  if (file)
    file = `${file.split('.')[0]}.html`;

  if (!file) {
    file = dialog.showSaveDialog({
      title: 'Save HTML',
      defaultPath: app.getPath('desktop'),
      filters: [
        { name: 'HTML files', extensions: ['htm', 'html']}
      ]
    });
  }

  if (!file) {
    return;
  }

  fs.writeFileSync(file, content);
  console.log({file});
  file = `${file.split('.')[0]}.md`;
  // console.log({file});
  mainWindow.webContents.send('file-saved-html', file, content);
};

const openFile = (exports.openFile = (file) => {
  if (file) {
    console.log('file to open: ', file);
    const content = fs.readFileSync(file).toString();
    app.addRecentDocument(file); // nao funcionou
    mainWindow.webContents.send('file-opened', file, content);
    console.log(content);
  }
  else 
    console.log('File not informed!!!');
});

const applicationName = 'Fire sale';

const template = [ 
  {
    label: 'File',
    submenu: [
      {
        label: 'Open File',
        accelerator: 'CommandorControl+O',
        click() {
          // console.log('Open file');
          exports.getFileFromUser();
        }
      },
      {
        label: 'Save File',
        accelerator: 'CommandorControl+S',
        click() {
          // console.log('Open file');
          mainWindow.webContents.send('save-markdown');
        }
      },
      {
        label: 'Save HTML',
        accelerator: 'CommandorControl+Shift+S',
        click() {
          // console.log('Open file');
          mainWindow.webContents.send('save-html');
        }
      },
      {
        label: `Quit ${applicationName}`,
        role: 'quit'
        // click() {
        //   console.log('Quit application');
        //   app.quit();
        // }
      },
      {
        label: `Copy`,
        role: 'copy'
        // click() {
        //   console.log('Quit application');
        //   app.quit();
        // }
      }

    ]
  },
  {
    label: 'About',
    submenu: [
      {
        label: `About ${applicationName}`,
        click() {
          console.log('About application');
        }
      }
    ]
  }
];

const applicationMenu = Menu.buildFromTemplate(template);

