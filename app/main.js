const fs = require('fs');
const { app, BrowserWindow, dialog } = require ('electron');

let mainWindow = null;

app.on('ready', () => {
  console.log('Apllication ready!');
  mainWindow = new BrowserWindow({ show: false});
  mainWindow.loadFile(`${__dirname}/index.html`);

  // getFileFromUser();
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

const openFile = (file) => {
  const content = fs.readFileSync(file).toString();
  app.addRecentDocument(file); // nao funcionou
  mainWindow.webContents.send('file-opened', file, content);
  // console.log(content);
};
