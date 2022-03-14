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
