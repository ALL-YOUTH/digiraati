var socket = io();
var host = socket["io"]["uri"] + ":" + location.port;

var council_data;
var user_data;
var conclusion_data;
var modal_open = false;
var original_council_id;
var original_user_id;

$(function(){
    $('#user_modal_container').hide();
    $('#council_modal_container').hide();
    socket.emit('request full data');
    $('#council_content').hide();
    $('#users_content').hide();
    $('#council_angle_down').hide();
    $('#users_angle_down').hide();
});

$('#council_dropbox').click(function(e){
    $('#council_content').slideToggle("fast");
    $('#council_angle_down').toggle();
    $('#council_angle_up').toggle();
});

$('#users_dropbox').click(function(e){
    $('#users_content').slideToggle("fast");
    $('#users_angle_down').toggle();
    $('#users_angle_up').toggle();
});

$('#lataa').click(function(e){
    console.log("Emptying");
    $("#council_content").empty();
    $("#users_content").empty();
    socket.emit('request full data');
});

$('#cancel_council_btn').click(function(e){
        console.log("closing council");
    $('#council_modal_container').hide();
    modal_open = false;
});

$('#save_council_btn').click(function(e){
    var submittable = {}
    submittable["id"] = document.getElementById("council_id_entry").value;
    submittable["name"] = document.getElementById("council_name_entry").value;
    submittable["description"] = document.getElementById("council_description_entry").value;
    submittable["startdate"] = document.getElementById("council_startdate_entry").value;
    submittable["starttime"] = document.getElementById("council_starttime_entry").value;
    submittable["enddate"] = document.getElementById("council_enddate_entry").value;
    submittable["endtime"] = document.getElementById("council_endtime_entry").value;
    submittable["password"] = document.getElementById("council_password_entry").value;
    submittable["userlimit"] = document.getElementById("council_userlimit_entry").value;
    submittable["original_id"] = original_council_id;
    var sub_users = []
    document.getElementById("council_users_entry").value.split(',').forEach(element => { if (element != "") { sub_users.push(element)}});
    submittable["tags"] = sub_users;
    console.log("Submitting " + submittable)
    socket.emit("submit updated council data", submittable);

});

socket.on("user data updated successfully", function(){
    alert("Käyttäjän tiedot päivitetty.");
    $('#user_modal_container').hide();
    modal_open = false;
    $("#council_content").empty();
    $("#users_content").empty();
    socket.emit('request full data');
});

socket.on("user data update failed", function(){
    alert("Käyttäjän tietojen päivitys ei onnistunut.");
});

socket.on("council data updated successfully", function(){
    alert("Raadin tiedot päivitetty.");
    $('#council_modal_container').hide();
    modal_open = false;
    $("#council_content").empty();
    $("#users_content").empty();
    socket.emit('request full data');
});

socket.on("council data update failed", function(){
    alert("Raadin tietojen päivitys ei onnistunut.");
});

$('#save_user_btn').click(function(e){
    var submittable = {};
    submittable["id"] = document.getElementById("user_id_entry").value;
    submittable["username"] = document.getElementById("username_entry").value;
    submittable["email"] = document.getElementById("email_entry").value;
    submittable["fname"] = document.getElementById("first_name_entry").value;
    submittable["lname"] = document.getElementById("last_name_entry").value;
    submittable["description"] = document.getElementById("description_entry").value;
    submittable["location"] = document.getElementById("location_entry").value;
    submittable["original_id"] = original_user_id;
    console.log("Submitting " + submittable);
    socket.emit("submit updated user data", submittable);
});

$('#cancel_user_btn').click(function(e){
    console.log("closing user");
    $('#user_modal_container').hide();
    modal_open = false;
});

$(document).on('click', '.user_btn', function(e){
    if (modal_open === true)
    {
        return;
    }

    modal_open = true;
    var selected_user = user_data.filter(element => e.currentTarget.id === element["id"])[0];
    original_user_id = selected_user["id"];
    document.getElementById("user_id_entry").defaultValue = selected_user["id"];
    document.getElementById("username_entry").defaultValue = selected_user["username"];
    document.getElementById("email_entry").defaultValue = selected_user["email"];
    document.getElementById("first_name_entry").defaultValue = selected_user["fname"];
    document.getElementById("last_name_entry").defaultValue = selected_user["lname"];
    document.getElementById("description_entry").defaultValue = selected_user["description"];
    document.getElementById("location_entry").defaultValue = selected_user["location"];
    try {
        if (selected_user["tags"].length > 0) { document.getElementById("tags_entry").defaultValue = selected_user["tags"].map(tag => { return(tag + ", ")}); }
    }
    catch {
        document.getElementById("tags_entry").defaultValue = "";
    }
    $('#user_modal_container').show();
});

$(document).on('click', '.council_btn', function(e){
    if (modal_open === true)
    {
        return;
    }

    modal_open = true;
    var selected_council = council_data.filter(element => e.currentTarget.id === element["id"])[0];
    original_council_id = selected_council["id"];
    document.getElementById("council_id_entry").defaultValue = selected_council["id"];
    document.getElementById("council_name_entry").defaultValue = selected_council["name"];
    document.getElementById("council_description_entry").defaultValue = selected_council["description"];
    document.getElementById("council_startdate_entry").value = selected_council["startdate"];
    document.getElementById("council_starttime_entry").value = selected_council["starttime"];
    document.getElementById("council_enddate_entry").value = selected_council["enddate"];
    document.getElementById("council_endtime_entry").value = selected_council["endtime"];
    document.getElementById("council_password_entry").value = selected_council["password"];
    document.getElementById("council_userlimit_entry").value = selected_council["userlimit"];
    document.getElementById("council_users_entry").defaultValue = selected_council["users"].map(user => { return(user + ", ")})
    $("#council_modal_container").show();
});


$('#tallenna').click(function(e){
    console.log("Saving");
    socket.emit('request full data save', council_data, user_data, conclusion_data);
});

$('#palaa').click(function(e){
    console.log("returning");
    goToPage("/");
});

socket.on('return full data', function(c_data, u_data, conc_data){
    council_data = c_data;
    user_data = u_data;
    conclusion_data = conc_data;
    var council_content = document.getElementById("council_content");
    var user_content = document.getElementById("users_content");

    council_data.forEach(function(council){
        var temp_div = document.createElement('div');
        temp_div.classList.add("council_btn");
        temp_div.id = council["id"];
        var header_text = document.createElement('span');
        header_text.classList.add("header_text");
        header_text.innerHTML = council["name"] + " (" + council["id"] + ")";
        temp_div.appendChild(header_text);
        council_content.appendChild(temp_div);
    });

    user_data.forEach(function(user){
        var temp_user = document.createElement('div');
        temp_user.classList.add("user_btn");
        temp_user.id = user["id"];
        var header_text = document.createElement('span');
        header_text.classList.add("header_text");
        header_text.innerHTML = user["username"] + " (" + user["id"] + ")";
        temp_user.appendChild(header_text);
        user_content.appendChild(temp_user);
    });
});