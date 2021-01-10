<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Klimostat Login</title>
    <link rel="preconnect" href="https://fonts.gstatic.com">
    <link rel="stylesheet" href="login_style.css">
    <link rel="preconnect" href="https://fonts.gstatic.com">
    <link href="https://fonts.googleapis.com/css2?family=Karla:ital,wght@1,700&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta1/dist/css/bootstrap.min.css" rel="stylesheet"
          integrity="sha384-giJF6kkoqNQ00vy+HMDP7azOuL0xtbfIcaT9wjKHr8RbDVddVHyTfAAsrekwKmP1" crossorigin="anonymous">
</head>
<body>
    <div id="box" class="row position-absolute top-50 start-50 translate-middle ">
        <div id="infobox" class="col-4 p-4 top-0 start-50">
            <img src="../res/Logo.png" alt="Klimostat Logo" width=150px height=150px class="position-relative  mx-auto d-block">
            <p class="text-center position-relative align-center">
                Mit Hilfe von Klimostat
                können Sie ganz einfach
                die wichtigsten Daten
                unseres Server-Raumes
                auf einem Blick abrufen
            </p>
        </div>
        <div id="loginbox" class="col-8">
            <form action="../PHP/login.php" class=" text-center position-relative top-50 start-50 translate-middle">
                <input type="text" id="username" class="login border border-light border-1 rounded-1"  name="username" placeholder="Username"><br>
                <input type="password" id="passwort" class="login border border-light border-1 rounded-1" name="passwort" placeholder="· · · · · · · · · · · ·"><br><br>
                <button type="submit" id="loginbutton" class="btn btn-primary active border border-light border-1 rounded-1" data-bs-toggle="button" aria-pressed="true">Login</button>
            </form>
        </div>
    </div>
</body>
</html>