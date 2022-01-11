function check_nickname(){
    let nickname_elem = document.getElementById("nickname");
    let nickname = nickname_elem.value;
    console.log({nickname:nickname});
    let matches = nickname.match("^[a-zA-Z][a-zA-Z0-9]*$");
    let invalid_nickname_elem = document.getElementById("invalid_nickname");
    if(matches == null){
        console.log("nickname invalido");
        invalid_nickname_elem.removeAttribute("hidden");
        return false;
    } else{
        invalid_nickname_elem.setAttribute("hidden", true);
        console.log("nickname valido");
        return true;
    }
};

// function check_password_callback(){
//     let target = event.target || event.srcElement;
//     let id = target.id;
//     console.log({id:id});
//     check_password(id);
// }

function check_password(id){
    let password_elem = document.getElementById(id);
    let password = password_elem.value;
    let invalid_password_elem = document.getElementById("invalid_" + id);
    if(/[a-z]/.test(password) && /[A-Z]/.test(password) && /[0-9]/.test(password) && password.length >= 4   ){
        console.log("valid password");
        invalid_password_elem.setAttribute("hidden", true);
        return true;
    }else{
        invalid_password_elem.removeAttribute("hidden");
        console.log("invalid password");
        return false;
    }
}

function check_password_callback_key(){
    let password_elem = document.getElementById("first_password");
    let password = password_elem.value;
    let password_lowercase_elem = document.getElementById("password_lowercase");
    if(/[a-z]/.test(password)){
        password_lowercase_elem.style.color = "#00bb00";
    }else{
        password_lowercase_elem.style.color = "#ff0000";
    }

    let password_uppercase_elem = document.getElementById("password_uppercase");
    if(/[A-Z]/.test(password)){
        password_uppercase_elem.style.color = "#00bb00";
    }else{
        password_uppercase_elem.style.color = "#ff0000";
    }

    let password_number_elem = document.getElementById("password_number");
    if(/[0-9]/.test(password)){
        password_number_elem.style.color = "#00bb00";
    }else{
        password_number_elem.style.color = "#ff0000";
    }

    let password_length_elem = document.getElementById("password_length");
    if(password.length >= 4){
        password_length_elem.style.color = "#00bb00";
    }else{
        password_length_elem.style.color = "#ff0000";
    }

    if(/[a-z]/.test(password) && /[A-Z]/.test(password) && /[0-9]/.test(password) && password.length >= 4){
        return true;
    }else{
        return false;
    }
}

function check_same_password(){
    let first_password_elem = document.getElementById("first_password");
    let first_password = first_password_elem.value;

    let second_password_elem = document.getElementById("second_password");
    let second_password = second_password_elem.value;

    let different_passwords_elem = document.getElementById("different_passwords");

    if(first_password !== second_password){
        console.log("different passwords");
        different_passwords_elem.removeAttribute("hidden");
        return false;
    }else{
        different_passwords_elem.setAttribute("hidden", true);
        console.log("same passwords");
        return true;
    }
};

function check_submit(event){
    let valid_sub = check_nickname();
    valid_sub = check_password("first_password") && valid_sub;
    valid_sub = check_password("second_password") && valid_sub;
    valid_sub = check_same_password() && valid_sub;
    if(valid_sub){
        return true;
    }else{
        console.log("not ok nickname or different passwords or not ok password");
        event.preventDefault();
        return false;
    }
};

let nickname_elem = document.getElementById("nickname");
nickname_elem.addEventListener("focusout", check_nickname);

let first_password_elem = document.getElementById("first_password");
first_password_elem.addEventListener("keyup", check_password_callback_key);

// let first_password_elem = document.getElementById("first_password");
// first_password_elem.addEventListener("focusout", check_password_callback);

// let second_password_elem = document.getElementById("second_password");
// second_password_elem.addEventListener("focusout", check_password_callback);

let form_elem = document.getElementById("form");
form.addEventListener('submit', check_submit);  