const { ipcRenderer } = require('electron');

const forgotPasswordContent = document.getElementById('forgotPasswordContent');

const loginContent = document.getElementById('LoginContent');

ipcRenderer.on('show-forgot-password', () => {
    loginContent.style.display = 'none';
    forgotPasswordContent.style.display = 'block';
});

const nextBtn = document.querySelector('#next-btn');
const emailErrorLabel = document.querySelector('#email-show-error');

nextBtn.addEventListener('submit', event => {
    event.preventDefault();

    const emailInput = document.querySelector('#forgot-pass-email');
    const email = emailInput.value;

    const data = {
        email: email
    };

    request.post('http://127.0.0.1:5000/validate_email', {
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }, (error, response, body) => {
        if (error) {
            console.error(error);
        } else if (response.statusCode === 200) {
            const result = JSON.parse(body);
            if (result.valid) {
                ipcRenderer.send('email-validated', email);
            } else {
                emailErrorLabel.textContent = 'Email does not exist';
                emailInput.value = '';
            }
        } else {
            console.error(`HTTP ${response.statusCode} ${response.statusMessage}`);
        }
    });
});


// const codeContent = document.getElementById('codeContent');

// ipcRenderer.on('email-validated', (email) => {
//     forgotPasswordContent.style.display = 'none';
//     codeContent.style.display = 'block';
// });