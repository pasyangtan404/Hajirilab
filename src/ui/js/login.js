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

document.getElementById('new-pass-toggle').addEventListener('click', () => {
  if (document.getElementById('new-pass').type === "password") {
    document.getElementById('new-pass').type = "text"
    document.getElementById('new-pass-toggle').classList.remove('fa-eye-slash')
    document.getElementById('new-pass-toggle').classList.add('fa-eye')
  } else {
    document.getElementById('new-pass').type = "password"
    document.getElementById('new-pass-toggle').classList.remove('fa-eye')
    document.getElementById('new-pass-toggle').classList.add('fa-eye-slash')
  }
})

document.getElementById('confirm-pass-toggle').addEventListener('click', () => {
  if (document.getElementById('confirm-new-pass').type === "password") {
    document.getElementById('confirm-new-pass').type = "text"
    document.getElementById('confirm-pass-toggle').classList.remove('fa-eye-slash')
    document.getElementById('confirm-pass-toggle').classList.add('fa-eye')
  } else {
    document.getElementById('confirm-new-pass').type = "password"
    document.getElementById('confirm-pass-toggle').classList.remove('fa-eye')
    document.getElementById('confirm-pass-toggle').classList.add('fa-eye-slash')
  }
})

const form1 = document.querySelector('#content1 form');

form1.addEventListener('submit', event => {
  event.preventDefault();

  const usernameInput = document.querySelector('#floatingUsername');
  const passwordInput = document.querySelector('#floatingPassword');
  const loginErrorLabel = document.getElementById('login-show-error');

  let username = usernameInput.value;
  let password = passwordInput.value;


  console.log(username)
  console.log(password)

  if (username.trim() === '' || password.trim() === '') {
    loginErrorLabel.textContent = 'Username and password are required.';
    usernameInput.value = '';
    passwordInput.value = '';
    return;
  }

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
        if (result.message === 'Invalid username or password') {
          loginErrorLabel.textContent = 'Invalid username or password.';
        } else {
          loginErrorLabel.textContent = result.message;
        }
        usernameInput.value = '';
        passwordInput.value = '';
      }
    }
  })
})

const loginContent = document.getElementById('LoginContent');
const forgotPasswordContent = document.getElementById('forgotPasswordContent');
const codeContent = document.getElementById('codeContent');
const changePassContent = document.getElementById('changePassContent');

const forgotPassword = document.getElementById('forgotPassword');
forgotPassword.addEventListener('click', event => {
  event.preventDefault();

  ipcRenderer.send('show-forgot-password');
});

ipcRenderer.on('show-forgot-password', () => {
  loginContent.style.display = 'none';
  forgotPasswordContent.style.display = 'block';
});

const form2 = document.querySelector('#content2 form');

form2.addEventListener('submit', event => {
  event.preventDefault();

  const emailInput = document.querySelector('#forgot-pass-email');
  const email = emailInput.value;

  const data = {
    email: email
  };

  fetch('http://127.0.0.1:5000/validate_email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
    .then(response => response.json())
    .then(result => {
      if (result.valid) {
        sendVerificationCode(email);
        showCodeContent();
      } else {
        const emailErrorLabel = document.getElementById('email-show-error');
        emailErrorLabel.textContent = 'Please type your registered email.';
        emailInput.value = '';
      }
    })
    .catch(error => {
      console.error(error);
    });
});

function sendVerificationCode(email) {
  fetch('http://127.0.0.1:5000/send_code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email })
  })
    .then(response => response.json())
    .then(result => {
      if (result.success) {
        console.log(success)
      } else {
        console.error(result.error);
      }
    })
    .catch(error => {
      console.error(error);
    });
}

function showCodeContent() {
  forgotPasswordContent.style.display = 'none';
  codeContent.style.display = 'block';
}

const form3 = document.querySelector('#content3 form');

form3.addEventListener('submit', event => {
  event.preventDefault();

  const verificationCodeInput = document.querySelector('#verification-code');
  const verificationCode = verificationCodeInput.value;
  const email = document.querySelector('#forgot-pass-email').value;
  
  const data = {
    code: verificationCode,
    email: email
  };

  fetch('http://127.0.0.1:5000/verify_code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
    .then(response => response.json())
    .then(result => {
      if (result.success) {
        showChangePassContent();
      } else {
        const codeErrorLabel = document.getElementById('code-show-error');
        codeErrorLabel.textContent = 'Invalid Verification Code';
        verificationCodeInput.value = '';
      }
    })
    .catch(error => {
      console.error(error);
    });
});

function showChangePassContent() {
  codeContent.style.display = 'none';
  changePassContent.style.display = 'block';
}

const form4 = document.querySelector('#content4 form');

form4.addEventListener('submit', event => {
  event.preventDefault();

  const newPasswordInput = document.querySelector('#new-pass');
  const confirmNewPasswordInput = document.querySelector('#confirm-new-pass');

  const newPassword = newPasswordInput.value;
  const confirmNewPassword = confirmNewPasswordInput.value;

  if (newPassword !== confirmNewPassword) {
    const passwordErrorLabel = document.getElementById('password-error');
    passwordErrorLabel.textContent = 'Passwords do not match';
    newPasswordInput.value = '';
    confirmNewPasswordInput.value = '';
    return;
  }

  const email = document.querySelector('#forgot-pass-email').value;

  const data = {
    email: email,
    password: newPassword
  };

  fetch('http://127.0.0.1:5000/change_password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
    .then(response => response.json())
    .then(result => {
      if (result.success) {
        alert("Password changed successfully")
        // Redirect to the login page
        window.location.href = 'login.html';
      } else {
        const passwordErrorLabel = document.getElementById('password-error');
        passwordErrorLabel.textContent = result.error;
      }
    })
    .catch(error => {
      console.error(error);
    });
});

const backContainers = document.querySelectorAll('.back-container');
backContainers.forEach(container => {
  container.addEventListener('click', () => {
    const currentContent = container.closest('.row');
    const previousContent = currentContent.previousElementSibling;

    if (previousContent) {
      currentContent.style.display = 'none';
      previousContent.style.display = 'block';
    }
  });
});