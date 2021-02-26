const path = require('path');
const marked = require('marked');
const { remote, ipcRenderer, dialog } = require('electron');

mainProcess = remote.require('./main');
currentWindow = remote.getCurrentWindow();

let filePath = null;
let originalFileContent = '';

const markdownView = document.querySelector('#markdown');
const htmlView = document.querySelector('#html');
const newFileButton = document.querySelector('#new-file');
const openFileButton = document.querySelector('#open-file');
const saveMarkdownButton = document.querySelector('#save-markdown');
const revertButton = document.querySelector('#revert');
const saveHtmlButton = document.querySelector('#save-html');
const showFileButton = document.querySelector('#show-file');
const openInDefaultButton = document.querySelector('#open-in-default');

const renderMarkdownToHtml = markdown => {
  htmlView.innerHTML = marked(markdown, { sanitize: true });
};

const updateUserInterface = (isEdited) => {
  let title = 'Fire Sale';

  console.log({isEdited});
  if (filePath) {
    title = `${title} - ${path.basename(filePath)}`;
  }

  if (isEdited) {
    title += ' - not saved';
  }
  saveMarkdownButton.disabled = !isEdited;
  revertButton.disabled = !isEdited;
  currentWindow.setTitle(title);
};

markdownView.addEventListener('keyup', event => {
  const currentContent = event.target.value;
  renderMarkdownToHtml(currentContent);
  updateUserInterface(currentContent !== originalFileContent);
});

saveMarkdownButton.addEventListener('click', event => {
  mainProcess.saveMarkDown(filePath, markdownView.value);
  updateUserInterface(false);
});

revertButton.addEventListener('click', event => {
  markdownView.value = originalFileContent;
  renderMarkdownToHtml(originalFileContent);
  updateUserInterface(false);
});


openFileButton.addEventListener('click', () => {
  // alert('Clicked the File Open button');
  content = mainProcess.getFileFromUser();
  console.log(content);
});

ipcRenderer.on('file-opened', (event, file, content) => {
  filePath = file;
  originalFileContent = content;
  console.log('event file-opened');
  console.log({ file, content } );
  markdownView.value = content;
  renderMarkdownToHtml(content);
  updateUserInterface();
});

ipcRenderer.on('file-saved', (event, file, content) => {
  originalFileContent = content;
  console.log('evento file-saved');
  console.log({ file, content } );
  updateUserInterface();
});
