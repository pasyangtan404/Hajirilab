const { ipcRenderer } = require('electron');

// minimize button
document.getElementById('login-minm-btn').addEventListener('click', () => {
    ipcRenderer.send('minimize-window');
})

// close button
document.getElementById('login-close-btn').addEventListener('click', () => {
    ipcRenderer.send('close-window');
})

// hide or show password
document.getElementById('login-toogle-password').addEventListener('click', () => {
    if (document.getElementById('floatingPassword').type === "password") {
        document.getElementById('floatingPassword').type = "text"
        document.getElementById('login-toggle-password').classList.remove('fa-eye-slash')
        document.getElementById('login-toggle-password').classList.add('fa-eye')
    } else {
        document.getElementById('floatingPassword').type = "password"
        document.getElementById('login-toggle-password').classList.remove('fa-eye')
        document.getElementById('login-toggle-password').classList.add('fa-eye-slash')
    }
})

// login button
document.getElementById('login-btn').addEventListener('click', () => {
    const username = document.getElementById('floatingUsername').value;
    const password = document.getElementById('floatingPassword').value;

    ipcRenderer.send('submit-login-form', { username, password });
    // Show a login status message
    loginStatus.innerHTML = 'Logging in...';
})


ipcRenderer.on('login-status', (event, status) => {
    const loginStatus = document.getElementById('login-show-error');

    switch (status) {
      case 'success':
        loginStatus.innerHTML = 'Login successful.';
        break;
      case 'fail':
        loginStatus.innerHTML = 'Invalid username or password.';
        break;
      case 'error':
        loginStatus.innerHTML = 'An error occurred during login validation.';
        break;
    }
  });
