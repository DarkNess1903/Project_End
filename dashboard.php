<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard</title>
    <link rel="stylesheet" href="css/style.css"> <!-- Include your CSS file -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script> <!-- For charts -->
</head>
<body>
    <h1>Dashboard</h1>

    <!-- Section for daily sales -->
    <div id="dailySales">
        <h2>ยอดขายรายวัน</h2>
        <canvas id="dailySalesChart"></canvas> <!-- Chart for daily sales -->
    </div>

    <!-- Section for weekly sales -->
    <div id="weeklySales">
        <h2>ยอดขายรายสัปดาห์</h2>
        <canvas id="weeklySalesChart"></canvas> <!-- Chart for weekly sales -->
    </div>

    <!-- Section for monthly sales -->
    <div id="monthlySales">
        <h2>ยอดขายรายเดือน</h2>
        <canvas id="monthlySalesChart"></canvas> <!-- Chart for monthly sales -->
    </div>

    <!-- Section for order status -->
    <div id="orderStatus">
        <h2>สถานะออเดอร์</h2>
        <ul id="orderStatusList"></ul>
    </div>

    <script>
        async function fetchDashboardData() {
            try {
                let response = await fetch('getDashboardData.php');
                let data = await response.json();

                // Display daily sales
                const dailyLabels = data.dailySales.map(item => item.date);
                const dailyValues = data.dailySales.map(item => item.total);
                new Chart(document.getElementById('dailySalesChart').getContext('2d'), {
                    type: 'line',
                    data: {
                        labels: dailyLabels,
                        datasets: [{
                            label: 'ยอดขายรายวัน',
                            data: dailyValues,
                            borderColor: 'rgba(75, 192, 192, 1)',
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        scales: {
                            x: { beginAtZero: true },
                            y: { beginAtZero: true }
                        }
                    }
                });

                // Display weekly sales
                const weeklyLabels = data.weeklySales.map(item => `Week ${item.week} (${item.year})`);
                const weeklyValues = data.weeklySales.map(item => item.total);
                new Chart(document.getElementById('weeklySalesChart').getContext('2d'), {
                    type: 'bar',
                    data: {
                        labels: weeklyLabels,
                        datasets: [{
                            label: 'ยอดขายรายสัปดาห์',
                            data: weeklyValues,
                            backgroundColor: 'rgba(153, 102, 255, 0.2)',
                            borderColor: 'rgba(153, 102, 255, 1)',
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        scales: {
                            x: { beginAtZero: true },
                            y: { beginAtZero: true }
                        }
                    }
                });

                // Display monthly sales
                const monthlyLabels = data.monthlySales.map(item => `Month ${item.month} (${item.year})`);
                const monthlyValues = data.monthlySales.map(item => item.total);
                new Chart(document.getElementById('monthlySalesChart').getContext('2d'), {
                    type: 'pie',
                    data: {
                        labels: monthlyLabels,
                        datasets: [{
                            label: 'ยอดขายรายเดือน',
                            data: monthlyValues,
                            backgroundColor: [
                                'rgba(255, 99, 132, 0.2)',
                                'rgba(54, 162, 235, 0.2)',
                                'rgba(255, 206, 86, 0.2)',
                                'rgba(75, 192, 192, 0.2)',
                                'rgba(153, 102, 255, 0.2)',
                                'rgba(255, 159, 64, 0.2)'
                            ],
                            borderColor: [
                                'rgba(255, 99, 132, 1)',
                                'rgba(54, 162, 235, 1)',
                                'rgba(255, 206, 86, 1)',
                                'rgba(75, 192, 192, 1)',
                                'rgba(153, 102, 255, 1)',
                                'rgba(255, 159, 64, 1)'
                            ],
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true
                    }
                });

                // Display order status
                let statusList = document.getElementById('orderStatusList');
                statusList.innerHTML = '<h3>สถานะออเดอร์</h3>';
                data.orderStatus.forEach(status => {
                    let li = document.createElement('li');
                    li.textContent = `${status.status}: ${status.count} orders`;
                    statusList.appendChild(li);
                });

            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            }
        }

        fetchDashboardData();
    </script>
</body>
</html>
