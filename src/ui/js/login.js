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

const form1 = document.querySelector('#content1 form');

form1.addEventListener('submit', event => {
  event.preventDefault();

  const usernameInput = document.querySelector('#floatingUsername');
  const passwordInput = document.querySelector('#floatingPassword');
  let username = usernameInput.value;
  let password = passwordInput.value;


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
      usernameInput.value = '';
      passwordInput.value = '';
    } else {
      const result = JSON.parse(body);
      if (result.success) {
        ipcRenderer.send('submit-login', body);
      } else {
        const loginErrorLabel = document.getElementById('login-show-error');
        loginErrorLabel.textContent = result.message;
        usernameInput.value = '';
        passwordInput.value = '';
      }
    }
  })
})

const forgotPassword = document.getElementById('forgotPassword');
forgotPassword.addEventListener('click', event => {
  event.preventDefault();

  ipcRenderer.send('show-forgot-password');
});


