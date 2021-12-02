const statusMessage = document.getElementById('status-message');
const goToLogin = document.getElementById('go-to-login');

function resetPassword(){

    const data = {
        Email: document.getElementById("email").value,
    };

    fetch("/api/reset-password", {
        headers: {
            "Content-Type": "application/json; charset=UTF-8",
        },
        method: "POST",
        body: JSON.stringify(data)
    }).then(res => {
        return res.json();
    }).then(data => {

        statusMessage.innerText = data.msg; 
        if(data.mailsent){
            goToLogin.innerText = "Gå tilbage til login" 
        }
    
    }).catch(error => {
        console.log(error);
    });
}