document.getElementById('upload-file').addEventListener('change', handleFileUpload);
document.addEventListener('DOMContentLoaded', function () {
    fetchUploadedFiles();
});

function handleFileUpload(event) {
    const file = event.target.files[0];
    const fileExtension = file.name.split('.').pop().toLowerCase();

    if (fileExtension === 'csv') {
        Papa.parse(file, {
            header: true,
            dynamicTyping: true,
            complete: function (results) {
                console.log("Parsed CSV data:", results.data);
                populateTable(results.data);
            },
            error: function (error) {
                console.error("Error parsing CSV file: ", error);
            }
        });
    } else if (['xlsx', 'xls'].includes(fileExtension)) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const parsedData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            console.log("Parsed Excel data:", parsedData);
            populateTable(parsedData);
        };
        reader.readAsArrayBuffer(file);
    }
}

function fetchUploadedFiles() {
    fetch('/files')
        .then(response => response.json())
        .then(data => {
            data.files.forEach(file => {
                Papa.parse(file.content, {
                    header: true,
                    dynamicTyping: true,
                    complete: function (results) {
                        console.log("Parsed CSV data from server:", results.data);
                        populateTable(results.data);
                    },
                    error: function (error) {
                        console.error("Error parsing CSV file from server: ", error);
                    }
                });
            });
        })
        .catch(error => console.error("Error fetching uploaded files: ", error));
}

function populateTable(data) {
    const tableBody = document.querySelector('#asset-table tbody');
    tableBody.innerHTML = ''; // Clear existing data

    data.forEach((row, index) => {
        const tr = document.createElement('tr');

        const tdIndex = document.createElement('td');
        tdIndex.textContent = index + 1;
        tr.appendChild(tdIndex);

        const tdComputerName = document.createElement('td');
        tdComputerName.textContent = row['Computer name'] || ''; // Ensure this matches the CSV header exactly
        tr.appendChild(tdComputerName);

        const tdUsername = document.createElement('td');
        tdUsername.textContent = row['User name'] || ''; // Ensure this matches the CSV header exactly
        tr.appendChild(tdUsername);

        const tdDepartment = document.createElement('td');
        tdDepartment.textContent = row['Department'] || '';
        tr.appendChild(tdDepartment);

        const tdLocation = document.createElement('td');
        tdLocation.textContent = row['Location'] || '';
        tr.appendChild(tdLocation);

        const tdIPAddress = document.createElement('td');
        tdIPAddress.textContent = row['IP Address'] || ''; // Ensure this matches the CSV header exactly
        tr.appendChild(tdIPAddress);

        const tdCustodian = document.createElement('td');
        tdCustodian.textContent = row['Custodian'] || '';
        tr.appendChild(tdCustodian);

        tableBody.appendChild(tr);
    });
}