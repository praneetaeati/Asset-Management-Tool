// Function to handle form submission without alert messages
function submitForm(formId) {
    
    if (password === 'vpt2024') {
        window.location.href = `../csv/i.html?type=${formId}`;
    } else {
        alert('Incorrect password. Please try again.');
    }
}


// Function to handle button click and redirect to the employee login page
function redirectToLogin() {
    window.location.href = '../employee/elogin.html';
}

// Add event listeners to buttons
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.submittt').forEach(function(button) {
        button.addEventListener('click', redirectToLogin);
    });
});
