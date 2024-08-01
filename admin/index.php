<?php
include 'auth.php'; // ตรวจสอบการเข้าสู่ระบบ
include "../connectDB.php";
// โค้ดที่เกี่ยวข้องกับ Admin Dashboard
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta name="description" content="">
    <meta name="author" content="">
    <title>SB Admin 2 - Dashboard</title>
    <link href="vendor/fontawesome-free/css/all.min.css" rel="stylesheet" type="text/css">
    <link
        href="https://fonts.googleapis.com/css?family=Nunito:200,200i,300,300i,400,400i,600,600i,700,700i,800,800i,900,900i"
        rel="stylesheet">
    <link href="css/sb-admin-2.min.css" rel="stylesheet">
    <script src="js/alerts.js"></script>

</head>

<body id="page-top">

    <!-- Page Wrapper -->
    <div id="wrapper">

        <!-- Sidebar -->
        <ul class="navbar-nav bg-gradient-primary sidebar sidebar-dark accordion" id="accordionSidebar">

            <!-- Sidebar - Brand -->
            <a class="sidebar-brand d-flex align-items-center justify-content-center" href="index.html">
                <div class="sidebar-brand-icon rotate-n-15">
                    <i class="fas fa-laugh-wink"></i>
                </div>
                <div class="sidebar-brand-text mx-3">Admin</div>
            </a>

            <!-- Divider -->
            <hr class="sidebar-divider my-0">

            <!-- Nav Item - Dashboard -->
            <li class="nav-item active">
                <a class="nav-link" href="index.html">
                    <i class="fas fa-fw fa-tachometer-alt"></i>
                    <span>Dashboard</span></a>
            </li>

            <!-- Nav Item - Ordering Information -->
            <li class="nav-item">
                <a class="nav-link" href="orderList.php">
                    <i class="fas fa-fw fa-info-circle"></i>
                    <span>Ordering Information</span></a>
            </li>

            <!-- Nav Item - Edit Product -->
            <li class="nav-item">
                <a class="nav-link" href="productEdit.php">
                    <i class="fas fa-fw fa-edit"></i>
                    <span>Edit Product</span></a>
            </li>

            <!-- Nav Item - Notification of News -->
            <li class="nav-item">
                <a class="nav-link" href="notification-of-news.html">
                    <i class="fas fa-fw fa-bell"></i>
                    <span>Notification of News</span></a>
            </li>
        </ul>
        <!-- End of Sidebar -->

        <!-- Content Wrapper -->
        <div id="content-wrapper" class="d-flex flex-column">

            <!-- Main Content -->
            <div id="content">

                <!-- Topbar -->
                <nav class="navbar navbar-expand navbar-light bg-white topbar mb-4 static-top shadow">

                    <!-- Sidebar Toggle (Topbar) -->
                    <button id="sidebarToggleTop" class="btn btn-link d-md-none rounded-circle mr-3">
                        <i class="fa fa-bars"></i>
                    </button>

                    <!-- Topbar Navbar -->
                    <ul class="navbar-nav ml-auto">

                        <!-- Nav Item - Search Dropdown (Visible Only XS) -->
                        <li class="nav-item dropdown no-arrow d-sm-none">
                            <a class="nav-link dropdown-toggle" href="#" id="searchDropdown" role="button"
                                data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                <i class="fas fa-search fa-fw"></i>
                            </a>
                            <!-- Dropdown - Messages -->
                            <div class="dropdown-menu dropdown-menu-right p-3 shadow animated--grow-in"
                                aria-labelledby="searchDropdown">
                                <form class="form-inline mr-auto w-100 navbar-search">
                                    <div class="input-group">
                                        <input type="text" class="form-control bg-light border-0 small"
                                            placeholder="Search for..." aria-label="Search"
                                            aria-describedby="basic-addon2">
                                        <div class="input-group-append">
                                            <button class="btn btn-primary" type="button">
                                                <i class="fas fa-search fa-sm"></i>
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </li>

                        <!-- Nav Item - Alerts -->
                        <li class="nav-item dropdown no-arrow mx-1 show">
                            <a class="nav-link dropdown-toggle" href="#" id="alertsDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                                <i class="fas fa-bell fa-fw"></i>
                                <!-- Counter - Alerts -->
                                <span class="badge badge-danger badge-counter">3+</span>
                            </a>
                            <!-- Dropdown - Alerts -->
                            <div class="dropdown-list dropdown-menu dropdown-menu-right shadow animated--grow-in show" aria-labelledby="alertsDropdown">
                                <h6 class="dropdown-header">
                                    Alerts Center
                                </h6>
                                <!-- New Order Alert -->
                                <a class="dropdown-item d-flex align-items-center" href="orderDetails.php">
                                    <div class="mr-3">
                                        <div class="icon-circle bg-info">
                                            <i class="fas fa-shopping-cart text-white"></i>
                                        </div>
                                    </div>
                                    <div>
                                        <div class="small text-gray-500"><?= date('F j, Y') ?></div>
                                        <span class="font-weight-bold">New order received!</span>
                                    </div>
                                </a>
                                <!-- Other alerts -->
                                <a class="dropdown-item d-flex align-items-center" href="#">
                                    <div class="mr-3">
                                        <div class="icon-circle bg-primary">
                                            <i class="fas fa-file-alt text-white"></i>
                                        </div>
                                    </div>
                                </a>
                                <a class="dropdown-item text-center small text-gray-500" href="#">Show All Alerts</a>
                            </div>
                        </li>

                        <div class="topbar-divider d-none d-sm-block"></div>

                        <!-- Nav Item - User Information -->
                        <li class="nav-item dropdown no-arrow">
                            <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button"
                                data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                <span class="mr-2 d-none d-lg-inline text-gray-600 small">Admin</span>
                                <img class="img-profile rounded-circle"
                                    src="img/undraw_profile.svg">
                            </a>
                            <!-- Dropdown - User Information -->
                            <div class="dropdown-menu dropdown-menu-right shadow animated--grow-in"
                                aria-labelledby="userDropdown">
                                <div class="dropdown-divider"></div>
                                <a class="dropdown-item" href="logout.php" data-toggle="modal" data-target="#logoutModal">
                                    <i class="fas fa-sign-out-alt fa-sm fa-fw mr-2 text-gray-400"></i>
                                    Logout
                                </a>
                            </div>
                        </li>
                    </ul>

                </nav>
                <!-- End of Topbar -->

                <!-- Begin Page Content -->
                <div class="container-fluid">

                    <!-- Content Row -->
                    <div class="row">

                     <!-- Earnings (Monthly) Card Example -->
                    <div class="col-xl-3 col-md-6 mb-4">
                        <div class="card border-left-primary shadow h-100 py-2">
                            <div class="card-body">
                                <div class="row no-gutters align-items-center">
                                    <div class="col mr-2">
                                        <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">
                                            Earnings (Monthly)</div>
                                        <div class="h5 mb-0 font-weight-bold text-gray-800" id="monthlyEarnings">฿0</div>
                                    </div>
                                    <div class="col-auto">
                                        <i class="fas fa-calendar fa-2x text-gray-300"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <script>
                        fetch('getMonthlyRevenue.php')
                        .then(response => response.json())
                        .then(data => {
                            console.log(data); // For debugging, to see what data is returned
                            if (data.length > 0) {
                                let latestMonthRevenue = data[0].total_revenue;
                                document.getElementById('monthlyEarnings').innerText = "฿" + latestMonthRevenue.toFixed(2);
                            } else {
                                document.getElementById('monthlyEarnings').innerText = "฿0";
                            }
                        })
                        .catch(error => console.error('Error:', error));
                    </script>

                        <!-- Earnings (Annual) Card Example -->
                        <div class="col-xl-3 col-md-6 mb-4">
                            <div class="card border-left-success shadow h-100 py-2">
                                <div class="card-body">
                                    <div class="row no-gutters align-items-center">
                                        <div class="col mr-2">
                                            <div class="text-xs font-weight-bold text-success text-uppercase mb-1">
                                                Earnings (Annual)
                                            </div>
                                            <div class="h5 mb-0 font-weight-bold text-gray-800" id="annualEarnings">฿0</div>
                                        </div>
                                        <div class="col-auto">
                                            <i class="fas fa-dollar-sign fa-2x text-gray-300"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <script>
                        // Fetch and display monthly earnings
                        fetch('getMonthlyRevenue.php')
                            .then(response => response.json())
                            .then(data => {
                                console.log('Fetched Monthly Data:', data); // Add this line for debugging
                                if (data.length > 0) {
                                    let latestMonthRevenue = data[0].total_revenue;
                                    document.getElementById('monthlyEarnings').innerText = "฿" + latestMonthRevenue;
                                } else {
                                    document.getElementById('monthlyEarnings').innerText = "฿0";
                                }
                            })
                            .catch(error => console.error('Error fetching monthly revenue:', error));

                        // Fetch and display annual earnings
                        fetch('getAnnualRevenue.php')
                            .then(response => response.json())
                            .then(data => {
                                console.log('Fetched Annual Data:', data); // Add this line for debugging
                                let annualRevenue = data.total_revenue;
                                document.getElementById('annualEarnings').innerText = "฿" + annualRevenue;
                            })
                            .catch(error => console.error('Error fetching annual revenue:', error));
                        </script>

                        <!-- Pending Requests Card Example -->
                        <div class="col-xl-3 col-md-6 mb-4">
                            <div class="card border-left-warning shadow h-100 py-2">
                                <div class="card-body">
                                    <div class="row no-gutters align-items-center">
                                        <div class="col mr-2">
                                            <div class="text-xs font-weight-bold text-warning text-uppercase mb-1">
                                                Pending Requests
                                            </div>
                                            <div class="h5 mb-0 font-weight-bold text-gray-800" id="pendingRequests">0</div>
                                        </div>
                                        <div class="col-auto">
                                            <i class="fas fa-comments fa-2x text-gray-300"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <script>
                            // Fetch and display monthly earnings
                            fetch('getMonthlyRevenue.php')
                                .then(response => response.json())
                                .then(data => {
                                    if (data.length > 0) {
                                        let latestMonthRevenue = data[0].total_revenue;
                                        document.getElementById('monthlyEarnings').innerText = "฿" + latestMonthRevenue;
                                    } else {
                                        document.getElementById('monthlyEarnings').innerText = "฿0";
                                    }
                                })
                                .catch(error => console.error('Error fetching monthly revenue:', error));
                            
                            // Fetch and display annual earnings
                            fetch('getAnnualRevenue.php')
                                .then(response => response.json())
                                .then(data => {
                                    let annualRevenue = data.total_revenue;
                                    document.getElementById('annualEarnings').innerText = "฿" + annualRevenue;
                                })
                                .catch(error => console.error('Error fetching annual revenue:', error));
                            
                            // Fetch and display pending requests
                            fetch('getPendingRequests.php')
                                .then(response => response.json())
                                .then(data => {
                                    let pendingRequests = data.pending_count;
                                    document.getElementById('pendingRequests').innerText = pendingRequests;
                                })
                                .catch(error => console.error('Error fetching pending requests:', error));
                            </script>

                            <!-- Pending Requests Card Example -->
                            <div class="col-xl-3 col-md-6 mb-4">
                                <div class="card border-left-warning shadow h-100 py-2">
                                    <div class="card-body">
                                        <div class="row no-gutters align-items-center">
                                            <div class="col mr-2">
                                                <div class="text-xs font-weight-bold text-warning text-uppercase mb-1">
                                                    Completed Orders</div>
                                                <div class="h5 mb-0 font-weight-bold text-gray-800" id="completedOrdersCount">0</div>
                                            </div>
                                            <div class="col-auto">
                                                <i class="fas fa-comments fa-2x text-gray-300"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <script>
                                fetch('getCompletedOrders.php')
                                    .then(response => response.json())
                                    .then(data => {
                                        document.getElementById('completedOrdersCount').innerText = data.completed_orders;
                                    })
                                    .catch(error => console.error('Error:', error));
                            </script>


                        <!-- Area Chart -->
                        <div class="col-xl-8 col-lg-7">
                            <div class="card shadow mb-4">
                                <!-- Card Header - Dropdown -->
                                <div class="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                                    <h6 class="m-0 font-weight-bold text-primary">Earnings Overview</h6>
                                    <div class="dropdown no-arrow">
                                        <a class="dropdown-toggle" href="#" role="button" id="dropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                            <i class="fas fa-ellipsis-v fa-sm fa-fw text-gray-400"></i>
                                        </a>
                                        <div class="dropdown-menu dropdown-menu-right shadow animated--fade-in" aria-labelledby="dropdownMenuLink">
                                            <div class="dropdown-header">Dropdown Header:</div>
                                            <a class="dropdown-item" href="#">Action</a>
                                            <a class="dropdown-item" href="#">Another action</a>
                                            <div class="dropdown-divider"></div>
                                            <a class="dropdown-item" href="#">Something else here</a>
                                        </div>
                                    </div>
                                </div>
                                <!-- Card Body -->
                                <div class="card-body">
                                    <div class="chart-area">
                                        <canvas id="myAreaChart"></canvas>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
                        <script>
                            fetch('admin/getEarningsOverview.php')
                                .then(response => response.json())
                                .then(data => {
                                    const labels = data.map(item => item.month);
                                    const earnings = data.map(item => item.total_revenue);

                                    const ctx = document.getElementById("myAreaChart").getContext("2d");
                                    new Chart(ctx, {
                                        type: 'line',
                                        data: {
                                            labels: labels,
                                            datasets: [{
                                                label: "Earnings",
                                                lineTension: 0.3,
                                                backgroundColor: "rgba(78, 115, 223, 0.05)",
                                                borderColor: "rgba(78, 115, 223, 1)",
                                                pointRadius: 3,
                                                pointBackgroundColor: "rgba(78, 115, 223, 1)",
                                                pointBorderColor: "rgba(78, 115, 223, 1)",
                                                pointHoverRadius: 3,
                                                pointHoverBackgroundColor: "rgba(78, 115, 223, 1)",
                                                pointHoverBorderColor: "rgba(78, 115, 223, 1)",
                                                pointHitRadius: 10,
                                                pointBorderWidth: 2,
                                                data: earnings,
                                            }],
                                        },
                                        options: {
                                            maintainAspectRatio: false,
                                            layout: {
                                                padding: {
                                                    left: 10,
                                                    right: 25,
                                                    top: 25,
                                                    bottom: 0
                                                }
                                            },
                                            scales: {
                                                xAxes: [{
                                                    time: {
                                                        unit: 'date'
                                                    },
                                                    gridLines: {
                                                        display: false,
                                                        drawBorder: false
                                                    },
                                                    ticks: {
                                                        maxTicksLimit: 7
                                                    }
                                                }],
                                                yAxes: [{
                                                    ticks: {
                                                        maxTicksLimit: 5,
                                                        padding: 10,
                                                        // Include a dollar sign in the ticks
                                                        callback: function(value, index, values) {
                                                            return '$' + value;
                                                        }
                                                    },
                                                    gridLines: {
                                                        color: "rgb(234, 236, 244)",
                                                        zeroLineColor: "rgb(234, 236, 244)",
                                                        drawBorder: false,
                                                        borderDash: [2],
                                                        zeroLineBorderDash: [2]
                                                    }
                                                }],
                                            },
                                            legend: {
                                                display: false
                                            },
                                            tooltips: {
                                                backgroundColor: "rgb(255,255,255)",
                                                bodyFontColor: "#858796",
                                                titleMarginBottom: 10,
                                                titleFontColor: '#6e707e',
                                                titleFontSize: 14,
                                                borderColor: '#dddfeb',
                                                borderWidth: 1,
                                                xPadding: 15,
                                                yPadding: 15,
                                                displayColors: false,
                                                intersect: false,
                                                mode: 'index',
                                                caretPadding: 10,
                                                callbacks: {
                                                    label: function(tooltipItem, chart) {
                                                        var datasetLabel = chart.datasets[tooltipItem.datasetIndex].label || '';
                                                        return datasetLabel + ': $' + tooltipItem.yLabel;
                                                    }
                                                }
                                            }
                                        }
                                    });
                                })
                                .catch(error => console.error('Error:', error));
                        </script>

                        <!-- Pie Chart -->
                        <div class="col-xl-4 col-lg-5">
                            <div class="card shadow mb-4">
                                <!-- Card Header - Dropdown -->
                                <div class="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                                    <h6 class="m-0 font-weight-bold text-primary">Order Status Distribution</h6>
                                    <div class="dropdown no-arrow">
                                        <a class="dropdown-toggle" href="#" role="button" id="dropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                            <i class="fas fa-ellipsis-v fa-sm fa-fw text-gray-400"></i>
                                        </a>
                                        <div class="dropdown-menu dropdown-menu-right shadow animated--fade-in" aria-labelledby="dropdownMenuLink">
                                            <div class="dropdown-header">Dropdown Header:</div>
                                            <a class="dropdown-item" href="#">Action</a>
                                            <a class="dropdown-item" href="#">Another action</a>
                                            <div class="dropdown-divider"></div>
                                            <a class="dropdown-item" href="#">Something else here</a>
                                        </div>
                                    </div>
                                </div>
                                <!-- Card Body -->
                                <div class="card-body">
                                    <div class="chart-pie pt-4 pb-2">
                                        <canvas id="myPieChart"></canvas>
                                    </div>
                                    <div class="mt-4 text-center small">
                                        <span class="mr-2">
                                            <i class="fas fa-circle text-primary"></i> Awaiting
                                        </span>
                                        <span class="mr-2">
                                            <i class="fas fa-circle text-success"></i> In Progress
                                        </span>
                                        <span class="mr-2">
                                            <i class="fas fa-circle text-info"></i> Completed
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                <!-- /.container-fluid -->
            </div>
            <!-- End of Main Content -->
        </div>
        <!-- End of Content Wrapper -->

    </div>
    <!-- End of Page Wrapper -->

    <!-- Scroll to Top Button-->
    <a class="scroll-to-top rounded" href="#page-top">
        <i class="fas fa-angle-up"></i>
    </a>

    <!-- Logout Modal-->
    <div class="modal fade" id="logoutModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel"
        aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">Ready to Leave?</h5>
                    <button class="close" type="button" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">×</span>
                    </button>
                </div>
                <div class="modal-body">Select "Logout" below if you are ready to end your current session.</div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" type="button" data-dismiss="modal">Cancel</button>
                    <a class="btn btn-primary" href="login.php">Logout</a>
                </div>
            </div>
        </div>
    </div>

    <!-- Bootstrap core JavaScript-->
    <script src="vendor/jquery/jquery.min.js"></script>
    <script src="vendor/bootstrap/js/bootstrap.bundle.min.js"></script>

    <!-- Core plugin JavaScript-->
    <script src="vendor/jquery-easing/jquery.easing.min.js"></script>

    <!-- Custom scripts for all pages-->
    <script src="js/sb-admin-2.min.js"></script>

    <!-- Page level plugins -->
    <script src="vendor/chart.js/Chart.min.js"></script>

    <!-- Page level custom scripts -->
    <script src="js/demo/chart-area-demo.js"></script>
    <script src="js/demo/chart-pie-demo.js"></script>

</body>

</html>