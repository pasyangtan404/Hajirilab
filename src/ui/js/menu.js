const { ipcRenderer } = require('electron');

/*----------- for minimize, maximize, and close button ------------*/
// minimize button
document.getElementById('menu-minm-btn').addEventListener('click', () => {
    ipcRenderer.send('minimize-window');
})

// maximize button
document.getElementById('menu-maxm-btn').addEventListener('click', () => {
    ipcRenderer.send('menu-maximize-window');
})

// close button
document.getElementById('menu-close-btn').addEventListener('click', () => {
    ipcRenderer.send('close-window');
})

const modal4 = document.getElementById('modal4');
const closeModalBtn4 = document.getElementById('closeModal2');
const yesBtn2 = document.getElementById('yes-btn2');
const noBtn2 = document.getElementById('no-btn2');
const modalTitle4 = document.getElementById('modalTitle4');
const modalBody4 = document.getElementById('modalBody4');

function showModal4(message) {
    modalTitle4.textContent = 'HajiriLab';
    modalBody4.textContent = message;
    modal4.style.display = 'block';
}

closeModalBtn4.addEventListener('click', function () {
    modal4.style.display = 'none';
});

noBtn2.addEventListener('click', function () {
    modal4.style.display = 'none';
});

function confirmLogout(data) {
    showModal4('Are you sure you want to logout?');

    yesBtn2.addEventListener('click', function () {
        ipcRenderer.send('logout');
        modal4.style.display = 'none'
    });
}

document.getElementById('log-out').addEventListener('click', () => {
    confirmLogout();
});

/*--------- for sidebar and content change ------------*/
let sidebar = document.querySelector(".sidebar");
let closeBtn = document.querySelector("#btn");

closeBtn.addEventListener("click", () => {
    sidebar.classList.toggle("open");
    // menuBtnChange();//calling the function(optional)
});

// Function to change content based on selected option
function changeContent(selectedOption) {
    // Hide all content divs
    var contentDivs = document.querySelectorAll('#content > div');
    console.log(contentDivs);
    contentDivs.forEach(function (div) {
        div.style.display = 'none';
        console.log("hidden")
    });

    // Show the selected content div
    console.log('#' + selectedOption + '-content');
    var selectedDiv = document.querySelector('#' + selectedOption + '-content');
    console.log(selectedDiv);
    selectedDiv.style.display = 'block';

    localStorage.setItem('selectedOption', selectedOption);
}

var storedOption = localStorage.getItem('selectedOption');

// Check if a stored option exists and if it matches a valid option
if (storedOption && document.querySelector('.option[data-value="' + storedOption + '"]')) {
    // Call the changeContent function with the stored option
    changeContent(storedOption);
}

// Attach event listeners to options in sidebar
var options = document.querySelectorAll('.option');
options.forEach(function (option) {
    option.addEventListener('click', function (event) {
        // Get the value of the selected option
        var selectedOption = event.currentTarget.dataset.value;
        console.log('selectedOption:', selectedOption);

        // Call the changeContent function with the selected option
        changeContent(selectedOption);

        localStorage.setItem('selectedOption', selectedOption);
    });
});

/*----------- for save, update and delete button ---------------*/
const modal = document.getElementById('modal');
const closeModalBtn = document.getElementsByClassName('close')[0];
const okBtn = document.getElementById('ok-btn');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');

const modal2 = document.getElementById('modal2');
const closeModalBtn2 = document.getElementById('closeModal');
const yesBtn = document.getElementById('yes-btn');
const noBtn = document.getElementById('no-btn');
const modalTitle2 = document.getElementById('modalTitle2');
const modalBody2 = document.getElementById('modalBody2');

const modal3 = document.getElementById('modal3');
const closeModalBtn3 = document.getElementById('closeModal1');
const yesBtn1 = document.getElementById('yes-btn1');
const noBtn1 = document.getElementById('no-btn1');
const modalTitle3 = document.getElementById('modalTitle3');
const modalBody3 = document.getElementById('modalBody2');

// Function to open the modal with a custom message
function showModal(message) {
    modalTitle.textContent = 'HajiriLab';
    modalBody.textContent = message;
    modal.style.display = 'block';
}

function showModal2(message) {
    modalTitle2.textContent = 'HajiriLab';
    modalBody2.textContent = message;
    modal2.style.display = 'block';
}

function showModal3(message) {
    modalTitle2.textContent = 'HajiriLab';
    modalBody3.textContent = message;
    modal3.style.display = 'block';
}

closeModalBtn.addEventListener('click', function () {
    modal.style.display = 'none';
});

closeModalBtn2.addEventListener('click', function () {
    modal2.style.display = 'none';
});

closeModalBtn3.addEventListener('click', function () {
    modal3.style.display = 'none';
});

okBtn.addEventListener('click', function () {
    modal.style.display = 'none';
});

noBtn.addEventListener('click', function () {
    modal2.style.display = 'none';
});

noBtn1.addEventListener('click', function () {
    modal3.style.display = 'none';
});

const form1 = document.querySelector('#content1 form');
const phoneInput = document.querySelector('#phone');


form1.addEventListener('submit', event => {
    event.preventDefault();
    const employee_id = document.querySelector('#employee-id').value;
    const first_name = document.querySelector('#first-name').value;
    const last_name = document.querySelector('#last-name').value;
    const gender = document.querySelector('#gender').value;
    const dob = document.querySelector('#dob').value;
    const email = document.querySelector('#email').value;
    const phone_num = phoneInput.value;
    const address = document.querySelector('#address').value;
    const department = document.querySelector('#department').value;
    const position = document.querySelector('#position').value;
    const photo_sample = "No"

    console.log(first_name)
    console.log(last_name)

    // const numericValue = phone_num.replace(/\D/g, '');

    // event.target.value = numericValue;

    // // Validate phone number
    // const isValidPhoneNumber = validatePhoneNumber(phone_num);
    // if (!isValidPhoneNumber) {
    //     phoneError.textContent = 'Phone number must be 10 digits long and contain only numbers.';
    //     phoneInput.classList.add('is-invalid');
    //     return;
    // }

    // // Clear the error message and invalid class if the phone number is valid
    // phoneError.textContent = '';
    // phoneInput.classList.remove('is-invalid');

    const data = {
        employee_id: employee_id,
        first_name: first_name,
        last_name: last_name,
        gender: gender,
        dob: dob,
        email: email,
        phone_num: phone_num,
        address: address,
        department: department,
        position: position,
        photo_sample: photo_sample
    };

    if (event.submitter.id === 'save-btn') {
        saveEmployeeDetails(data);
    } else if (event.submitter.id === 'update-btn') {
        confirmUpdate(data)
    } else if (event.submitter.id === 'delete-btn') {
        confirmDelete(data)
    }
});

// function validatePhoneNumber(phoneNumber) {
//     // Remove any non-digit characters from the phone number
//     const numericPhoneNumber = phoneNumber.replace(/\D/g, '');

//     // Check if the phone number is exactly 10 digits long
//     return numericPhoneNumber.length === 10;
// }


function saveEmployeeDetails(data) {
    fetch('http://127.0.0.1:5000/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            console.log(data);
            if (data.message === 'Employee details saved successfully') {
                showModal('Employee details saved successfully');
                location.reload();
            } else if (data.message === 'Employee details already exist') {
                showModal('Employee details already exist');
                location.reload();
            }
        })
        .catch(error => {
            console.error(error);
            showModal('An error occurred while saving employee details');
        });
}

function updateEmployeeDetails(data) {
    const employee_id = data.employee_id;

    fetch(`http://127.0.0.1:5000/update/${employee_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            console.log(data);
            if (data.updated === true) {
                showModal('Employee details updated successfully');
                location.reload();
            } else if (data.updated === false) {
                showModal('No changes made');
            } else {
                showModal('An error occurred while updating employee details');
                location.reload();
            }
        })
        .catch(error => {
            console.error(error);
            showModal('An error occurred while updating employee details');
        });
}

function confirmUpdate(data) {
    showModal2('Are you sure you want to update this employee?');

    yesBtn.addEventListener('click', function () {
        updateEmployeeDetails(data);
        modal2.style.display = 'none'
    });
}

function deleteEmployeeDetails(data) {
    const employee_id = data.employee_id;
    fetch(`http://127.0.0.1:5000/delete/${employee_id}`, {
        method: 'DELETE',
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            console.log(data);
            showModal('Employee details deleted successfully');
            location.reload();
        })
        .catch(error => {
            console.error(error);
            showModal('An error occurred while deleting employee details');
        });
}

function confirmDelete(data) {
    showModal3('Are you sure you want to delete this employee?');
  
    // Add event listener to Yes button in the update/delete modal
    yesBtn1.addEventListener('click', function() {
        deleteEmployeeDetails(data);
        modal3.style.display = 'none'
    });
  }

const resetButton1 = document.querySelector('#reset-btn');

resetButton1.addEventListener('click', event => {
    event.preventDefault();

    const form1 = document.querySelector('#content1 form');
    form1.reset();
});

/*----------- for add button to capture photos ---------------*/
function capturePhotos() {
    const employee_id = document.querySelector('#employee-id').value;
    const first_name = document.querySelector('#first-name').value;
    const last_name = document.querySelector('#last-name').value;

    const data = {
        employee_id: employee_id,
        first_name: first_name,
        last_name: last_name
    }

    // Send a POST request to capture and preprocess the photos
    fetch('http://127.0.0.1:5000/capture', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            console.log(data);
            showModal('Photos captured and preprocessed successfully');
            location.reload();
        })
        .catch(error => {
            console.error(error);
            showModal('An error occurred while capturing and preprocessing photos');
            location.reload();
        });
}

document.addEventListener('DOMContentLoaded', () => {
    const addPhotoBtn = document.getElementById('add-photo-btn');

    addPhotoBtn.addEventListener('click', event => {
        event.preventDefault();
        capturePhotos();
    });
});

/*----------- for showing details of employee ---------------*/
function populateTable() {
    const request = new Request('http://127.0.0.1:5000/employees');
    request.cache = 'force-cache';
    fetch(request)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            const tableBody = document.querySelector('#employee-table tbody');
            tableBody.innerHTML = '';
            const columnName = ['employee_id', 'first_name', 'last_name',
                'gender', 'dob', 'email', 'phone_num', 'address',
                'department', 'position', 'photo_sample'];

            data.forEach(employee => {
                const row = document.createElement('tr');
                row.addEventListener('click', () => {
                    fillForm(employee);
                });

                columnName.forEach(prop => {
                    const cell = document.createElement('td');
                    cell.textContent = employee[prop];
                    row.appendChild(cell);
                });

                tableBody.appendChild(row);
            });
        })
        .catch(error => {
            console.error(error);
            showModal('An error occurred while fetching employee details');
            location.reload();
        });
}

// Function to fill the form with employee details when a row is clicked
function fillForm(employee) {
    document.querySelector('#employee-id').value = employee.employee_id;
    document.querySelector('#first-name').value = employee.first_name;
    document.querySelector('#last-name').value = employee.last_name;
    document.querySelector('#gender').value = employee.gender;
    document.querySelector('#dob').value = employee.dob;
    document.querySelector('#email').value = employee.email;
    document.querySelector('#phone').value = employee.phone_num;
    document.querySelector('#address').value = employee.address;
    document.querySelector('#department').value = employee.department;
    document.querySelector('#position').value = employee.position;
}

// Call the populateTable function to load employee details on page load
window.addEventListener('load', populateTable)

/*----------- for train and attendance button ---------------*/
// Get the train button element
const trainButton = document.getElementById('train-btn');

// Add event listener to the train button
trainButton.addEventListener('click', event => {
    event.preventDefault();
    // Send a POST request to the server to trigger the training
    fetch('http://127.0.0.1:5000/train', {
        method: 'POST'
    })
        .then(response => response.json())
        .then(data => {
            // Handle the response from the server
            console.log(data);
            if (data.success) {
                showModal('Model trained successfully!');
                location.reload();
            } else {
                showModal('An error occurred during training.');
                location.reload();
            }
        })
        .catch(error => {
            console.error(error);
        });
});

function check_In() {
    fetch('http://127.0.0.1:5000/checkIn', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            console.log(data);
            showModal('Attendance taken successfully');
            location.reload();
        })
        .catch(error => {
            console.error(error);
        });
}

document.getElementById('check-out-btn').addEventListener('click', event => {
    event.preventDefault();
    check_Out();
});

function check_Out() {
    fetch('http://127.0.0.1:5000/checkOut', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            console.log(data);
            if (data.message === 'CSV file not found') {
                showModal('CSV file not found');
                location.reload();
            } else if (data.message === 'Check-out successful') {
                showModal('Check-out successful');
                location.reload();
            }
        })
        .catch(error => {
            console.error(error);
        });
}

document.getElementById('attendance-btn').addEventListener('click', event => {
    event.preventDefault();
    check_In();
});

/*----------- for show photo and open button ---------------*/
function showPhotos() {
    const employee_id = document.querySelector('#employee-id').value;
    const first_name = document.querySelector('#first-name').value;
    const last_name = document.querySelector('#last-name').value;

    const data = {
        employee_id: employee_id,
        first_name: first_name,
        last_name: last_name
    }

    // Send a POST request to capture and preprocess the photos
    fetch('http://127.0.0.1:5000/show', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            console.log(data);
        })
        .catch(error => {
            console.error(error);
            showModal('An error occurred while opening the folder');
        });
}

function openPhotos() {
    fetch('http://127.0.0.1:5000/open', {
        method: 'POST'
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            console.log(data);
        })
        .catch(error => {
            console.error(error);
            showModal('An error occurred while opening the folder');
        });
}

document.addEventListener('DOMContentLoaded', () => {
    const showPhotoBtn = document.getElementById('show-photo-btn');
    const openPhotoBtn = document.getElementById('open-photo-btn');

    showPhotoBtn.addEventListener('click', event => {
        event.preventDefault();
        showPhotos();
    });

    openPhotoBtn.addEventListener('click', event => {
        event.preventDefault();
        openPhotos();
    });
});

function importCSV() {
    var fileInput = document.createElement('input');
    fileInput.type = 'file';

    fileInput.onchange = function (event) {
        event.preventDefault();
        var file = event.target.files[0];

        if (file) {
            var formData = new FormData();
            formData.append('csv_file', file);

            fetch('http://127.0.0.1:5000/import_csv', {
                method: 'POST',
                body: formData
            })
                .then(response => response.json())
                .then(data => {
                    if (data.error) {
                        console.error(data.error);
                    } else {
                        updateTable(data.data);
                    }
                })
                .catch(error => {
                    console.error(error);
                });
        }
    };

    fileInput.accept = '.csv';
    fileInput.click();
}

function updateTable(data) {
    // Get the table body element
    var tableBody = document.querySelector('#attendance-table tbody');

    // Clear existing table rows
    tableBody.innerHTML = '';

    var columnOrder = ['Employee ID', 'First Name', 'Last Name', 'Department', 'Date', 'Check-In', 'Check-Out', 'Attendance Status'];

    data.forEach(row => {
        var tableRow = document.createElement('tr');
        tableRow.addEventListener('click', function () {
            updateFormFields(this); // Pass the clicked row to updateFormFields function
        });

        columnOrder.forEach(column => {
            var cell = document.createElement('td');
            cell.textContent = row[column];
            tableRow.appendChild(cell);
        });

        tableBody.appendChild(tableRow);
    });
}

function updateFormFields(row) {
    // Get the data from the selected table row
    var employeeId = row.cells[0].textContent;
    var firstName = row.cells[1].textContent;
    var lastName = row.cells[2].textContent;
    var department = row.cells[3].textContent;
    var date = row.cells[4].textContent;
    var checkIn = row.cells[5].textContent;
    var checkOut = row.cells[6].textContent;
    var status = row.cells[7].textContent;

    // Update the form fields with the retrieved data
    document.querySelector('#att-employee-id').value = employeeId;
    document.querySelector('#att-first-name').value = firstName;
    document.querySelector('#att-last-name').value = lastName;
    document.querySelector('#att-department').value = department;
    document.querySelector('#check-in').value = convertTimeFormat(checkIn);
    document.querySelector('#check-out').value = checkOut === 'N/A' ? 'N/A' : convertTimeFormat(checkOut);
    document.querySelector('#attdate').value = convertDateFormat(date);
    document.querySelector('#att-status').value = status;
}

function convertDateFormat(date) {
    var parts = date.split('/');
    if (parts.length !== 3) {
        return date; // Return the original date if it doesn't have the expected format
    }

    var year = parts[2];
    var month = parts[0];
    var day = parts[1];

    if (month.length === 1) {
        month = '0' + month;
    }

    if (day.length === 1) {
        day = '0' + day;
    }

    return year + '-' + month + '-' + day;
}

function convertTimeFormat(time) {
    // Split the time into hours, minutes, and seconds
    var [hours, minutes, seconds] = time.split(':');
    var period = 'AM';

    // Convert hours to 12-hour format and determine the period (AM/PM)
    if (hours >= 12) {
        period = 'PM';
        hours = hours % 12;
    }

    if (hours === '0') {
        hours = '12';
    }

    var formattedTime = hours + ':' + minutes + ' ' + period;
    return formattedTime;
}

document.getElementById('import-btn').addEventListener('click', event => {
    event.preventDefault();
    importCSV();
});

const updateBtn = document.querySelector('#att-update-btn');
updateBtn.addEventListener('click', event => {
    event.preventDefault();
    // Get the updated values from the form fields
    var employeeId = document.querySelector('#att-employee-id').value;
    var firstName = document.querySelector('#att-first-name').value;
    var lastName = document.querySelector('#att-last-name').value;
    var department = document.querySelector('#att-department').value;
    var checkIn = document.querySelector('#check-in').value;
    var checkOut = document.querySelector('#check-out').value;
    var date = document.querySelector('#attdate').value;
    var status = document.querySelector('#att-status').value;

    checkIn = convertTimeTo24HourFormat(checkIn);
    checkOut = checkOut === 'N/A' ? 'N/A' : convertTimeTo24HourFormat(checkOut);

    // Find the selected table row based on the Employee ID
    var table = document.getElementById('attendance-table');
    var rows = table.getElementsByTagName('tr');

    var updated = false;
    var selectedRow = null;

    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        var rowEmployeeId = row.cells[0].textContent;

        if (rowEmployeeId === employeeId) {
            // Update the values in the table row
            row.cells[1].textContent = firstName;
            row.cells[2].textContent = lastName;
            row.cells[3].textContent = department;
            row.cells[4].textContent = date;
            row.cells[5].textContent = checkIn;
            row.cells[6].textContent = checkOut;
            row.cells[7].textContent = status;

            updated = true;
            selectedRow = row;
            break;
        }
    }

    // Clear the form fields
    document.querySelector('#att-employee-id').value = '';
    document.querySelector('#att-first-name').value = '';
    document.querySelector('#att-last-name').value = '';
    document.querySelector('#att-department').value = '';
    document.querySelector('#check-in').value = '';
    document.querySelector('#check-out').value = '';
    document.querySelector('#attdate').value = '';
    document.querySelector('#att-status').value = '';

    if (updated) {
        if (selectedRow) {
            selectedRow.classList.remove('selected');
        }
        showModal('Table updated successfully');
    } else {
        showModal('Error updating table');
    }
})

function convertTimeTo24HourFormat(time) {
    var [formattedTime, period] = time.split(' ');
    var [hours, minutes] = formattedTime.split(':');

    if (period === 'PM') {
        hours = (parseInt(hours) + 12).toString();
    }

    return hours + ':' + minutes;
}

const exportBtn = document.querySelector('#export-btn');
exportBtn.addEventListener('click', event => {
    event.preventDefault();

    const tableRows = Array.from(document.querySelectorAll('#attendance-table tbody tr'));

    var columnOrder = ['Employee ID', 'First Name', 'Last Name', 'Department', 'Date', 'Check-In', 'Check-Out', 'Attendance Status'];

    const tableData = tableRows.map(row => {
        const rowData = {};
        Array.from(row.cells).forEach((cell, index) => {
            const column = columnOrder[index];
            rowData[column] = cell.textContent;
        });
        return rowData;
    });

    const data = {
        tableData: tableData
    };

    fetch('http://127.0.0.1:5000/export_csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
        .then(response => response.blob())
        .then(blob => {
            // Create a download link for the CSV file
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'updated_attendance.csv');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        })
        .catch(error => {
            console.error(error);
        });
})

const resetButton2 = document.querySelector('#att-reset-btn');
resetButton2.addEventListener('click', event => {
    event.preventDefault();

    const form2 = document.querySelector('#content2 form');
    form2.reset();
});

const form3 = document.querySelector('#content3 form');

form3.addEventListener('submit', event => {
    event.preventDefault();
    const newEmail = document.querySelector('#new-email').value;
    const password = document.querySelector('#current-password').value;

    const data = {
        newEmail: newEmail,
        password: password
    }

    fetch('http://127.0.0.1:5000/change_email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                const newEmailErrorLabel = document.getElementById('new-email-show-error');
                newEmailErrorLabel.textContent = data.error;
                form3.reset();
            } else {
                console.log(data.message);
                showModal(data.message)
            }
        })
        .catch(error => {
            console.error(error);
        });
});

const form4 = document.querySelector('#content4 form');

form4.addEventListener('submit', event => {
    event.preventDefault();
    const newUsername = document.querySelector('#new-username').value;
    const password = document.querySelector('#current-password2').value;

    const data = {
        newUsername: newUsername,
        password: password
    }

    fetch('http://127.0.0.1:5000/change_username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                const newUsernameErrorLabel = document.getElementById('new-username-show-error');
                newUsernameErrorLabel.textContent = data.error;
                form4.reset();
            } else {
                console.log(data.message);
                showModal(data.message)
            }
        })
        .catch(error => {
            console.error(error);
        });
});

const form5 = document.querySelector('#content5 form');

form5.addEventListener('submit', event => {
    event.preventDefault();
    const currentUsername = document.querySelector('#current-username').value;
    const password = document.querySelector('#current-password3').value;
    const newPassword = document.querySelector('#new-password').value;
    const confirmPassword = document.querySelector('#confirm-password').value;

    if (newPassword !== confirmPassword) {
        const newPassErrorLabel = document.getElementById('change-pass-show-error');
        newPassErrorLabel.textContent = 'Passwords do not match';
        form5.reset();
        return;
    }

    const data = {
        username: currentUsername,
        password: password,
        newPassword: newPassword
    }

    fetch('http://127.0.0.1:5000/new_password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                const newPassErrorLabel = document.getElementById('change-pass-show-error');
                newPassErrorLabel.textContent = data.error;
                // form5.reset();
            } else {
                console.log(data.message);
                showModal(data.message)
            }
        })
        .catch(error => {
            console.error(error);
        });
});