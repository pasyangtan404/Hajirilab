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
    });
});

/*----------- for save, update and delete button ---------------*/

const form = document.querySelector('form');

form.addEventListener('submit', event => {
    event.preventDefault();
    const employee_id = document.querySelector('#employee-id').value;
    const first_name = document.querySelector('#first-name').value;
    const last_name = document.querySelector('#last-name').value;
    const gender = document.querySelector('#gender').value;
    const dob = document.querySelector('#dob').value;
    const email = document.querySelector('#email').value;
    const phone_num = document.querySelector('#phone').value;
    const address = document.querySelector('#address').value;
    const department = document.querySelector('#department').value;
    const position = document.querySelector('#position').value;
    const photo_sample = "No"

    console.log(first_name)
    console.log(last_name)

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
        updateEmployeeDetails(data);
    } else if (event.submitter.id === 'delete-btn') {
        deleteEmployeeDetails(data);
    }
});



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
                alert('Employee details saved successfully');
                window.location.reload();
            } else if (data.message === 'Employee details already exist') {
                alert('Employee details already exist');
            }
        })
        .catch(error => {
            console.error(error);
            alert('An error occurred while saving employee details');
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
                alert('Employee details updated successfully');
                window.location.reload();
            } else if (data.updated === false) {
                alert('No changes made');
                window.location.reload();
            } else {
                alert('An error occurred while updating employee details');
            }
        })
        .catch(error => {
            console.error(error);
            alert('An error occurred while updating employee details');
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
            alert('Employee details deleted successfully');
            window.location.reload();
        })
        .catch(error => {
            console.error(error);
            alert('An error occurred while deleting employee details');
        });
}

document.getElementById('reset-btn').addEventListener('click', () => {
    const form = document.querySelector('form');
    form.reset();
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
            alert('Photos captured and preprocessed successfully');
            window.location.reload();
        })
        .catch(error => {
            console.error(error);
            alert('An error occurred while capturing and preprocessing photos');
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
    fetch('http://127.0.0.1:5000/employees')
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
            alert('An error occurred while fetching employee details');
            window.location.reload();
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
window.addEventListener('load', populateTable);

/*----------- for train and attendance button ---------------*/
// Get the train button element
const trainButton = document.getElementById('train-btn');

// Add event listener to the train button
trainButton.addEventListener('click', () => {
    // Send a POST request to the server to trigger the training
    fetch('http://127.0.0.1:5000/train', {
        method: 'POST'
    })
        .then(response => response.json())
        .then(data => {
            // Handle the response from the server
            console.log(data);
            if (data.success) {
                alert('Model trained successfully!');
                window.location.reload();
            } else {
                alert('An error occurred during training.');
                window.location.reload();
            }
        })
        .catch(error => {
            console.error(error);
            alert('An error occurred while sending the training request.');
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
            alert('Attendance taken successfully');
            window.location.reload();
        })
        .catch(error => {
            console.error(error);
        });
}

document.getElementById('check-out-btn').addEventListener('click', () => {
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
                alert('CSV file not found');
            } else if (data.message === 'Check-out successful') {
                alert('Check-out successful');
            }
        })
        .catch(error => {
            console.error(error);
        });
}

document.getElementById('attendance-btn').addEventListener('click', () => {
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
            alert('An error occurred while opening the folder');
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
            alert('An error occurred while opening the folder');
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
        var file = event.target.files[0];

        if (file) {
            var reader = new FileReader();

            reader.onload = function (e) {
                var contents = e.target.result;
                processCSVData(contents);
            };

            reader.readAsText(file);
        }
    };

    fileInput.accept = '.csv';
    fileInput.click();
}

function processCSVData(contents) {
    var rows = contents.split('\n');
    var headers = rows[0].split(',').map(header => header.trim());
    var data = [];

    for (var i = 1; i < rows.length; i++) {
        var row = rows[i].split(',');
        var rowData = {};

        for (var j = 0; j < headers.length; j++) {
            rowData[headers[j]] = row[j];
        }

        data.push(rowData);
    }

    updateTable(data);
}

function updateTable(data) {
    // Get the table body element
    var tableBody = document.querySelector('#attendance-table tbody');

    // Clear existing table rows
    tableBody.innerHTML = '';

    data.forEach(row => {
        var tableRow = document.createElement('tr');
        tableRow.addEventListener('click', () => {
            updateFormFields(row);
        });

        Object.values(row).forEach(value => {
            var cell = document.createElement('td');
            cell.textContent = value;
            tableRow.appendChild(cell);
        });

        tableBody.appendChild(tableRow);
    });
}

function updateFormFields(row) {
    // Update the form fields with the imported data
    document.querySelector('#att-employee-id').value = row['Employee ID'];
    document.querySelector('#att-first-name').value = row['First Name'];
    document.querySelector('#att-last-name').value = row['Last Name'];
    document.querySelector('#att-department').value = row['Department'];
    document.querySelector('#check-in').value = convertTimeFormat(row['Check-In']);
    document.querySelector('#check-out').value = convertTimeFormat(row['Check-Out']);
    document.querySelector('#attdate').value = row['Date'];
    document.querySelector('#att-status').value = row['Attendance Status'];
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

document.getElementById('import-btn').addEventListener('click', () => {
    importCSV();
});

document.getElementById('att-reset-btn').addEventListener('click', () => {
    const form = document.querySelector('#att-form');
    form.reset();
});