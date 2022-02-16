// function delete_post(){
//     var xhr1 = new XMLHttpRequest();
//     xhr1.open('DELETE', "http://127.0.0.1:80/users/delete/", true);
//     xhr1.onreadystatechange = function() {
//         if (this.status == 200 && this.readyState == 4) {

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

let edit_button_elem = document.getElementById("edit_button");
if (edit_button_elem != null){
    edit_button_elem.addEventListener("click", go_to_edit_post);
}
// <button id="edit_button"onclick="window.location='/edit-post/${this.post_id}'">Edit</button>