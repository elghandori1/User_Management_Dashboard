let allUsers = [];

function ShowListUsers() {
    const detailsParent = document.querySelector(".details");
    detailsParent.innerHTML = '';

    // Header and filter input
    const header = document.createElement("div");
    header.classList.add("details-header");
    header.innerHTML = `
        <h2>Details</h2>
        <div><input type="text" id="filter" placeholder="Filter by Name"></div>
    `;
    detailsParent.appendChild(header);
    detailsParent.appendChild(document.createElement("hr"));

    // Table setup
    const table = document.createElement('table');
    table.classList.add("user-table");
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.marginTop = '20px';

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    ['ID', 'NAME', 'SALARY', 'ACTION'].forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        th.style.border = '1px solid #ccc';
        th.style.padding = '8px';
        th.style.textAlign = 'centre';
        th.style.backgroundColor = '#333';
        th.style.color = '#fff';
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    table.appendChild(tbody);
    detailsParent.appendChild(table);

    fetch('/users')
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        })
        .then(users => {
            allUsers = users;
            renderUserTable(allUsers);

            const filterInput = document.getElementById('filter');
            filterInput.addEventListener('input', () => {
                const value = filterInput.value.toLowerCase();
                const filtered = allUsers.filter(user =>
                    user.name.toLowerCase().includes(value)
                );
                renderUserTable(filtered);
            });
        })
        .catch(error => {
            console.error('Error fetching users:', error);
            if (!document.querySelector(".user-catchErr")) {
                const errorMsg = document.createElement('p');
                errorMsg.textContent = "Error fetching users click on \'Lists of USers\'";
                errorMsg.classList.add("user-catchErr");
                errorMsg.style.color = "red";
                detailsParent.appendChild(errorMsg);
            }
        });
}

function renderUserTable(usersToDisplay) {
    const tbody = document.querySelector(".user-table tbody");
    if (!tbody) {
        console.error("Table body not found!");
        return;
    }

    tbody.innerHTML = '';

    const styleCell = cell => {
        cell.style.border = '1px solid #ccc';
        cell.style.padding = '8px';
        cell.style.textAlign = 'center';
    };

    if (usersToDisplay && usersToDisplay.length > 0) {
        usersToDisplay.forEach(user => {
            const row = document.createElement('tr');
            const idCell = document.createElement('td');
            idCell.textContent = user.id;
            styleCell(idCell);
            row.appendChild(idCell);

            const nameCell = document.createElement('td');
            nameCell.textContent = user.name;
            styleCell(nameCell);
            row.appendChild(nameCell);

            const salaryCell = document.createElement('td');
            salaryCell.textContent = user.salary;
            styleCell(salaryCell);
            row.appendChild(salaryCell);

            const actionCell = document.createElement('td');
            styleCell(actionCell);
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.classList.add("btn-delete");
            deleteButton.addEventListener('click', () => {
                DeleteUser(user.id,deleteButton);
            });

            const updateButton = document.createElement('button');
            updateButton.textContent = 'Update';
            updateButton.classList.add("btn-update");
            updateButton.addEventListener('click', () => {
                if (!document.querySelector(".inputUpdate")) {
                    UpdateUser(user);
                }
            });
            const infosButton = document.createElement('button');
            infosButton.textContent = 'Infos';
            infosButton.classList.add("btn-info");
            infosButton.addEventListener('click', () => {
                InfosUser(user.id);
            });
            actionCell.append(deleteButton, updateButton, infosButton);
            row.appendChild(actionCell);
            tbody.appendChild(row);
        });
    } else {
        const noDataRow = document.createElement('tr');
        const noDataCell = document.createElement('td');
        noDataCell.colSpan = 4;
        noDataCell.textContent = "No users found.";
        noDataCell.style.textAlign = 'center';
        styleCell(noDataCell);
        noDataRow.appendChild(noDataCell);
        tbody.appendChild(noDataRow);
    }
}

function AddNewUser() {
    const detailsParent = document.querySelector(".details");
    detailsParent.innerHTML = '';

    const header = document.createElement("div");
    header.classList.add("details-header");
    header.innerHTML = `
        <h2>Details</h2>
        <div><input type="text" id="filter" placeholder="Filter by Name" readonly></div>
    `;
    detailsParent.appendChild(header);
    const hr = document.createElement("hr");
    detailsParent.appendChild(hr);

    const placeholder = document.querySelector(".placeholder");

    if (placeholder) {
        detailsParent.removeChild(placeholder);
    }

    // Create the outer div
    const div = document.createElement('div');
    div.classList.add("form-container");

    // Create the form
    const form = document.createElement('form');

    // Create the Name label
    const nameLabel = document.createElement('label');
    nameLabel.htmlFor = 'name';
    nameLabel.textContent = 'Name:';

    // Create the Name input
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.id = 'name';
    nameInput.name = 'name';
    nameInput.required = true;

    // Create the Salary label
    const salaryLabel = document.createElement('label');
    salaryLabel.htmlFor = 'salary';
    salaryLabel.textContent = 'Salary:';

    // Create the Salary input
    const salaryInput = document.createElement('input');
    salaryInput.type = 'number';
    salaryInput.id = 'salary';
    salaryInput.name = 'salary';
    salaryInput.required = true;

    // Create the Submit button
    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.textContent = 'Add User';

    // Append elements to form
    form.appendChild(nameLabel);
    form.appendChild(nameInput);
    form.appendChild(salaryLabel);
    form.appendChild(salaryInput);
    form.appendChild(submitButton);

    // Append form to div
    div.appendChild(form);

    // Append div to container
    detailsParent.appendChild(div);

    //send data form
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const name = nameInput.value.trim();
        const salary = salaryInput.value.trim();
        fetch('/AddNewUser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, salary })
        })
            .then(response => response.json())
            .then(data => {
                const alertmsg = document.createElement('p');
                alertmsg.classList.add('alert-adding');
                if (!document.querySelector(".alert-adding")) {
                    alertmsg.innerText = data.message;
                    form.appendChild(alertmsg);
                    nameInput.readOnly = true;
                    salaryInput.readOnly = true;
                    setTimeout(() => {
                        alertmsg.remove();
                        nameInput.readOnly = false;
                        salaryInput.readOnly = false;
                    }, 3000);
                    nameInput.value = '';
                    salaryInput.value = '';
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showAlert("Something went wrong.", "error");
            });
    });
}

let isDeleting = false;

function DeleteUser(id,button)
{
    if (!isDeleting) {
    if (confirm('Are you sure you want to delete this user?')) {
        isDeleting = true;
        fetch(`/DeleteUser/${id}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error deleting user');
            }
            return response.json();
        })
        .then(data => {
            const alertBox = document.getElementById('alert-box');
            if (alertBox) {
                alertBox.textContent = data.message;
                alertBox.className="alert success";
                alertBox.classList.remove('hidden');
                setTimeout(() => {
                    alertBox.classList.add('hidden');
                    isDeleting = false; 
                }, 3000);
                ShowListUsers();
           }
        })
        .catch(error => {
            console.error('Error:', error);
            alert("Something went wrong while deleting the user.");
        });
    }
}
}

function UpdateUser(user) {
    const row = [...document.querySelectorAll("tr")].find(
        tr => tr.firstChild.textContent == user.id
    );

    if (!row) return;

    const nameCell = row.children[1];
    const salaryCell = row.children[2];
    const actionCell = row.children[3];

    // Store original values
    const originalName = user.name;
    const originalSalary = user.salary;

    // Replace name and salary cells with input fields
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.classList.add("inputUpdate");
    nameInput.value = originalName;
    nameCell.innerHTML = '';
    nameCell.appendChild(nameInput);

    const salaryInput = document.createElement("input");
    salaryInput.type = "number";
    salaryInput.classList.add("inputUpdate");
    salaryInput.value = originalSalary;
    salaryCell.innerHTML = '';
    salaryCell.appendChild(salaryInput);

    // Change "Update" button to "Save"
    const saveButton = document.createElement("button");
    saveButton.textContent = "Save";
    saveButton.style.backgroundColor="#016b21";
    saveButton.addEventListener("click", () => {
        const updatedUser = {
            id: user.id,
            name: nameInput.value.trim(),
            salary: Number(salaryInput.value)
        };

        fetch(`/UpdateUser/${user.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedUser)
        })
        .then(res => {
            if (!res.ok) throw new Error("Failed to update user");
            return res.json();
        })
        .then(data => {
            const alertBox = document.getElementById('alert-box');
            if (alertBox) {
                alertBox.textContent = data.message;
                alertBox.className="alert success";
                alertBox.classList.remove('hidden');
                setTimeout(() => {
                    alertBox.classList.add('hidden');
                }, 3000);
                ShowListUsers();
           }
        })
        .catch(err => {
            console.error(err);
            alert("Update failed.");
        });
    });

    actionCell.innerHTML = '';
    actionCell.appendChild(saveButton);
}

function InfosUser(id) {
    fetch(`/user/${id}`)
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch user details');
            return response.json();
        })
        .then(user => {
            displayUserCard(user);
        })
        .catch(err => {
            console.error("Error fetching user info:", err);
        });
}

function displayUserCard(user) {
    let overlay = document.querySelector(".user-card-overlay");

    if (overlay) {
        overlay.remove();
    }

    overlay = document.createElement("div");
    overlay.className = "user-card-overlay";

    const card = document.createElement("div");
    card.className = "user-card";

    const closeButton = document.createElement("button");
    closeButton.className = "card-close-btn";
    closeButton.textContent = "✖";
    closeButton.onclick = () => {
        overlay.remove();
    };

    // Card content
    card.innerHTML = `
        <h3>User Info</h3>
        <hr>
        <p><strong>ID:</strong> ${user.id}</p>
        <p><strong>Name:</strong> ${user.name}</p>
        <p><strong>Salary:</strong> ${user.salary}</p>
        <p><strong>Email:</strong> ${user.email || 'N/A'}</p>
        <p><strong>Department:</strong> ${user.department || 'N/A'}</p>
    `;

    card.appendChild(closeButton);

    overlay.appendChild(card);
    document.body.appendChild(overlay);
}