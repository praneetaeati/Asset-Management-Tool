function submitForm(formId) {
  if (formId === 'stdForm') {
      window.location.href = './login.html'; // Path to the student login page
  } else if (formId === 'empForm') {
      window.location.href = './login.html'; // Path to the admin login page
  }
}

document.getElementById('languageButton').addEventListener('click', function() {
    var content = document.getElementById('languageContent');
    if (content.style.display === 'block') {
      content.style.display = 'none';
    } else {
      content.style.display = 'block';
    }
  });

  // Close the language selection when clicking outside of it
  window.onclick = function(event) {
    if (!event.target.matches('#languageButton')) {
      var dropdowns = document.getElementsByClassName("content");
      for (var i = 0; i < dropdowns.length; i++) {
        var openDropdown = dropdowns[i];
        if (openDropdown.style.display === 'block') {
          openDropdown.style.display = 'none';
        }
      }
    }
  }