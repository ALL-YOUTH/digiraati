var socket = io();
var host = socket["io"]["uri"] + ":" + location.port;
var council = "";
var council_users;
var council_messages;
var alternator = 0;

$(function(){
    $('.grey_fadeout_layer').hide();
    $('#header').load(socket["io"]["uri"] + "/html/header.html");
    $('#footer').load(socket["io"]["uri"] + "/html/footer.html");
    $('#navbar').load(socket["io"]["uri"] + '/html/navbar.html');
    $('#council_content').hide();

    council = window.location.href.split("/").slice(-2)[0];

    socket.emit("check login council", window.sessionStorage.getItem('token'), council, function(result){
        if (result == "success"){   
            socket.emit("check council privileges", window.sessionStorage.getItem('token'), council, function(result){
                console.log("RESULT:");
                    console.log(result);
                if (result["status"] == "failure") // Raadin hallinta palauttaa joko ainoastaan virheilmoituksen tai pinon dictejä, joissa on raadin hallintaan tarvittavat tiedot
                {
                    alert("Sinulla ei ole oikeuksia hallita tätä raatia.");
                }
                else {
                    council_messages = result["messages"];
                    council_users = result["users"];

                    let user_element = document.getElementById("list_of_users");
                    let banned_element = document.getElementById("list_of_banned_users");
                    let action_list = document.getElementById("list_of_actions");
                    let banned_action_list = document.getElementById("list_of_banned_actions");
                    let messages_element = document.getElementById("list_of_messages");
                    let action_template = document.querySelector("#user_actions");

                    for (let i = 0; i < council_users.length; i++)
                    {
                        let temp_meta = document.createElement("div");
                        temp_meta.classList.add("user_meta_container");
                        if (alternator == 1)
                        {
                            console.log("It should be grey");
                            temp_meta.classList.add("grey_background");
                        }

                        
                        let temp_icon_container = document.createElement("div");
                        temp_icon_container.classList.add("icon_container");

                        let temp_icon = document.createElement("div");
                        temp_icon.classList.add("user_icon");
                        if (council_users[i]["role"] == "admin")
                        {
                            temp_icon.classList.add("gg-crown");
                        }

                        else if (council_users[i]["role"] == "moderator")
                        {
                            temp_icon.classList.add("gg-dice-2");
                        }

                        else if (council_users[i]["role"] == "super_mod")
                        {
                            temp_icon.classList.add("gg-dice-3")
                        }

                        else if (council_users[i]["role"] == "banned")
                        {
                            temp_icon.classList.add("gg-ghost-character");
                        }

                        else {
                            temp_icon.classList.add("gg-dice-1");
                        }

                        temp_icon_container.appendChild(temp_icon);
                        temp_meta.appendChild(temp_icon_container);

                        let temp_user = document.createElement("div");
                        temp_user.classList.add("council_user");
                        temp_user.id = council_users[i]["user_id"];

                        let temp_user_name = document.createElement("div");
                        temp_user_name.classList.add("username");
                        temp_user_name.innerHTML = council_users[i]["username"];
                        temp_user.appendChild(temp_user_name);

                        temp_meta.appendChild(temp_user);

                        let temp_actions = document.importNode(action_template.content, true);
                        if (alternator == 1)
                        {
                            temp_actions.querySelector(".user_action_buttons").classList.add("grey_background");
                            alternator = 0;
                        }

                        else {
                            alternator = 1;
                        }

                        temp_actions.querySelector(".ban_button").id = temp_user.id + "banbutton";
                        if(council_users[i]["role"] == "banned")
                        {
                            temp_actions.querySelector(".ban_button").id = temp_user.id + "unbanbutton";
                            temp_actions.querySelector(".ban_button").classList.add("unban_button");
                            temp_actions.querySelector(".ban_button").classList.remove("ban_button");
                            temp_actions.querySelector(".unban_button").innerHTML = "Palauta käyttöoikeudet";
                            let promote_button = temp_actions.querySelector(".promote_button");
                            promote_button.parentNode.removeChild(promote_button);
                        }
                        else {
                            temp_actions.querySelector(".promote_button").id = temp_user.id + "promotebutton";
                            if(council_users[i]["role"] == "moderator")
                            {
                                temp_actions.querySelector(".promote_button").id = temp_user.id + "demotebutton";
                                temp_actions.querySelector(".promote_button").classList.add("demote_button");
                                temp_actions.querySelector(".promote_button").classList.remove("promote_button");
                                temp_actions.querySelector(".demote_button").innerHTML = "Poista moderaattorioikeudet";
                            }
                        }
                        if(council_users[i]["role"] == "banned")
                        {
                            banned_element.appendChild(temp_meta);
                            banned_action_list.appendChild(temp_actions);
                        }
                        else{
                            user_element.appendChild(temp_meta);
                            action_list.appendChild(temp_actions);
                        }
                    }

                    for (let i = 0; i < council_messages.length; i++)
                    {
                        let temp_message = document.createElement("div");
                        temp_message.classList.add("council_message");
                        temp_message.id = council_messages[i]["id"];

                        let temp_message_header = document.createElement("div");
                        temp_message_header.classList.add("council_message_header");
                        temp_message_header.innerHTML = council_messages[i]["sender"] + " (" + council_messages[i]["timestamp"] + "):";

                        let temp_message_content = document.createElement("div");
                        temp_message_content.classList.add("council_message_content");
                        temp_message_content.id = council_messages[i]["id"] + "textbody";
                        temp_message_content.innerHTML = council_messages[i]["content"];

                        let temp_message_actions = document.createElement("div");
                        temp_message_actions.classList.add("council_message_actions_container");

                        let temp_message_delete_button = document.createElement("div");
                        temp_message_delete_button.classList.add("council_message_delete_button");
                        temp_message_delete_button.innerHTML = "Poista viesti";
                        temp_message_delete_button.id = council_messages[i]["id"] +"delete";
                        temp_message_actions.appendChild(temp_message_delete_button);

                        temp_message.appendChild(temp_message_header);
                        temp_message.appendChild(temp_message_content);
                        temp_message.appendChild(temp_message_actions);
                        
                        messages_element.appendChild(temp_message);
                    }
                }
            })
        }
    })
})

$(document).on('click', '.council_message_delete_button', function(e){
    if (window.confirm("Oletko varma, että haluat poistaa viestin? Varoitus: toimintoa ei voi perua!"))
    {
        let user_id = $(this).attr('id').replace("delete", "");
        let council_id = window.location.href.split("/").slice(-2)[0];
        socket.emit("request admin delete message", user_id, window.sessionStorage.getItem('token'), council_id, function(reply)
        {
            if (reply == "success"){
                location.reload();
            }

            else if (reply == "no_rights"){
                window.alert("Sinulla ei ole moderaattorioikeuksia tässä raadissa.");
            }

            else {
                window.alert("Tapahtui virhe");
            }

        });
    }
});

$(document).on('click', '.ban_button', function(e){
    if (window.confirm("Oletko varma, että haluat estää tämän käyttäjän pääsyn raatiin?"))
    {
        let user_id = $(this).attr('id').replace("banbutton", "");
        let council_id = window.location.href.split("/").slice(-2)[0];
        socket.emit("request ban user", user_id, window.sessionStorage.getItem('token'), council_id, function(reply)
        {
            if (reply == "success"){
                location.reload();
            }

            else if (reply == "no_rights"){
                window.alert("Sinulla ei ole moderaattorioikeuksia tässä raadissa.");
            }

            else {
                window.alert("Tapahtui virhe");
            }

        });
    }
});


$(document).on('click', '.promote_button', function(e){
    if (window.confirm("Oletko varma, että haluat tehdä käyttäjästä moderaattorin?"))
    {
        let user_id = $(this).attr('id').replace("promotebutton", "");
        let council_id = window.location.href.split("/").slice(-2)[0];
        socket.emit("request make user mod", user_id, window.sessionStorage.getItem('token'), council_id, function(reply)
        {
            if (reply == "success"){
                location.reload();
            }

            else if (reply == "no_rights"){
                window.alert("Sinulla ei ole moderaattorioikeuksia tässä raadissa.");
            }

            else {
                window.alert("Tapahtui virhe");
            }

        });
    }
});

$(document).on('click', '.demote_button', function(e){
    if (window.confirm("Oletko varma, että haluat poistaa käyttäjältä moderaattorin oikeudet?"))
    {
        let user_id = $(this).attr('id').replace("demotebutton", "");
        let council_id = window.location.href.split("/").slice(-2)[0];
        socket.emit("request remove user as mod", user_id, window.sessionStorage.getItem('token'), council_id, function(reply)
        {
            if (reply == "success"){
                location.reload();
            }

            else if (reply == "no_rights"){
                window.alert("Sinulla ei ole moderaattorioikeuksia tässä raadissa.");
            }

            else {
                window.alert("Tapahtui virhe");
            }

        });
    }
});

$(document).on('click', '.unban_button', function(e){
    if (window.confirm("Oletko varma, että haluat palauttaa käyttäjän kirjoitusoikeudet raatiin?"))
    {
        let user_id = $(this).attr('id').replace("unbanbutton", "");
        let council_id = window.location.href.split("/").slice(-2)[0];
        socket.emit("request unban user", user_id, window.sessionStorage.getItem('token'), council_id, function(reply)
        {
            if (reply == "success"){
                location.reload();
            }

            else if (reply == "no_rights"){
                window.alert("Sinulla ei ole moderaattorioikeuksia tässä raadissa.");
            }

            else {
                window.alert("Tapahtui virhe");
            }

        });
    }
});

$(document).on('click', '#context_council', function(e){
    document.querySelector("#context_council").classList.remove("lob_inactive");
    document.querySelector("#context_council").classList.add("lob_active");
    document.querySelector("#context_users").classList.remove("lob_active");
    document.querySelector("#context_users").classList.add("lob_inactive");
    $('#users_content').hide();
    $('#council_content').show();
});

$(document).on('click', '#context_users', function(e){
    document.querySelector("#context_users").classList.remove("lob_inactive");
    document.querySelector("#context_users").classList.add("lob_active");
    document.querySelector("#context_council").classList.remove("lob_active");
    document.querySelector("#context_council").classList.add("lob_inactive");
    $('#council_content').hide();
    $('#users_content').show();
});