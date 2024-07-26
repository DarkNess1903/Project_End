<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard</title>
    <link rel="stylesheet" href="css/style.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
    <div class="container">
        <h1>Dashboard</h1>

        <!-- Total Sales Chart -->
        <div>
            <h2>Total Sales</h2>
            <canvas id="salesChart"></canvas>
        </div>

        <!-- Orders Chart -->
        <div>
            <h2>Number of Orders</h2>
            <canvas id="ordersChart"></canvas>
        </div>
    </div>

    <script>
        // Get total sales data from PHP
        async function fetchSalesData() {
            const response = await fetch('getSalesData.php');
            const data = await response.json();
            return data;
        }

        // Get number of orders data from PHP
        async function fetchOrdersData() {
            const response = await fetch('getOrdersData.php');
            const data = await response.json();
            return data;
        }

        // Render sales chart
        fetchSalesData().then(data => {
            const ctx = document.getElementById('salesChart').getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: data.labels,
                    datasets: [{
                        label: 'Total Sales',
                        data: data.values,
                        borderColor: 'rgba(75, 192, 192, 1)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        x: { beginAtZero: true },
                        y: { beginAtZero: true }
                    }
                }
            });
        });

        // Render orders chart
        fetchOrdersData().then(data => {
            const ctx = document.getElementById('ordersChart').getContext('2d');
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: data.labels,
                    datasets: [{
                        label: 'Number of Orders',
                        data: data.values,
                        backgroundColor: 'rgba(153, 102, 255, 0.2)',
                        borderColor: 'rgba(153, 102, 255, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        x: { beginAtZero: true },
                        y: { beginAtZero: true }
                    }
                }
            });
        });
    </script>
</body>
</html>
