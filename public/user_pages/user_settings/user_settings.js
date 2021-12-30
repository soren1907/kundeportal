function deleteProfile(){
    const password = document.getElementById("confirm-email").value;
    fetch("/api/profile", {
        headers: {
            "Content-Type": "application/json; charset=UTF-8",
        },
        method: "DELETE",
        body: JSON.stringify({password})
    }).then(res => {
        return res.json();
    }).then(data => {
        if (data.deleteSuccess == true){
            window.location.href = "/";
        } else {
            const deleteMessage = document.getElementById("delete-msg");
            deleteMessage.style.color= "red";
            deleteMessage.innerText = 'Forkert adgangskode';
        }
    }).catch(error => {
        console.log(error);
    });
}