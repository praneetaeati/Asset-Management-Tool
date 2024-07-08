document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const userType = urlParams.get('type');

    if (userType === 'empForm') {
        // Redirect to employee login page if the user is not an admin
        window.location.href = '../employee/elogin.html';
    }
});

