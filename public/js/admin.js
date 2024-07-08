document.getElementById('upload-file').addEventListener('change', handleFileUpload);
document.getElementById('save-file').addEventListener('click', saveFile);
document.getElementById('add-row').addEventListener('click', addRow);
document.getElementById('add-column').addEventListener('click', addColumn);
document.getElementById('remove-row').addEventListener('click', removeSelectedRows);
document.getElementById('remove-column').addEventListener('click', removeSelectedColumns);
document.getElementById('search-input').addEventListener('input', filterRows);
let parsedData = [];
let fileExtension = '';

function handleFileUpload(event) {
    const file = event.target.files[0];
    fileExtension = file.name.split('.').pop().toLowerCase();

    if (fileExtension === 'csv') {
        Papa.parse(file, {
            header: true,
            complete: function(results) {
                parsedData = results.data;
                displayData(parsedData);
                populateSelectOptions(parsedData);
                populateInfrastructureTypes();
            }
        });
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        const reader = new FileReader();
        reader.onload = function(e) {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            parsedData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
            displayData(parsedData);
            populateSelectOptions(parsedData);
            populateInfrastructureTypes();
        };
        reader.readAsArrayBuffer(file);
    }
}

function displayData(data) {
    const tableBody = document.getElementById('asset-table').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';
    data.forEach((row, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><input type="checkbox" class="row-checkbox" /> ${index + 1}</td>
            <td contenteditable="true">${row['Infastructure type'] || ''}</td>
            <td contenteditable="true">${row['User name'] || ''}</td>
            <td contenteditable="true">${row['Department'] || ''}</td>
            <td contenteditable="true">${row['Location'] || ''}</td>
            <td contenteditable="true">${row['Ip Address'] || ''}</td>
            <td contenteditable="true">${row['Custodian'] || ''}</td>
        `;
        tableBody.appendChild(tr);
    });
}

function saveFile() {
    updateParsedDataFromTable();

    if (fileExtension === 'csv' || fileExtension === '') {
        const csv = Papa.unparse(parsedData);
        downloadFile(csv, 'text/csv', 'updated_data.csv');
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        const worksheet = XLSX.utils.json_to_sheet(parsedData);
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
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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
    populateInfrastructureTypes();
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
        td.contentEditable = true;
        row.appendChild(td);
    }

    populateSelectOptions();
}

function removeSelectedRows() {
    const tableBody = document.getElementById('asset-table').getElementsByTagName('tbody')[0];
    const rows = tableBody.getElementsByTagName('tr');
    for (let i = rows.length - 1; i >= 0; i--) {
        const checkbox = rows[i].getElementsByTagName('input')[0];
        if (checkbox.checked) {
            tableBody.removeChild(rows[i]);
        }
    }
    updateRowNumbers();
    populateInfrastructureTypes();
}

function removeSelectedColumns() {
    const tableHead = document.getElementById('asset-table').getElementsByTagName('thead')[0].getElementsByTagName('tr')[0];
    const tableBody = document.getElementById('asset-table').getElementsByTagName('tbody')[0];
    const checkboxes = tableHead.getElementsByClassName('column-checkbox');

    for (let i = checkboxes.length - 1; i >= 0; i--) {
        if (checkboxes[i].checked) {
            for (const row of tableBody.getElementsByTagName('tr')) {
                row.removeChild(row.getElementsByTagName('td')[i]);
            }
            tableHead.removeChild(checkboxes[i].parentElement);
        }
    }

    populateSelectOptions();
    populateInfrastructureTypes();
}

function filterRows(event) {
    const searchTerm = event.target.value.toLowerCase();
    const tableBody = document.getElementById('asset-table').getElementsByTagName('tbody')[0];
    const rows = tableBody.getElementsByTagName('tr');

    let columnCounts = Array.from({ length: tableBody.rows[0].cells.length - 1 }, () => 0); // Ignore the first column (checkbox)

    for (const row of rows) {
        const cells = row.getElementsByTagName('td');
        let isMatch = false;

        for (let i = 1; i < cells.length; i++) { // Skip the first cell (checkbox)
            const cellText = cells[i].innerText.toLowerCase();
            if (cellText.includes(searchTerm)) {
                isMatch = true;
                columnCounts[i - 1]++;
            }
        }

        if (isMatch) {
            row.style.display = '';
            row.style.backgroundColor = '#f0f8ff'; // Highlight matching rows
        } else {
            row.style.display = '';
            row.style.backgroundColor = ''; // Remove highlight if not matching
        }
    }

    updateColumnCounts(columnCounts, searchTerm);
}

function updateColumnCounts(columnCounts, searchTerm) {
    const countsContainer = document.getElementById('column-counts');
    countsContainer.innerHTML = '';

    columnCounts.forEach((count, index) => {
        const th = document.getElementById('asset-table').getElementsByTagName('thead')[0].getElementsByTagName('tr')[0].children[index + 1];
        const columnName = th ? th.innerText : `Column ${index + 1}`;
        const countElement = document.createElement('div');
        countElement.textContent = `${columnName}: ${count} occurrence(s) of '${searchTerm}'`;
        countsContainer.appendChild(countElement);
    });
}

function populateSelectOptions(data = []) {
    const attributeSelect = document.getElementById('attribute-select');
    attributeSelect.innerHTML = '';

    let keys = [];
    if (data.length > 0) {
        keys = Object.keys(data[0]);
    }

    keys.forEach(key => {
        const option = document.createElement('option');
        option.value = key;
        option.text = key;
        attributeSelect.appendChild(option);
    });

    populateInfrastructureTypes();
}

function populateInfrastructureTypes() {
    const attributeSelect = document.getElementById('attribute-select');
    const infrastructureSelect = document.getElementById('infrastructure-select');

    const selectedAttribute = attributeSelect.value;
    const types = new Set();

    if (selectedAttribute && parsedData.length) {
        parsedData.forEach(row => {
            if (row[selectedAttribute]) {
                types.add(row[selectedAttribute]);
            }
        });
    }

    infrastructureSelect.innerHTML = '';
    types.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.text = type;
        infrastructureSelect.appendChild(option);
    });

    updateUniqueCount();
}

function updateParsedDataFromTable() {
    const tableBody = document.getElementById('asset-table').getElementsByTagName('tbody')[0];
    const rows = tableBody.getElementsByTagName('tr');
    const updatedData = [];

    for (const row of rows) {
        const cells = row.getElementsByTagName('td');
        updatedData.push({
            'Infrastructure type': cells[1].innerText,
            'User name': cells[2].innerText,
            'Department': cells[3].innerText,
            'Location': cells[4].innerText,
            'IP Address': cells[5].innerText,
            'Custodian': cells[6].innerText
        });
    }

    parsedData = updatedData;
}

function updateRowNumbers() {
    const tableBody = document.getElementById('asset-table').getElementsByTagName('tbody')[0];
    const rows = tableBody.getElementsByTagName('tr');
    for (let i = 0; i < rows.length; i++) {
        rows[i].getElementsByTagName('td')[0].innerHTML = `<input type="checkbox" class="row-checkbox" /> ${i + 1}`;
    }
}

function updateUniqueCount() {
    updateParsedDataFromTable();

    const infrastructureType = document.getElementById('infrastructure-select').value;
    const uniqueCountElement = document.getElementById('unique-count');

    const count = parsedData.filter(row => row['Infrastructure type'] === infrastructureType).length;

    uniqueCountElement.textContent = `${count} unique ${infrastructureType}(s) found`;
}
