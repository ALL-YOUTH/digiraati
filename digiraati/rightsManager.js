module.exports = class RightsManager{
    constructor()
    {
        this.admins = []; // Straight up array of user ids for admins.
        this.politicians = []; // Straight up array of user ids for politicians / "global moderators"
        this.councils = []; // Array of dictionaries in the format {"council_id", ["user_ids"], ["banned_ids"], ["moderators"]}
    }

    backup_contents(){ // Returns all the contents in JSON objects for local backups
        let returnable = {};
        returnable["admins"] = this.admins;
        returnable["politicians"] = this.politicians;
        returnable["councils"] = this.councils;
        return returnable;
    }

    add_user_to_admins(user_id)
    {
        if(this.admins.includes(user_id))
        {
            return "success";
        }

        else {
            this.admins.push(user_id);
            return "success";
        }
    }

    ban_user_from_council(user_id, council_id)
    {
        console.log("Received ban request: " + user_id + " from council " + council_id);
        for (let i = 0; i < this.councils.length; i++)
        {
            if (this.councils[i]["council_id"] == council_id)
            {
                if (this.councils[i]["banned_ids"].includes(user_id)) // User is already banned
                {
                    console.log("User was already banned")
                    return "already_banned";
                }

                else{
                    console.log("User was banned");
                    this.councils[i]["banned_ids"].push(user_id);
                    return "success";
                }
            }

        }

        console.log("The council ID was not found");
        let new_council = {"council_id": council_id, "banned_ids": [user_id], "moderators":[]};
        this.councils.push(new_council);
        return "success";

    }

    unban_user_from_council(user_id, council_id)
    {
        console.log("Received request to unban user " + user_id + " from council " + council_id);
        for (let c = 0; c < this.councils.length; c++)
        {
            if (this.councils[c]["council_id"] == council_id)
            {
                if (this.councils[c]["banned_ids"].includes(user_id))
                {
                    console.log
                    let index = this.councils[c]["banned_ids"].indexOf(user_id);
                    console.log("User is banned and the id is " + index);
                    this.councils[c]["banned_ids"].splice(index, 1);
                    return "success";
                }

                else {
                    return "not_banned";
                }
            }
        }

        return "council_not_found";

    }

    add_user_to_politicians(user_id){
        if(this.politicians.includes(user_id))
        {
            return 0;
        }
        else {
            this.politicians.push(user_id);
            return 1;
        }
    }

    add_user_to_council_mods(user_id, council_id)
    {
        for (let c = 0; c < this.councils.length; c++)
        {
            if (this.councils[c]["council_id"] == council_id)
            {
                if (this.councils[c]["moderators"].includes(user_id))
                {
                    return "already_mod";
                }

                else {
                    this.councils[c]["moderators"].push(user_id);
                    return "success";
                }
            }
        }

        let new_council = {"council_id": council_id, "moderators": [user_id], "banned_ids": []};
        this.councils.push(new_council);
        return 1;

    }

    remove_user_from_council_mods(user_id, council_id)
    {
        for (let c = 0; c < this.councils.length; c++)
        {
            if (this.councils[c]["council_id"] == council_id)
            {
                if (this.councils[c]["moderators"].includes(user_id))
                {
                    let index = this.councils[c]["moderators"].indexOf(user_id);
                    this.councils[c]["moderators"].splice(index, 1);
                    return "success";
                }

                else {
                    return "not_a_mod";
                }
            }
        }

        return "council_not_found";

    }

    recover_from_backup(data) // Reads backed up contents into objects
    {
        this.admins = data["admins"] || [];
        this.politicians = data["politicians"] || [];
        this.councils = data["councils"] || [];
    }

    check_user_rights_in_council(user_id, council_id)
    {
        let returnable = {"role": "none"};
        console.log("Checking rights for " + user_id)

        if (this.admins.includes(user_id))
        {
            returnable["role"] = "admin";
            console.log("Returning admin")
            return returnable;
        }

        for (let c = 0; c < this.councils.length; c++)
        {
            if (this.councils[c]["council_id"] == council_id)
            {

                if(this.councils[c]["banned_ids"].includes(user_id))
                {
                    console.log("Returning bannged")
                    returnable["role"] = "banned";
                }

                else if (this.councils[c]["moderators"].includes(user_id))
                {
                    console.log("Returning moderator")
                    returnable["role"] = "moderator";
                }
            }
        }

        return returnable;
    }

    check_user_rights(user_id)
    {
        console.log("Tuli tämmönen kysely: " + user_id)
        let returnable = {"role": "user"};

        if (this.admins.includes(user_id)) {
            returnable["role"] = "admin";
            console.log("Palautan käyttäjäoikeuksina adminin")
            return returnable;
        }

        else if (this.politicians.includes(user_id)){
            console.log("Palautan käyttäjäoikeuksina adminin")
            returnable["role"] = "admin";
            return returnable;
        }

        else
        {
            for (let c = 0; c < this.councils.length; c++)
            {
                if (this.councils[c]["moderators"].includes(user_id))
                {
                    returnable["role"] = "moderator";
                    returnable["councils"].push(this.councils[c]["council_id"]);
                    console.log("Palautan käyttäjäoikeuksina moderaattorin")
                }
                return returnable;
            }
        }
    }
}