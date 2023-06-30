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
// document.getElementById('save-btn').addEventListener('click', () => {
//     event.preventDefault();
//     var formData = new FormData(document.querySelector('form'));

//     fetch('/save', {
//         method: 'POST',
//         body: formData
//     })
//     .then(response => response.json())
//     .then(data => {
//         console.log(data);
//     })
//     .catch(error => {
//         console.error(error);
//     });
// });


document.getElementById('save-btn').addEventListener('click', () => {
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
            alert('Employee details saved successfully');
        })
        .catch(error => {
            console.error(error);
            alert('An error occurred while saving employee details');
        });
    });
});

// document.getElementById('update-btn').addEventListener('click', () => {
//     event.preventDefault();
//     var formData = new FormData(document.querySelector('form'));

//     fetch('/update', {
//         method: 'POST',
//         body: formData
//     })
//     .then(response => response.json())
//     .then(data => {
//         console.log(data);
//     })
//     .catch(error => {
//         console.error(error);
//     });
// });

// document.getElementById('delete-btn').addEventListener('click', () => {
//     event.preventDefault();
//     fetch('/delete', {
//         method: 'POST'
//     })
//     .then(response => response.json())
//     .then(data => {
//         console.log(data);
//     })
//     .catch(error => {
//         console.error(error);
//     });
// });