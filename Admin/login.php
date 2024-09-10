<?php
session_start();
include '../public/connectDB.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $username = mysqli_real_escape_string($conn, $_POST['username']);
    $password = mysqli_real_escape_string($conn, $_POST['password']);

    $query = "SELECT * FROM admin WHERE username = ? AND password = ?";
    $stmt = mysqli_prepare($conn, $query);
    mysqli_stmt_bind_param($stmt, 'ss', $username, $password);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);

    if (mysqli_num_rows($result) == 1) {
        $_SESSION['admin_id'] = mysqli_fetch_assoc($result)['admin_id'];
        header("Location: index.php");
        exit();
    } else {
        $error = "Invalid username or password";
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Login</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
    <link rel="stylesheet" href="css/styles.css">
</head>
<body>
    <header>
        <h1>Admin Login</h1>
    </header>
    <main>
        <section>
            <form method="post" action="">
                <label for="username">Username:</label>
                <input type="text" id="username" name="username" required>
                <label for="password">Password:</label>
                <input type="password" id="password" name="password" required>
                <button type="submit">Login</button>
                <?php if (isset($error)): ?>
                    <p><?php echo htmlspecialchars($error); ?></p>
                <?php endif; ?>
            </form>
        </section>
    </main>
    <footer>
        <p>&copy; 2024 Your Store. All rights reserved.</p>
    </footer>
</body>
</html>

<style>
    body {
    font-family: 'Arial', sans-serif;
    background-color: #f4f6f9;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh;
    margin: 0;
}

header h1 {
    text-align: center;
    color: #333;
    margin-bottom: 30px;
}

main {
    background-color: #fff;
    padding: 40px;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;
}

form {
    display: flex;
    flex-direction: column;
}

label {
    font-size: 16px;
    margin-bottom: 8px;
    color: #555;
}

input[type="text"], input[type="password"] {
    padding: 10px;
    margin-bottom: 20px;
    border-radius: 5px;
    border: 1px solid #ddd;
    font-size: 16px;
    background-color: #f9f9f9;
}

button {
    padding: 10px;
    font-size: 16px;
    border: none;
    border-radius: 5px;
    background-color: #007bff;
    color: white;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

button:hover {
    background-color: #0056b3;
}

p {
    color: red;
    font-size: 14px;
    text-align: center;
}

footer {
    position: absolute;
    bottom: 20px;
    text-align: center;
    width: 100%;
}

footer p {
    color: #888;
}
</style>