
function ShowListUsers() {
    const detailsParent = document.querySelector(".details");
    detailsParent.innerHTML = '';

    const header = document.createElement("div");
    header.classList.add("details-header");
    header.innerHTML = `
        <h2>Details</h2>
        <div><input type="number" placeholder="filter with ID"></div>
    `;
    detailsParent.appendChild(header);

    const hr = document.createElement("hr");
    detailsParent.appendChild(hr);

    const placeholder = document.querySelector(".placeholder");
    if (placeholder) {
        detailsParent.removeChild(placeholder);
    }

    // Create table element
    const table = document.createElement('table');
    table.classList.add("user-table");
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.marginTop = '20px';

    // Table styles
    const styleCell = cell => {
        cell.style.border = '1px solid #ccc';
        cell.style.padding = '8px';
        cell.style.textAlign = 'left';
    };

    // Create table header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    ['ID', 'NAME', 'SALARY', 'ACTION'].forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        styleCell(th);
        th.style.backgroundColor = '#333';
        th.style.color = '#fff';
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create table body with data
    const tbody = document.createElement('tbody');
    fetch('/users')
        .then(response => response.json())
        .then(users => {
            users.forEach(user => {
                const row = document.createElement('tr');
                const idCell = document.createElement('td');
                idCell.style.textAlign = 'center';
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
                // Create Delete Button
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.addEventListener('click', () => {
                    DeleteUser(user.id);
                });

                // Create Update Button
                const updateButton = document.createElement('button');
                updateButton.textContent = 'Update';

                actionCell.appendChild(deleteButton);
                actionCell.appendChild(updateButton);

                row.appendChild(actionCell);

                tbody.appendChild(row);
            });
            table.appendChild(tbody);
            detailsParent.appendChild(table);
        }).catch(error => {
            if (document.querySelector(".user-catchErr")) {
                return;
            }
            const errorMsg = document.createElement('p');
            errorMsg.textContent = "Error fetching users.";
            errorMsg.classList.add("user-catchErr");
            errorMsg.style.color = "red";
            detailsParent.appendChild(errorMsg);
            console.error(error);
        });
}

function AddNewUser() {
    const detailsParent = document.querySelector(".details");
    detailsParent.innerHTML = '';

    const header = document.createElement("div");
    header.classList.add("details-header");
    header.innerHTML = `
        <h2>Details</h2>
        <div><input type="number" placeholder="filter with ID"></div>
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
                alertmsg.classList.add('notification');
                if (!document.querySelector(".notification")) {
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
                alert("Something went wrong.");
            });
    });
}

function DeleteUser(id) {
    if (confirm('Are you sure you want to delete this user?')) {
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
            alert(data.message);
            ShowListUsers();
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Something went wrong while deleting the user.');
        });
    }
}
