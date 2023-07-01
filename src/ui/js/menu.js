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
document.getElementById('save-btn').addEventListener('click', () => {
    const form = document.querySelector('form');
    const messageElement = document.getElementById('message');

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
        const photo_sample = document.querySelector('input[name="optionsRadios"]:checked').value;

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
        }

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
                    showMessage(messageElement, 'Employee details saved successfully');
                } else if (data.message === 'Employee details already exist') {
                    showMessage(messageElement, 'Employee details already exist');
                }
            })
            .catch(error => {
                console.error(error);
                showMessage(messageElement, 'An error occurred while saving employee details');
            });
    });
});

document.getElementById('update-btn').addEventListener('click', () => {
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
        const photo_sample = document.querySelector('input[name="optionsRadios"]:checked').value;

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
        }

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
                alert('Employee details updated successfully');
            })
            .catch(error => {
                console.error(error);
                alert('An error occurred while updating employee details');
            });
    });
});

document.getElementById('delete-btn').addEventListener('click', () => {
    const form = document.querySelector('form');

    form.addEventListener('submit', event => {
        event.preventDefault();
        const employee_id = document.querySelector('#employee-id').value;

        console.log(employee_id)

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
            })
            .catch(error => {
                console.error(error);
                alert('An error occurred while deleting employee details');
            });
    });
});

function showMessage(element, message) {
    element.textContent = message;
    setTimeout(() => {
        element.textContent = '';
    }, 5000);
}

document.getElementById('reset-btn').addEventListener('click', () => {
    const form = document.querySelector('form');
    form.reset();
});

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

            data.forEach(employee => {
                const row = document.createElement('tr');
                row.addEventListener('click', () => {
                    fillForm(employee);
                });

                const employeeIdCell = document.createElement('td');
                employeeIdCell.textContent = employee.employee_id;
                row.appendChild(employeeIdCell);

                const firstNameCell = document.createElement('td');
                firstNameCell.textContent = employee.first_name;
                row.appendChild(firstNameCell);

                const lastNameCell = document.createElement('td');
                lastNameCell.textContent = employee.last_name;
                row.appendChild(lastNameCell);

                const genderCell = document.createElement('td');
                genderCell.textContent = employee.gender;
                row.appendChild(genderCell);

                const dobCell = document.createElement('td');
                dobCell.textContent = employee.dob;
                row.appendChild(dobCell);

                const emailCell = document.createElement('td');
                emailCell.textContent = employee.email;
                row.appendChild(emailCell);

                const phoneNumCell = document.createElement('td');
                phoneNumCell.textContent = employee.phone_num
                row.appendChild(phoneNumCell);

                const addressCell = document.createElement('td');
                addressCell.textContent = employee.address;
                row.appendChild(addressCell);

                const departmentCell = document.createElement('td');
                departmentCell.textContent = employee.department;
                row.appendChild(departmentCell);

                const positionCell = document.createElement('td');
                positionCell.textContent = employee.position;
                row.appendChild(positionCell);

                const photoSampleCell = document.createElement('td');
                photoSampleCell.textContent = employee.photo_sample;
                row.appendChild(photoSampleCell);

                tableBody.appendChild(row);
            });
        })
        .catch(error => {
            console.error(error);
            alert('An error occurred while fetching employee details');
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
    document.querySelector(`input[name="optionsRadios"][value="${employee.photo_sample}"]`).checked = true;
}

// Call the populateTable function to load employee details on page load
window.addEventListener('load', populateTable);