class Conclusion{
    
    constructor(id, user_id, council_id, answers = [])
    {
        this.id = id;
        this.user_id = user_id;
        this.council_id = council_id;
        this.answers = answers;
    }

    get_id() { return this.id; }
    get_user_id() { return this.user_id; }
    get_council_id() { return this.council_id; }
    get_answers() { return this.answers; }
    get_answer(i) { return this.answers[i]; }
    set_answers(answers) { this.answers = answers; }
    set_answer(index, answer) { this.answers[index] = answer;}

}

class Questionnaire{
    constructor(id, council_id, questions)
    {
        this.id = id;
        this.council_id = council_id;
        this.questions = questions;
    }

    get_id() { return this.id; }
    get_council_id() { return this.council_id; }
    get_questions() { return this.questions ; }
    get_question(i) { return this.questions[i]; }
    set_questions(questions) {this.questions = questions; }
    set_question(index, question) { this.questions[i] = question; }

}

    module.exports = class Conclusions{
        constructor(){
            this.questionnaires = [];
            this.answers = [];
        }

        get_questionnaire_by_council(council_id)
        {

            var returnable = []; 

            console.log("Getting questionnaire for council " + council_id);
                        
            for (var i = 0; i < this.questionnaires.length; ++i)
            {
                console.log("Questionnaire " + i + ": " + this.questionnaires[i]);
                if (this.questionnaires[i].get_council_id() == council_id)
                {
                    console.log("Found it!");
                    returnable = this.questionnaires[i].get_questions();
                }
            }

            console.log("Found " + returnable.length + " questionnaires");

            return returnable;
            
        }

        get_answers_by_user_id(council_id, user_id)
        {
            var foundAnswers = [];
            for (var i = 0; i < this.answers.length; ++i)
            {

                console.log("Comparing: " + council_id + " to " + this.answers[i].get_council_id() + " and " + user_id + " to " + this.answers[i].get_user_id());
                if(this.answers[i].get_user_id() == user_id && this.answers[i].get_council_id() == council_id)
                {
                    console.log("It's a match")
                    foundAnswers = this.answers[i]['answers'];
                }
            }

            console.log(foundAnswers);
            return foundAnswers;
        }

        get_all_answers(council_id)
        {
            var returnable = [];
            console.log("Fetching all council answers out of " + this.answers.length);
            for (var i = 0; i < this.answers.length; ++i)
            {

                console.log("All Answers: comparing " + council_id  + " to " + this.answers[i].get_council_id());
                if (this.answers[i].get_council_id() == council_id)
                {
                    console.log("Appending new row of results");
                    returnable.push(this.answers[i]["answers"]);
                }
            }

            return returnable;
        }

        get_answers_by_index(council_id, index)
        {
            var returnable = [];

            var filtered_answers = answers.filter(element => {
                element.get_council_id() == council_id;
            });

            filtered_answers.foreach(element => {
                var temp_json = {};
                temp_json["user_id"] = element.get_user_id();
                temp_json["answer"] = element.get_answer(index);
                returnable.push(temp_json);
            });

            return returnable;
        }

        add_questionnaire(council_id, questions = [])
        {   
            console.log("questionnaire added");
            this.questionnaires.push(new Questionnaire(makeid(), council_id, questions));
            console.log("I now have " + this.questionnaires.length + " questionnaires");
        }

        add_conclusion(user_id, council_id, answers = [])
        {
            var updated = false;
            console.log("Adding conclusion: " + user_id + " " + council_id + " " + answers);

            for (var i = 0; i < this.answers.length; ++i)
            {
                console.log("Comparing " + user_id + " to " + this.answers[i].get_user_id() + " and " + council_id + " " + this.answers[i].get_council_id());
                if (user_id == this.answers[i].get_user_id() && council_id == this.answers[i].get_council_id())
                {
                    console.log("Updating existing values");
                    this.answers[i].set_answers(answers);
                    updated = true;
                }
            }

            if (updated == false)
            {
                console.log("Couldn't find 'em so I'm pushing 'em now")
                this.answers.push(new Conclusion(makeid(), user_id, council_id, answers));
            }
        }

        get_all_data()
        {
            var allData = {};
            allData["questionnaires"] = [];
            allData["answers"] = [];
            this.questionnaires.forEach(element => {
                allData["questionnaires"].push(element)
            });

            this.answers.forEach(element => {
                allData["answers"].push(element)
            });

            return allData;
        }

        recover_backup_data(data)
        {
            data["questionnaires"].forEach(element => {
                this.questionnaires.push(new Questionnaire(element["id"], element["council_id"], element["questions"]));
            });
            
            data["answers"].forEach(element => {
                this.answers.push(new Conclusion(element["id"], element["user_id"], element["council_id"], element["answers"]));
            })

            console.log("Recovered " + this.questionnaires.length + " questionnaires and " + this.answers.length + " answer sets");
        }
    }

    function makeid() {
        id = "";
        var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        while(id.length < 12){
          id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return id;
    }