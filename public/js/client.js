document.addEventListener('DOMContentLoaded', () => {
    fetch('/uploads')
        .then(response => response.json())
        .then(data => {
            const fileList = document.getElementById('fileList');
            fileList.innerHTML = data.files.map(file => `<li><a href="/uploads/${file}" target="_blank">${file}</a></li>`).join('');
        })
        .catch(error => console.error('Error fetching uploaded files:', error));
});
