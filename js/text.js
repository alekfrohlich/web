// function delete_post(){
//     var xhr1 = new XMLHttpRequest();
//     xhr1.open('DELETE', "http://127.0.0.1:80/users/delete/", true);
//     xhr1.onreadystatechange = function() {
//         if (this.status == 200 && this.readyState == 4) {

// const { redirect } = require("express/lib/response");

//             dostuff = this.responseText;
//     };//end onreadystate
//     xhr1.send();
//     }
// };

function go_to_edit_post(event){
    let location = window.location;
    console.log(location);
    console.log(typeof(location));
    console.log(location.href);
    console.log(typeof(location.href));
    let location_string = location.href;
    let index = location_string.indexOf("posts/");
    index += "posts/".length;
    console.log(index);
    console.log(location_string.substring(index));
    let post_id = location_string.substring(index);
    window.location = "/edit-post/" + post_id;
}

// async function delete_function() {
//     // Awaiting fetch which contains 
//     // method, headers and content-type
//     let location = window.location;
//     let location_string = location.href;
//     let index = location_string.indexOf("posts/");
//     index += "posts/".length;
//     console.log(index);
//     console.log(location_string.substring(index));
//     let post_id = location_string.substring(index);
//     console.log(post_id);
//     const response = await fetch("/delete-post/"+post_id, {
//         method: 'DELETE',
//         headers: {
//             'Content-type': 'application/json'
//         },
//         redirect: 'manual'
//     });
//     // console.log(response.url)
//     console.log(response);
//     window.location.href = response.url;
// }

let edit_button_elem = document.getElementById("edit_button");
if (edit_button_elem != null){
    edit_button_elem.addEventListener("click", go_to_edit_post);
}

// let del_button_elem = document.getElementById("delete_button");
// if (del_button_elem != null){
//     del_button_elem.addEventListener("click", delete_function);
// }
// <button id="edit_button"onclick="window.location='/edit-post/${this.post_id}'">Edit</button>