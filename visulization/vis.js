let chart = null;

function displayData(data) {
    const tableBody = document.getElementById('asset-table').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';
    data.forEach((row, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><input type="checkbox" class="row-checkbox" /> ${index + 1}</td>
            <td contenteditable="true">${row['Computer name'] || ''}</td>
            <td contenteditable="true">${row['User name'] || ''}</td>
            <td contenteditable="true">${row['Department'] || ''}</td>
            <td contenteditable="true">${row['Location'] || ''}</td>
            <td contenteditable="true">${row['IP Address'] || ''}</td>
            <td contenteditable="true">${row['Custodian'] || ''}</td>
        `;
        tableBody.appendChild(tr);
    });

    visualizeData(data);
}

function visualizeData(data) {
    const ctx = document.getElementById('data-chart').getContext('2d');

    // Example: Visualize the count of assets per department
    const departments = {};
    data.forEach(row => {
        const department = row['Department'];
        if (department) {
            departments[department] = (departments[department] || 0) + 1;
        }
    });

    const labels = Object.keys(departments);
    const counts = Object.values(departments);

    if (chart) {
        chart.destroy();
    }

    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Assets per Department',
                data: counts,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}
