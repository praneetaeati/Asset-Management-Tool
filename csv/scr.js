function setUserRole() {
    const role = prompt('Are you an admin? (yes/no)');
    if (role.toLowerCase() === 'yes') {
        const password = prompt('Enter the admin password:');
        if (password === 'vpt2024') {
            isAdmin = true;
            // Redirect to admin page
            window.location.href = './csv/i.html';
        } else {
            isAdmin = false;
            // Redirect to employee page
            window.location.href = '../employee/employee.html';
        }
    } else {
        isAdmin = false;
        // Redirect to employee page
        window.location.href = '../employee/employee.html';
    }
    // Enable or disable edit options based on the user role
    if (isAdmin) {
        enableEditOptions();
    } else {
        disableEditOptions();
    }
}




function enableEditOptions() {
    // Enable edit options for admins
    const editElements = document.querySelectorAll('[contenteditable="false"]');
    editElements.forEach((element) => {
        element.setAttribute('contenteditable', 'true');
    });
}

function disableEditOptions() {
    // Disable edit options for employees
    const editElements = document.querySelectorAll('[contenteditable="true"]');
    editElements.forEach((element) => {
        element.setAttribute('contenteditable', 'false');
    });
}

// Your other functions remain the same...


document.getElementById('upload-file').addEventListener('change', handleFileUpload);
document.getElementById('save-file').addEventListener('click', saveFile);
document.getElementById('add-row').addEventListener('click', addRow);
document.getElementById('add-column').addEventListener('click', addColumn);
document.getElementById('remove-row').addEventListener('click', removeSelectedRows);
document.getElementById('remove-column').addEventListener('click', removeSelectedColumns);
document.getElementById('search-input').addEventListener('input', filterRows);

let parsedData = [];
let fileExtension = '';

function displayData(data) {
    const tableBody = document.getElementById('asset-table').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';
    data.forEach((row, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><input type="checkbox" class="row-checkbox" /> ${index + 1}</td>
            <td contenteditable="${isAdmin}">${row['Computer name'] || ''}</td>
            <td contenteditable="${isAdmin}">${row['User name'] || ''}</td>
            <td contenteditable="${isAdmin}">${row['Department'] || ''}</td>
            <td contenteditable="${isAdmin}">${row['Location'] || ''}</td>
            <td contenteditable="${isAdmin}">${row['IP Address'] || ''}</td>
            <td contenteditable="${isAdmin}">${row['Custodian'] || ''}</td>
        `;
        tableBody.appendChild(tr);
    });
}

function handleFileUpload(event) {
    if (!isAdmin) {
        alert('You do not have permission to perform this action.');
        return;
    }

    const file = event.target.files[0];
    fileExtension = file.name.split('.').pop();

    if (fileExtension === 'csv') {
        Papa.parse(file, {
            header: true,
            complete: function(results) {
                parsedData = results.data;
                displayData(parsedData);
            }
        });
    } else if (['xlsx', 'xls'].includes(fileExtension)) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            parsedData = XLSX.utils.sheet_to_json(worksheet);
            displayData(parsedData);
        };
        reader.readAsArrayBuffer(file);
    } else {
        alert('Unsupported file format. Please upload a CSV, XLSX, or XLS file.');
    }
}

function saveFile() {
    if (!isAdmin) {
        alert('You do not have permission to perform this action.');
        return;
    }

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
        const blob = new Blob([s2ab(wbout)], { type: 'application/octet-stream' });
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
    if (!isAdmin) {
        alert('You do not have permission to perform this action.');
        return;
    }

    const tableBody = document.getElementById('asset-table').getElementsByTagName('tbody')[0];
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td><input type="checkbox" class="row-checkbox" /> ${tableBody.getElementsByTagName('tr').length + 1}</td>
        <td contenteditable="${isAdmin}"></td>
        <td contenteditable="${isAdmin}"></td>
        <td contenteditable="${isAdmin}"></td>
        <td contenteditable="${isAdmin}"></td>
        <td contenteditable="${isAdmin}"></td>
        <td contenteditable="${isAdmin}"></td>
    `;
    tableBody.appendChild(newRow);
}

function addColumn() {
    if (!isAdmin) {
        alert('You do not have permission to perform this action.');
        return;
    }

    const tableHead = document.getElementById('asset-table').getElementsByTagName('thead')[0].getElementsByTagName('tr')[0];
    const tableBody = document.getElementById('asset-table').getElementsByTagName('tbody')[0];
    const newColumnName = prompt('Enter column name:');
    if (!newColumnName) return;

    const th = document.createElement('th');
    th.innerHTML = `<input type="checkbox" class="column-checkbox" /> ${newColumnName}`;
    tableHead.appendChild(th);

    for (const row of tableBody.getElementsByTagName('tr')) {
        const td = document.createElement('td');
        td.contentEditable = isAdmin ? 'true' : 'false';
        row.appendChild(td);
    }
}

function removeSelectedRows() {
    if (!isAdmin) {
        alert('You do not have permission to perform this action.');
        return;
    }

    const tableBody = document.getElementById('asset-table').getElementsByTagName('tbody')[0];
    const rows = tableBody.getElementsByTagName('tr');
    for (let i = rows.length - 1; i >= 0; i--) {
        const checkbox = rows[i].getElementsByClassName('row-checkbox')[0];
        if (checkbox.checked) {
            tableBody.removeChild(rows[i]);
        }
    }

    // Update serial numbers
    const updatedRows = tableBody.getElementsByTagName('tr');
    for (let i = 0; i < updatedRows.length; i++) {
        updatedRows[i].getElementsByTagName('td')[0].innerHTML = `<input type="checkbox" class="row-checkbox" /> ${i + 1}`;
    }
}

function removeSelectedColumns() {
    if (!isAdmin) {
        alert('You do not have permission to perform this action.');
        return;
    }

    const tableHead = document.getElementById('asset-table').getElementsByTagName('thead')[0].getElementsByTagName('tr')[0];
    const tableBody = document.getElementById('asset-table').getElementsByTagName('tbody')[0];

    const columnCheckboxes = tableHead.getElementsByClassName('column-checkbox');
    const columnsToRemove = [];

    for (let i = 0; i < columnCheckboxes.length; i++) {
        if (columnCheckboxes[i].checked) {
            columnsToRemove.push(i);
        }
    }

    // Remove columns from header
    for (let i = columnsToRemove.length - 1; i >= 0; i--) {
        tableHead.removeChild(tableHead.children[columnsToRemove[i]]);
    }

    // Remove columns from rows
    for (const row of tableBody.getElementsByTagName('tr')) {
        for (let i = columnsToRemove.length - 1; i >= 0; i--) {
            row.removeChild(row.children[columnsToRemove[i]]);
        }
    }
}

function filterRows() {
    const searchValue = document.getElementById('search-input').value.trim().toLowerCase();
    const tableBody = document.getElementById('asset-table').getElementsByTagName('tbody')[0];
    const rows = tableBody.getElementsByTagName('tr');

    for (const row of rows) {
        const cells = row.getElementsByTagName('td');
        let match = false;
        for (const cell of cells) {
            const cellText = cell.textContent.trim().toLowerCase();
            if (cellText.includes(searchValue)) {
                match = true;
                break;
            }
        }
        row.style.display = match ? '' : 'none';
    }
}
