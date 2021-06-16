var socket = io();
var host = socket["io"]["uri"] + ":" + location.port;
var council = "";
var council_users;
var council_messages;

$(function(){
    ('.grey_fadeout_layer').hide();
    $('#header').load(socket["io"]["uri"] + "/html/header.html");
    $('#footer').load(socket["io"]["uri"] + "/html/footer.html");
    $('#navbar').load(socket["io"]["uri"] + '/html/navbar.html');

    council = window.location.href.split("/").slice(-2)[0];

    socket.emit("check login council", window.sessionStorage.getItem('token'), council, function(result){
        if (result == "success"){   
            socket.emit("check council privileges", window.sessionStorage.getItem('token'), council, function(result){
                if (result["status"] == "failure") // Raadin hallinta palauttaa joko ainoastaan virheilmoituksen tai pinon dictejä, joissa on raadin hallintaan tarvittavat tiedot
                {
                    alert("Sinulla ei ole oikeuksia hallita tätä raatia.");
                }
                else {
                    council_messages = result["messages"];
                    council_users = result["users"];

                    let user_element = document.getElementById("list_of_users");
                    let action_list = document.getElementsById("list_of_actions");
                    let messages_element = document.getElementById("list_of_messages");
                    let action_template = document.querySelector("#user_actions");

                    for (let i = 0; i < council_users.length; i++)
                    {
                        let temp_user = document.createElement("div");
                        temp_user.classList.add("council_user");
                        temp_user.id = council_users[i]["user_id"];

                        let temp_user_name = document.createElement("div");
                        temp_user_name.classList.add("username");
                        temp_user_name.innerHTML = council_users[i]["username"];

                        let temp_user_icon = document.createElement("div");
                        temp_user_icon.classList.add(council_users[i]["role"]);

                        temp_user.appendChild(temp_user_icon);
                        temp_user.appendChild(temp_user_name);

                        user_element.appendChild(temp_user);

                        let temp_actions = document.importNode(action_template.content, true);
                        temp_actions.querySelector(".ban_button").id = temp_user.id + "banbutton";
                        temp_actions.querySelector(".promote_button").id = temp_user.id + "promotebutton";

                        action_list.appendChild(temp_actions);
                    }
                }
            })
        }
    })
})