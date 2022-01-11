function enter_mathblog(){
    let mathblog_elem = document.getElementsByClassName("logo");
    mathblog_elem[0].style.color = "#000000";
    let mathblog_elem2 = document.getElementsByTagName("span");
    mathblog_elem2[0].style.color = "#bdaa00";
}

function leave_mathblog(){
    let mathblog_elem = document.getElementsByClassName("logo");
    mathblog_elem[0].style.color = "#bdaa00";
    let mathblog_elem2 = document.getElementsByTagName("span");
    mathblog_elem2[0].style.color = "#000000";
}

let mathblog_elem = document.getElementById("mathblog");
mathblog_elem.addEventListener("mouseenter", enter_mathblog);
mathblog_elem.addEventListener("mouseleave", leave_mathblog);