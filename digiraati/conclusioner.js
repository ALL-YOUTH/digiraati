class Conclusion{
    
    constructor(user_id, council_id, answers = [])
    {
        this.id = makeid;
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
    constructor(council_id, questions)
    {
        this.id = makeid;
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
            foundAnswers = answers.find(element => (element.get_user_id() == user_id && element.get_council_id() == council_id));
            return foundAnswers;
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
            this.questionnaires.push(new Questionnaire(council_id, questions));
            console.log("I now have " + this.questionnaires.length + " questionnaires");
        }

        add_conclusion(user_id, council_id, answers = [])
        {
            
            if (this.answers.includes(element => (element.get_user_id() == user_id && element.get_council_id() == council_id)) == false)
            {
                this.answers.push(new Conclusion(user_id, council_id, answers));
            }
            else
            {
            this.answers.foreach(element => {
                if(element.get_user_id() == user_id && element.get_council_id() == council_id)
                {
                    element.set_answers(answers);
                }
            });
        }

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