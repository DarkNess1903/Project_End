async function fetchDashboardData() {
    try {
        let response = await fetch('getDashboardData.php');
        let data = await response.json();

        new Chart(document.getElementById('dailySalesChart'), {
            type: 'line',
            data: {
                labels: data.dailySales.map(item => item.date),
                datasets: [{
                    label: 'ยอดขายรายวัน',
                    data: data.dailySales.map(item => item.total),
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            }
        });

        new Chart(document.getElementById('weeklySalesChart'), {
            type: 'bar',
            data: {
                labels: data.weeklySales.map(item => `Week ${item.week} (${item.year})`),
                datasets: [{
                    label: 'ยอดขายรายสัปดาห์',
                    data: data.weeklySales.map(item => item.total),
                    backgroundColor: 'rgba(153, 102, 255, 0.2)',
                    borderColor: 'rgba(153, 102, 255, 1)',
                    borderWidth: 1
                }]
            }
        });

        new Chart(document.getElementById('monthlySalesChart'), {
            type: 'bar',
            data: {
                labels: data.monthlySales.map(item => `Month ${item.month} (${item.year})`),
                datasets: [{
                    label: 'ยอดขายรายเดือน',
                    data: data.monthlySales.map(item => item.total),
                    backgroundColor: 'rgba(255, 159, 64, 0.2)',
                    borderColor: 'rgba(255, 159, 64, 1)',
                    borderWidth: 1
                }]
            }
        });

        let statusList = document.getElementById('orderStatusList');
        data.orderStatus.forEach(status => {
            let li = document.createElement('li');
            li.textContent = `${status.status}: ${status.count} orders`;ฟ
            statusList.appendChild(li);
        });

    } catch (error) {
        console.error('Error fetching dashboard data:', error);
    }
}

fetchDashboardData();
