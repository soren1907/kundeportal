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
            message.innerText = data.msg;
        }
    }).catch(error => {
        message.style.color = "red";
        message.innerText = "Antal forsøg overskredet. Prøv igen om 15 min."
        console.log(error);
    });
}