const message = document.getElementById('message-status');

function login(){

    const data = {
        email: document.getElementById("email-login").value,
        password: document.getElementById("password-login").value
    };

    fetch("/api/login", {
        headers: {
            "Content-Type": "application/json; charset=UTF-8",
        },
        method: "POST",
        body: JSON.stringify(data)
    })
    .then(response => response.json()) 
    .then(data => {
        if (data.loginSuccess == true){
            window.location.href = "/user-profile";
        } else {
            message.style.color = "red";
            message.innerText = 'Wrong username/password';
        }
    }).catch(error => {
        console.log(error);
    });
}