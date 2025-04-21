function formatDate(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
    return new Date(date).toLocaleDateString('fr-FR', options);
}

function setupInputField(id) {
    var input = $(id);

    // Initial check
    var is_filled = input.val();
    if (is_filled) {
        input.removeClass("border-danger").addClass("border-success");
    }
    else {
        input.removeClass("border-success").addClass("border-danger");
    }

    // Check on input
    input.on('input', function () {
        is_filled = input.val();
        if (is_filled) {
            input.removeClass("border-danger").addClass("border-success");
        }
        else {
            input.removeClass("border-success").addClass("border-danger");
        }
    });
}

async function fetchUsersAndPopulateSelect(selectId) {
    try {
        const response = await fetch('/api/users');
        const users = await response.json();
        const select = document.getElementById(selectId);

        users.forEach(user => {
            const option = document.createElement('option');
            option.text = user.name;
            option.value = user.email; // Assumant que l'objet utilisateur a une propriété 'email'
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching users:', error);
    }
}