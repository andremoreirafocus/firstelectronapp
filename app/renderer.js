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

saveHtmlButton.addEventListener('click', event => {
  mainProcess.saveHTML(filePath, htmlView.innerHTML);
  updateUserInterface(false);
});

openFileButton.addEventListener('click', () => {
  // alert('Clicked the File Open button');
  content = mainProcess.openFile();
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
  filePath = file;
  updateUserInterface();
});

document.addEventListener('dragenter', (event) => {
  event.preventDefault();
  event.stopPropagation();
}, false);
document.addEventListener('dragover', (event) => {
  event.preventDefault();
  // event.stopPropagation();
}, false);
document.addEventListener('dragleave', (event) => {
  event.preventDefault();
  event.stopPropagation();
}, false);
document.addEventListener('drop', (event) => {
  event.preventDefault();
  event.stopPropagation();
}, false);

const getDraggedFile = (event) => {
  if (event.dataTransfer.items.length !== 0)
  {
    console.log({event});
    return event.dataTransfer.items[0];
  }
  // return event.dataTransfer.files[0];
};
const getDroppedFile = (event) => {
  if (event.dataTransfer.files.length !== 0)
  {
    console.log({event});
    return event.dataTransfer.files[0];
  }
};
// const getDroppedFile = (event) => event.dataTransfer.items[0];
const fileTypeIsSupported = (fileType) => {
  // console.log({file});
  return ['text/plain', 'text/markdown'].includes(fileType);
  // return false;
};

markdownView.addEventListener('dragover', (ev) => {
  ev.preventDefault();
  if (ev.dataTransfer.items) {
    console.log({ev});
    // Use a interface DataTransferItemList para acessar o (s) arquivo (s)
    console.log('items.length: ', ev.dataTransfer.items.length);
    for (var i = 0; i < ev.dataTransfer.items.length; i++) {
      // Se os itens soltos não forem arquivos, rejeite-os
      if (ev.dataTransfer.items[i].kind === 'file') {
        console.log('item: ', ev.dataTransfer.items[i]);
        console.log('item file: ', ev.dataTransfer.items[i].type);
        // console.log('item string: ', ev.dataTransfer.items[i]).getAsString;
        var fileType = ev.dataTransfer.items[i].type;
        // console.log(' dragover getasfile ... file[' + i + '].name = ' + file.name);
      }
    }
  } else {
    // Use a interface DataTransfer para acessar o (s) arquivo (s)
    console.log('files.length: ', ev.dataTransfer.files.length);
    for (var i = 0; i < ev.dataTransfer.files.length; i++) {
      console.log('... file[' + i + '].name = ' + ev.dataTransfer.files[i].name);
    }
  }

  console.log('myfiletype is: ', fileType);
  if (fileTypeIsSupported(fileType)) {
    markdownView.classList.add('drag-over');
  } else {
    markdownView.classList.add('drag-error');
  }
});

markdownView.addEventListener('drop', (ev) => {
  if (ev.dataTransfer.items) {
    // Use a interface DataTransferItemList para acessar o (s) arquivo (s)
    for (var i = 0; i < ev.dataTransfer.items.length; i++) {
      // Se os itens soltos não forem arquivos, rejeite-os
      if (ev.dataTransfer.items[i].kind === 'file') {
        var file = ev.dataTransfer.items[i].getAsFile();
        console.log({file});
        console.log('drop getasfile ... file[' + i + '].name = ' + file.name);
        var fileType = file.type;
      }
    }
    markdownView.classList.remove('drag-over');
    markdownView.classList.remove('drag-error');
  
  } else {
    // Use a interface DataTransfer para acessar o (s) arquivo (s)
    for (var i = 0; i < ev.dataTransfer.files.length; i++) {
      console.log('... file[' + i + '].name = ' + ev.dataTransfer.files[i].name);
    }
  }

  if (fileTypeIsSupported(fileType)) {
    console.log('file to open: ', file.path);
    content = mainProcess.openFile(file.path);
    console.log(content);  
  }
  else {
    if (fileType === '')
      alert(`ERROR: file type not identified!!!`);
    else
      alert(`ERROR: file type ${fileType} is not supported!!!`);
  }
});


markdownView.addEventListener('dragleave', () => {
  markdownView.classList.remove('drag-over');
  markdownView.classList.remove('drag-error');
});
