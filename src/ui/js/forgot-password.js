const { ipcRenderer } = require('electron');

const loginContent = document.getElementById('LoginContent');
const forgotPasswordContent = document.getElementById('forgotPasswordContent');

ipcRenderer.on('show-forgot-password', () => {
    loginContent.style.display = 'none';
    forgotPasswordContent.style.display = 'block';
});