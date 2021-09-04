var nodemailer = require('nodemailer');
var moment = require('moment');
var path = require('path');
var Users = require(path.join(__dirname + "/user.js"));
var Councils = require(path.join(__dirname + "/councils.js"));
var council_publish = {"subject": "Raadin julkaisu Digiraadissa", "content": "Hei, $username! \n\n Raati $councilname aukeaa $time. \n\n Mikäli olet vielä kiinnostunut osallistumaan raatiin, voit tehdä niin osoitteessa http://digiraati.fi. \n\n Terveisin, \n Digiraati"}
var chat_open = {"subject": "Keskustelu aukeaa raadissassi", "content": "Hei, $username! \n\n Olet mukana raadissa $councilname, jonka keskustelu aukeaa $time. \n\n Keskustelun aukeamisen jälkeen voit osallistua keskusteluun Digiraadin välityksellä osoitteessa http://digiraati.fi. \n\n Terveisin, \n Digiraati"}
var chat_close = {"subject": "Keskustelu sulkeutumassa raadissasi", "content": "Hei, $username! \n\n Olet mukana raadissa $councilname, jonka keskustelu sulkeutuu $time. Jos sinulla on vielä painavaa sanottavaa, käythän osallistumassa keskusteluun ennen kuin se sulkeutuu osoitteessa http://digiraati.fi. \n\n Terveisin, \n Digiraati"}
var council_close = {"subject": "Raati sulkeutumassa Digiraadissa", "content": "Hei, $username! \n\n Olet mukana raadissa $councilname, joka sulkeutuu $time. Jos et ole vielä täyttänyt loppulausumakyselyäsi, teethän niin mahdollisimman pian osoitteessa http://digiraati.fi. \n\n Terveisin, \n Digiraati"}
var conclusion_due = {"subject": "Loppulausuman toimitus lähestyy", "content": "Hei, $username! \n\n Olet puheenjohtajana raadissa $councilname, jonka loppulausuma on palautettava $time. Jos haluat muokata loppulausumaa, teethän niin ajoissa osoitteessa http://digiraati.fi \n\n Terveisin, \n Digiraati"}
var feedback_due = {"subject": "Raatisi kaipaa palautetta Digiraadissa", "content": "Hei, $username! \n\n Raatisi, $councilname, on loppusuoralla ja sen raatilaisten palautteen takaraja on $time. Muistathan lähettää raatilaisille palautetta ajoissa! \n\n Terveisin, \n Digiraati"}

module.exports = class EventHandler
{
    constructor(councils, users)
    {
        console.log("Event Handler initialized.");
        this.id = makeid();
        this.councils = councils;
        this.users = users;
        this.events = [];
        //setInterval(() => process_events(this.events), 1000 * 60);
    }

    dump_event_data()
    {
        return this.events;
    }

    recover_from_backup(councils, users, event_data)
    {
        this.councils = councils;
        this.users = users;
        console.log("Recovered from backup " + this.councils.length + ", " + this.users.length);
        if (event_data != undefined)
        {
            for(let i = 0; i < event_data.length; i++)
            {
                this.events.push(event_data[i]);
            }
        }   
    }

    register_council(council_data)
    {
        console.log("Registering council...");
        var event_data = council_data["notifications"];
        var event_to_register = {};
        event_to_register["id"] = makeid();
        event_to_register["council_id"] = council_data["id"];
        event_to_register["council_name"] = council_data["name"];
        event_to_register["notifications"] = [];

        for (let i = 0; i < event_data.length; i++)
        {
            switch(i["event"])
            {
                case("publish"):
                    {
                    let temp_event = {};
                    temp_event["type"] = "publish";
                    
                    if(i["oneday"] == true)
                    {
                        let notification_date = new Date(council_data["startdate"], council_data["starttime"]);
                        notification_date.setDate(notification_date.getDate() - 1);
                        temp_event["oneday_time"] = notification_date;
                        temp_event["oneday_handled"] = false;
                        
                    }

                    if(i["oneweek"] == true)
                    {
                        let notification_date = new Date(council_data["startdate"], council_data["starttime"]);
                        notification_date.setDate(notification_date.getDate() - 7);
                        temp_event["oneweek_time"] = notification_date;
                        temp_event["oneweek_handled"] = false;
                    }

                    event_to_register["events"].push(temp_event);

                    break;
                    }
                case("chatopen"):
                    {
                    let temp_event = {};
                    temp_event["type"] = "chat_open";
                    
                    if(i["oneday"] == true)
                    {
                        let notification_date = new Date(council_data["discussion_open_date"], council_data["discussion_open_time"]);
                        notification_date.setDate(notification_date.getDate() - 1);
                        temp_event["oneday_time"] = notification_date;
                        temp_event["oneday_handled"] = false;
                        
                    }

                    if(i["oneweek"] == true)
                    {
                        let notification_date = new Date(council_data["discussion_open_date"], council_data["discussion_open_time"]);
                        notification_date.setDate(notification_date.getDate() - 7);
                        temp_event["oneweek_time"] = notification_date;
                        temp_event["oneweek_handled"] = false;
                    }

                    event_to_register["events"].push(temp_event);

                    break;
                }
                case("chatclose"):
                    {
                    let temp_event = {};
                    temp_event["type"] = "chat_close";
                    
                    if(i["oneday"] == true)
                    {
                        let notification_date = new Date(council_data["discussion_close_date"], council_data["discussion_close_time"]);
                        notification_date.setDate(notification_date.getDate() - 1);
                        temp_event["oneday_time"] = notification_date;
                        temp_event["oneday_handled"] = false;
                        
                    }

                    if(i["oneweek"] == true)
                    {
                        let notification_date = new Date(council_data["discussion_close_date"], council_data["discussion_close_time"]);
                        notification_date.setDate(notification_date.getDate() - 7);
                        temp_event["oneweek_time"] = notification_date;
                        temp_event["oneweek_handled"] = false;
                    }

                    event_to_register["events"].push(temp_event);

                break;
                }   

                case("councilclose"):
                    {
                    let temp_event = {};
                    temp_event["type"] = "council_close";
                    
                    if(i["oneday"] == true)
                    {
                        let notification_date = new Date(council_data["enddate"], council_data["endtime"]);
                        notification_date.setDate(notification_date.getDate() - 1);
                        temp_event["oneday_time"] = notification_date;
                        temp_event["oneday_handled"] = false;
                        
                    }

                    if(i["oneweek"] == true)
                    {
                        let notification_date = new Date(council_data["enddate"], council_data["endtime"]);
                        notification_date.setDate(notification_date.getDate() - 7);
                        temp_event["oneweek_time"] = notification_date;
                        temp_event["oneweek_handled"] = false;
                    }

                    event_to_register["events"].push(temp_event);

                    break;
                }
                
                case("q_due"):
                    {
                    let temp_event = {};
                    temp_event["type"] = "conclusion";

                
                    if(i["oneday"] == true)
                    {
                        let notification_date = new Date(council_data["startdate"], council_data["starttime"]);
                        notification_date.setDate(notification_date.getDate() - 1);
                        temp_event["oneday_time"] = notification_date;
                        temp_event["oneday_handled"] = false;
                        
                    }

                    if(i["oneweek"] == true)
                    {
                        let notification_date = new Date(council_data["startdate"], council_data["starttime"]);
                        notification_date.setDate(notification_date.getDate() - 7);
                        temp_event["oneweek_time"] = notification_date;
                        temp_event["oneweek_handled"] = false;
                    }

                    event_to_register["events"].push(temp_event);

                    break;
                }

                case("feedback"):
                    {
                    let temp_event = {};
                    temp_event["type"] = "feedback";

                    if(i["oneday"] == true)
                    {
                        let notification_date = new Date(council_data["startdate"], council_data["starttime"]);
                        notification_date.setDate(notification_date.getDate() - 1);
                        temp_event["oneday_time"] = notification_date;
                        temp_event["oneday_handled"] = false;
                        
                    }

                    if(i["oneweek"] == true)
                    {
                        let notification_date = new Date(council_data["startdate"], council_data["starttime"]);
                        notification_date.setDate(notification_date.getDate() - 7);
                        temp_event["oneweek_time"] = notification_date;
                        temp_event["oneweek_handled"] = false;
                    }

                    event_to_register["events"].push(temp_event);
                }

                default:
                    {
                    console.log("Event data for council %s contains mysterious item: %s", council_data["id"], i["event"]);
                    break;
                }
            }
        }

        console.log("Events registered before: " + this.events.length);
        this.events.push(event_to_register);
        console.log("Events after: " + this.events.length);
    }

    send_email(event, users)
    {
        const transporter = nodemail.createTransport({port: 25, host: 'localhost', tls: {rejectUnauthorized: false},});
        var message_content;
        switch(event){
            case("publish"):
                message = council_publish;
                break;
            case("chat_open"):
                message = chat_open;
                break;
            case("chat_close"):
                message = chat_close;
                break;
            case("council_close"):
                message = council_close;
                break;
            case("conclusion"):
                message = conclusion_due;
                break;
            case("feedback"):
                message = feedback_due;
                break;
            default:
                break;
            }
        
        for(var user of users){
            var m_content = message["content"].replace('$username', user["username"]);
            m_content = m_content.replace('$councilname', event["councilname"]);
            m_content = m_content.replace('$time', event["date"] + ' kello ' + event["time"]);
            var message = {
                from: 'noreply@digiraati.fi',
                to: user["email"],
                subject: message["subject"],
                text: m_content,
                html: '<p>' + message["content"] + '</p>'};
            
            transporter.sendMail(message, (error, info) => {
                if (error) {
                    return console.log("There was an error: " + error);
                }
                console.log("Message sent: %s", info.messageId);
            });
        }
                
    }
    
}

function process_events(_events)
    {
        let current_date = new Date();
        console.log("Processing events at " + current_date + ". " + _events.length + " events to process.");
        for (let i = 0; i < _events.length; i++)
        {
            let council_data = this.councils.filter(element => event["council_id"] == element["id"])[0];
            let user_data = [];
            for (let o = 0; 0 < this.users.length; o++)
            {
                if(council_data["users"].includes(this.users[o].id))
                {
                    user_data.push(this.users[o]);
                }
            }
            for (let u = 0; u < _events[i].notifications.length; u++)
            {
                console.log("Processing event " + u);
                if (current_date >= _events[i].notifications[u].oneweek_time && this.events[i].notifications[u].oneweek_handled === false)
                {
                    console.log("Found weekly emails to be sent");
                    this.send_email(this.events[i].notifications[u].type, user_data);
                    this.events[i].notifications[u].oneweek_handled = true;
                }
                if (current_date >= _events[i].notifications[u].oneday_time && this.events[i].notifications[u].oneday_handled === false)
                {
                    console.log("Found daily emails to be sent");
                    this.send_email(_events[i].notifications[u].type, user_data);
                    _events[i].notifications[u].oneday_handled = true;
                }
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