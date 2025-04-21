$(document).ready(function () {
    $('#example').DataTable();
    $("#metismenu").metisMenu();
    $('#createUserModal .select2').select2({ dropdownParent: $('#createUserModal') });
    $('#updateUserModal .select2').select2({ dropdownParent: $('#updateUserModal') });

    const tooltips = document.querySelectorAll('.tt');
    tooltips.forEach(tooltip => {
        new bootstrap.Tooltip(tooltip);
    });

    setupInputField('#name');
    setupInputField('#email');
    setupInputField('#password');

    $('#updateUserModal').on('show.bs.modal', function (event) {
        const button = $(event.relatedTarget);
        const userId = button.data('user-id');

        fetch(`/user/${userId}`)
            .then(response => response.json())
            .then(user => {
                $('#editName').val(user.name);
                $('#editEmail').val(user.email);
                $('#editPassword').val('');
                $('#editPassword').attr('placeholder', 'Laissez vide pour ne pas changer');
                const role = user.role;
                $('#editRole').val(role).trigger('change');

                setupInputField('#editName');
                setupInputField('#editEmail');
            })
            .catch(error => console.error('Error:', error));
    });
});

// ======================       CREATE        =============================
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('createUserForm');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(form);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            password: formData.get('password'),
            role: formData.get('role'),
        };

        try {
            const response = await fetch('/user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                window.location.reload();
            } else {
                alert('Failed to create user.');
                console.error('Error:', response);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred.');
        }
    });
});

// ======================       UPDATE        =============================
document.addEventListener('DOMContentLoaded', () => {
    let userIdToUpdate = null;
    const form = document.getElementById('updateUserForm');

    const updateButtons = document.querySelectorAll('#idButton');
    updateButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            userIdToUpdate = event.currentTarget.dataset.userId;
        });
    });

    const confirmUpdateButton = document.querySelector('#updateButton');
    confirmUpdateButton.addEventListener('click', async (event) => {
        if(userIdToUpdate) {
            event.preventDefault();

            const formData = new FormData(form);
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                password: formData.get('password'),
                role: formData.get('role'),
            };

            try {
                const response = await fetch(`/user/${userIdToUpdate}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    window.location.reload();
                } else {
                    alert('Failed to update user.');
                    console.error('Error:', response);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred.');
            }
        }
    });
});

// ======================       DELETE        =============================
document.addEventListener('DOMContentLoaded', () => {
    let userIdToDelete = null;

    const deleteButtons = document.querySelectorAll('#idButtonDelete');
    deleteButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            userIdToDelete = event.currentTarget.dataset.userId;
        });
    });

    const confirmDeleteButton = document.querySelector('#deleteButton');
    confirmDeleteButton.addEventListener('click', async () => {
        if (userIdToDelete) {
            try {
                const response = await fetch(`/user/${userIdToDelete}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                });

                if (response.ok) {
                    window.location.reload();
                } else {
                    alert('Failed to delete user.');
                    console.error('Error:', response);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred.');
            }
        }
    });
});