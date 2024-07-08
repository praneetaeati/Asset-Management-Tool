const assets = [
    { sno: 1, name: 'Computer A', model: 'Model X', location: 'Office 1', custodian: 'John Doe' },
    { sno: 2, name: 'Computer B', model: 'Model Y', location: 'Office 2', custodian: 'Jane Smith' },
    { sno: 3, name: 'Computer C', model: 'Model Z', location: 'Office 3', custodian: 'Alice Johnson' }
];

document.addEventListener('DOMContentLoaded', () => {
    const assetTableBody = document.querySelector('#assetTable tbody');

    assets.forEach(asset => {
        const row = document.createElement('tr');

        const snoCell = document.createElement('td');
        snoCell.textContent = asset.sno;
        row.appendChild(snoCell);

        const nameCell = document.createElement('td');
        nameCell.textContent = asset.name;
        row.appendChild(nameCell);

        const modelCell = document.createElement('td');
        modelCell.textContent = asset.model;
        row.appendChild(modelCell);

        const locationCell = document.createElement('td');
        locationCell.textContent = asset.location;
        row.appendChild(locationCell);

        const custodianCell = document.createElement('td');
        custodianCell.textContent = asset.custodian;
        row.appendChild(custodianCell);

        assetTableBody.appendChild(row);
    });
});
