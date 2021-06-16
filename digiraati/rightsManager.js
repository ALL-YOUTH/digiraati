module.exports = class RightsManager{
    constructor()
    {
        this.admins = []; // Straight up array of user ids for admins.
        this.politicians = []; // Straight up array of user ids for politicians / "global moderators"
        this.councils = []; // Array of dictionaries in the format {"council_id", ["user_ids"]}
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
            return 0;
        }

        else {
            this.admins.push(user_id);
            return 1;
        }
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

    add_user_to_council_mods(council_id, user_id)
    {
        for (let c = 0; c < this.councils.length; c++)
        {
            if (this.councils[c]["council_id"] == council_id)
            {
                if (this.councils[c]["moderators"].includes(user_id))
                {
                    return 0;
                }

                else {
                    this.councils[c]["moderators"].push(user_id);
                    return 1;
                }
            }
        }

        let new_council = {"council_id": council_id, "moderators": [user_id]};
        this.councils.push(new_council);
        return 1;

    }

    recover_from_backup(data) // Reads backed up contents into objects
    {
        this.admins = data["admins"];
        this.politicians = data["politicians"];
        this.councils = data["councils"];
    }

    check_user_rights(user_id)
    {
        let returnable = {"role": "user"};

        if (this.admins.includes(user_id)) {
            returnable["role"] = "admin";
            return returnable;
        }

        else if (this.politicians.includes(user_id)){
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
                }
                return returnable;
            }
        }
    }
}