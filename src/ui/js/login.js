const { ipcRenderer } = require('electron');
const request = require('request');

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

const form = document.querySelector('form');

form.addEventListener('submit', event => {
  event.preventDefault();

  const username = document.querySelector('#floatingUsername').value;
  const password = document.querySelector('#floatingPassword').value;

  console.log(username)
  console.log(password)

  const data = {
    username: username,
    password: password
  }

  request.post('http://127.0.0.1:5000/login', {
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }, (error, response, body) => {
    if (error) {
      console.error(error);
    } else if (response.statusCode !== 200) {
      console.error(`HTTP ${response.statusCode} ${response.statusMessage}`);
    } else {
      ipcRenderer.send('submit-login', body);
    }
  })
})

ipcRenderer.on('login-status', (status) => {
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
