module.exports = class PresentUsers{
        constructor()
        {
            console.log("I just got called");
            this.councils = [];
            setInterval(this.CleanUserList, 1000 * 60, this.councils);
            this.GenerateTestData(10);
        }

        UserCheckIn(user_id, council_id)
        {
            console.log("Check in: " + user_id + " " + council_id);
            let checkInTime = Date.now();
            let existingCouncil = this.councils.find(council => council.council_id == council_id);                   // Check to see if there is already a council with the matching council_id in the array
            if (existingCouncil == undefined){
                this.councils.push({'council_id': council_id, 'present_users': []});      // if not, create a new council and add it to the array of councils            
                existingCouncil = this.councils.find(council => council.council_id == council_id);
            } 
            let existingUser = existingCouncil['present_users'].find(user => user.user_id == user_id);                         // Check to see if the user has already checked in
            console.log("Checking in " + user_id + " and the result is " + existingUser);
            if (existingUser == undefined) existingCouncil['present_users'].push({'user_id': user_id, 'last_checkin_time': checkInTime}) // If they haven't, add in a new user and timestamp them
            else{
                console.log("Updating checkin time");
                existingUser['last_checkin_time'] = checkInTime;                                        // If the user exists, just update their timestamp
            }
            console.log(this.councils);
        }

        GetPresentUsers(council_id)
        {
            let returnableUsers = this.councils.find(council => council.council_id == council_id)       // Check to see if the requested council has checked in users
            if (returnableUsers == undefined) return []                                                             // If not, return an empty array
            else return returnableUsers['present_users']                                                // If it exists, return the users as an array
        }

        CleanUserList(userlist)
        {
            console.log("Cleaning user list at " + Date.now());
            console.log(userlist.length + " councils to check")
            console.log(userlist);
            for (let i = 0; i < userlist.length; i++)
            {
                console.log("cleaning council " + userlist[i]["council_id"] + " with " + userlist[i]["present_users"].length)
                for (let u = 0; u < userlist[i]["present_users"].length; u++)
                {
                    console.log("Checking: " + (Date.now() - userlist[i]["present_users"][u]["last_checkin_time"]) / 1000 / 60)
                    if ((Date.now() - userlist[i]["present_users"][u]["last_checkin_time"]) / 1000 / 60 > 5) // If the difference between now and the last checkin time is greater than 5 minutes (time delta in milliseconds / 1000 / 60)
                    {   
                        console.log("Removing user " + userlist[i]["present_users"][u]["user_id"]);
                        //let splice_loc = council["present_users"].indexOf(user); // Get the index of the user's location in the array
                        userlist[i]["present_users"].splice(u, 1);
                    }
                }
            }
        }

        // Helper functions for testing

        GenerateTestData(number_of_testers_to_create)
        {
            this.UserCheckIn(this.GenerateUserName(), "LcxOmBHLW720");
            let addable_council = this.councils.find(council => council.council_id == "LcxOmBHLW720");
            console.log("Addable council: " + addable_council)
            while (!addable_council)
            {
                addable_council = this.councils.find(council => council.council_id == "LcxOmBHLW720");
                console.log(addable_council);
            }

            for (let i = 0; i <= number_of_testers_to_create; i++)
            {
                let temp_user = {}
                temp_user["user_id"] = this.GenerateUserName();
                temp_user["last_checkin_time"] = new Date(Date.now() + Math.random() * 60000).getTime();
                console.log("Checking in user " + temp_user["user_id"] + " " + temp_user["last_checkin_time"]);
                addable_council["present_users"].push(temp_user);
            }
        }

        GenerateUserName()
        {
            let firstNames = ["Curious", "Friendly", "Helpful", "Happy", "Shy", "Nervous", "Giddy", "Melancholy", "Hungry"];
            let lastNames = ["Hippo", "Seagull", "Squirrell", "Fox", "Cat", "Dog", "Giraffe", "Marmoset", "Chipmunk", "Alpaca"];
            let returnable = firstNames[firstNames.length * Math.random() | 0] + lastNames[lastNames.length * Math.random() | 0]; // Returns a random item from each list of names, combines them
            return returnable;
        }
    }