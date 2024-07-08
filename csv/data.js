document.getElementById('upload-file').addEventListener('change', handleFileUpload);
document.getElementById('save-file').addEventListener('click', saveFile);
document.getElementById('add-row').addEventListener('click', addRow);
document.getElementById('add-column').addEventListener('click', addColumn);
document.getElementById('remove-row').addEventListener('click', removeSelectedRows);
document.getElementById('remove-column').addEventListener('click', removeSelectedColumns);
document.getElementById('upload-to-server').addEventListener('click', uploadToServer);
document.getElementById('search-input').addEventListener('input', filterRows);
document.getElementById('visualize-toggle').addEventListener('click', toggleVisualization);
document.getElementById('visualize-data').addEventListener('click', visualizeData);

let parsedData = [];
let fileExtension = '';
let columnNames = [];

function handleFileUpload(event) {
    const file = event.target.files[0];
    fileExtension = file.name.split('.').pop();

    if (fileExtension === 'csv') {
        Papa.parse(file, {
            header: true,
            complete: function(results) {
                parsedData = results.data;
                columnNames = results.meta.fields;
                displayData(parsedData);
                populateColumnSelect(columnNames);
            }
        });
    } else if (['xlsx', 'xls'].includes(fileExtension)) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            parsedData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            columnNames = parsedData[0];
            parsedData = parsedData.slice(1).map(row => {
                let obj = {};
                row.forEach((cell, i) => {
                    obj[columnNames[i]] = cell;
                });
                return obj;
            });
            displayData(parsedData);
            populateColumnSelect(columnNames);
        };
        reader.readAsArrayBuffer(file);
    }
}

function displayData(data) {
    const tableBody = document.getElementById('asset-table').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';

    data.forEach(row => {
        const tr = document.createElement('tr');
        columnNames.forEach(column => {
            const td = document.createElement('td');
            td.contentEditable = 'true';
            td.innerText = row[column] || '';
            tr.appendChild(td);
        });
        tableBody.appendChild(tr);
    });
}

function populateColumnSelect(columns) {
    const select = document.getElementById('visualize-columns');
    select.innerHTML = '';
    columns.forEach(column => {
        const option = document.createElement('option');
        option.value = column;
        option.innerText = column;
        select.appendChild(option);
    });
}

function visualizeData() {
    const selectedColumn = document.getElementById('visualize-columns').value;
    console.log('Selected Column:', selectedColumn);
    console.log('Parsed Data:', parsedData); 
    if (!selectedColumn) {
        alert('Please select a column for visualization.');
        return;
    }

    const ctx = document.getElementById('data-chart').getContext('2d');
    const labels = parsedData.map(row => row['S.no']); // Assuming 'S.no' is the column name in your data for x-axis labels
    const dataPoints = parsedData.map(row => parseFloat(row[selectedColumn]) || 0);

    if (window.myChart) {
        window.myChart.destroy();
    }

    window.myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: selectedColumn,
                data: dataPoints,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

function toggleVisualization() {
    const section = document.getElementById('visualization-section');
    section.style.display = section.style.display === 'none' ? 'block' : 'none';
}

function saveFile() {
    const tableBody = document.getElementById('asset-table').getElementsByTagName('tbody')[0];
    const rows = tableBody.getElementsByTagName('tr');
    const updatedData = [];

    for (let i = 0; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName('td');
        updatedData.push({
            'Computer name': cells[1].innerText,
            'User name': cells[2].innerText,
            'Department': cells[3].innerText,
            'Location': cells[4].innerText,
            'IP Address': cells[5].innerText,
            'Custodian': cells[6].innerText
        });
    }

    if (fileExtension === 'csv' || fileExtension === '') {
        const csv = Papa.unparse(updatedData);
        downloadFile(csv, 'text/csv', 'updated_data.csv');
    } else if (['xlsx', 'xls'].includes(fileExtension)) {
        const worksheet = XLSX.utils.json_to_sheet(updatedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
        const wbout = XLSX.write(workbook, { bookType: fileExtension, type: 'binary' });
        const blob = new Blob([s2ab(wbout)], { type: "application/octet-stream" });
        saveAs(blob, `updated_data.${fileExtension}`);
    }
}

function s2ab(s) {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) {
        view[i] = s.charCodeAt(i) & 0xFF;
    }
    return buf;
}

function downloadFile(content, mimeType, filename) {
    const a = document.createElement('a');
    const blob = new Blob([content], { type: mimeType });
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
}

function addRow() {
    const tableBody = document.getElementById('asset-table').getElementsByTagName('tbody')[0];
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td><input type="checkbox" class="row-checkbox" /> ${tableBody.getElementsByTagName('tr').length + 1}</td>
        <td contenteditable="true"></td>
        <td contenteditable="true"></td>
        <td contenteditable="true"></td>
        <td contenteditable="true"></td>
        <td contenteditable="true"></td>
        <td contenteditable="true"></td>
    `;
    tableBody.appendChild(newRow);
}

function addColumn() {
    const tableHead = document.getElementById('asset-table').getElementsByTagName('thead')[0].getElementsByTagName('tr')[0];
    const tableBody = document.getElementById('asset-table').getElementsByTagName('tbody')[0];
    const newColumnName = prompt('Enter column name:');
    if (!newColumnName) return;

    const th = document.createElement('th');
    th.innerHTML = `<input type="checkbox" class="column-checkbox" /> ${newColumnName}`;
    tableHead.appendChild(th);

    for (const row of tableBody.getElementsByTagName('tr')) {
        const td = document.createElement('td');
        td.contentEditable = 'true';
        row.appendChild(td);
    }
}

function removeSelectedRows() {
    const tableBody = document.getElementById('asset-table').getElementsByTagName('tbody')[0];
    const rows = tableBody.getElementsByTagName('tr');
    for (let i = rows.length - 1; i >= 0; i--) {
        const row = rows[i];
        const checkbox = row.getElementsByTagName('input')[0];
        if (checkbox.checked) {
            tableBody.removeChild(row);
        }
    }
    updateRowNumbers();
}

function updateRowNumbers() {
    const rows = document.getElementById('asset-table').getElementsByTagName('tbody')[0].getElementsByTagName('tr');
    for (let i = 0; i < rows.length; i++) {
        const cell = rows[i].getElementsByTagName('td')[0];
        cell.innerHTML = `<input type="checkbox" class="row-checkbox" /> ${i + 1}`;
    }
}

function removeSelectedColumns() {
    const tableHead = document.getElementById('asset-table').getElementsByTagName('thead')[0];
    const tableBody = document.getElementById('asset-table').getElementsByTagName('tbody')[0];
    const headerCells = tableHead.getElementsByTagName('tr')[0].getElementsByTagName('th');
    const columnIndicesToRemove = [];

    for (let i = headerCells.length - 1; i >= 1; i--) {
        const checkbox = headerCells[i].getElementsByTagName('input')[0];
        if (checkbox.checked) {
            columnIndicesToRemove.push(i);
            tableHead.getElementsByTagName('tr')[0].removeChild(headerCells[i]);
        }
    }

    for (const row of tableBody.getElementsByTagName('tr')) {
        const cells = row.getElementsByTagName('td');
        for (const index of columnIndicesToRemove) {
            row.removeChild(cells[index]);
        }
    }
}

function uploadToServer() {
    const tableBody = document.getElementById('asset-table').getElementsByTagName('tbody')[0];
    const rows = tableBody.getElementsByTagName('tr');
    const updatedData = [];

    for (let i = 0; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName('td');
        updatedData.push({
            'Computer name': cells[1].innerText,
            'User name': cells[2].innerText,
            'Department': cells[3].innerText,
            'Location': cells[4].innerText,
            'IP Address': cells[5].innerText,
            'Custodian': cells[6].innerText
        });
    }

    fetch('http://localhost:3000/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Upload successful:', data);
    })
    .catch(error => {
        console.error('Error uploading data:', error);
    });
}

function filterRows() {
    const filter = document.getElementById('search-input').value.toLowerCase();
    const rows = document.getElementById('asset-table').getElementsByTagName('tbody')[0].getElementsByTagName('tr');
    for (const row of rows) {
        const cells = row.getElementsByTagName('td');
        let match = false;
        for (const cell of cells) {
            if (cell.innerText.toLowerCase().includes(filter)) {
                match = true;
                break;
            }
        }
        row.style.display = match ? '' : 'none';
    }
}

