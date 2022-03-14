function check_nickname(){
    let nickname_elem = document.getElementById("nickname");
    let nickname = nickname_elem.value;
    let empty_nickname_elem = document.getElementById("empty_nickname");

    if(nickname === ""){
        console.log("empty nickname");
        empty_nickname_elem.removeAttribute("hidden");
        return false;
    }else{
        console.log("nickname not empty");
        empty_nickname_elem.setAttribute("hidden", true);
        return true;
    }
};

function check_password(){
    let password_elem = document.getElementById("password");
    let password = password_elem.value;
    let empty_password_elem = document.getElementById("empty_password");
    if(password === ""){
        console.log("empty password");
        empty_password_elem.removeAttribute("hidden");
        return false;
    }else{
        console.log("password not empty");
        empty_password_elem.setAttribute("hidden", true);
        return true;
    }
};

function check_submit(event){
    let valid_sub = check_nickname();
    valid_sub = check_password() && valid_sub;
    if(valid_sub){
        return true;
    }else{
        console.log("empty nickname or password");
        event.preventDefault();
        return false;
    }
};

let nickname_elem = document.getElementById("nickname");

let password_elem = document.getElementById("password");

let form_elem = document.getElementById("form");
form.addEventListener('submit', check_submit);   