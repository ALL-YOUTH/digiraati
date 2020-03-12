// MongoUser

var MongoHelper = require('./MongoHelper.js');

var Document_One = {'name': 'Eero Esimerkki', 'age': 15, 'hometown': 'Tampere', 'hobbies': ['hockey', 'floorball', 'guitar']};
var Document_Two = {'name': 'Essi Example', 'age': 12, 'hometown': 'Vantaa', 'hobbies': ['flute', 'horses', 'painting']};
var Document_Three = {'name': 'Phil Forinstance', 'age': 52, 'hometown': 'Brighton', 'hobbies': ['football', 'trainspotting', 'dogs']};

var documents = [Document_One, Document_Two, Document_Three];

console.log("Insert");
MongoHelper.InsertDocuments('examples', documents, function(err, result){
    if(!err)
    {
        console.log(result);
    }
});

console.log("Retrieve");
MongoHelper.RetrieveDocuments('examples', {'name': 'Eero Esimerkki'}, function(err, result)
{
    if(!err)
    {
        console.log(result);
    }
});