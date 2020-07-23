// //////////////////// Bot Basics
const Discord = require('discord.js');
const client = new Discord.Client({ forceFetchUsers: true });
const { prefix, token, adminID, ytToken } = require('./config.json');
var quotes = require("./marvelQuotes.json");
//* ********************Bot Basics

// //////////////////// Usefull Javascript Capabilities
const fs = require('fs');
const url = require('url');
const http = require('http');
const util = require('util');


//* ********************Usefull Javascript Capabilities

// //////////////////// Database Management
var sqlite3 = require('sqlite3').verbose();
//db.run("CREATE TABLE RealmGold (User, Server, Score)");
//db.run("INSERT INTO RealmGold (User, Server, Score) VALUES (222, 333, 123)");

//* ********************Database Management

/*clown cam setup*/
var clowns = require("./clowns.json");

/* DEEPSPEECH SETUP */
/*
let DEEPSPEECH_MODEL; // path to deepspeech model directory
if (process.env.DEEPSPEECH_MODEL) {
    DEEPSPEECH_MODEL = process.env.DEEPSPEECH_MODEL;
}
else {
    DEEPSPEECH_MODEL = __dirname + '/deepspeech-0.7.0-models';
}

function createModel(modelDir) {
    let modelPath = modelDir + '.pbmm';
    let scorerPath = modelDir + '.scorer';
    let model = new DeepSpeech.Model(modelPath);
    model.enableExternalScorer(scorerPath);
    return model;
}
let englishModel = createModel(DEEPSPEECH_MODEL);

let modelStream;
let recordedChunks = 0;
let silenceStart = null;
let recordedAudioLength = 0;
let endTimeout = null;
let silenceBuffers = [];
let firstChunkVoice = false;

function endAudioStream(callback) {
    console.log('[end]');
    let results = intermediateDecode();
    if (results) {
        if (callback) {
            callback(results);
        }
    }
}

function resetAudioStream() {
    clearTimeout(endTimeout);
    console.log('[reset]');
    intermediateDecode(); // ignore results
    recordedChunks = 0;
    silenceStart = null;
}



*/
console.log('Hello world');

/* Startup */
console.log(`The current day is ${(new Date()).getDate()} of ${(new Date()).getMonth() + 1}`);
client.on('ready', () => {

    console.log('Ready!');
    console.log('First quote is');
    console.log(quotes[0]);

});


/*Reddit gold command parsing*/

client.on('message', (message) => {
    if (!message.content.startsWith(prefix) || message.author.bot || util.isNull(message.guild)) return;

    const args = message.content.toLowerCase().slice(prefix.length).split(' ');
    const command = args.shift().toLowerCase();
    var server = message.guild.id;
    var user = message.author.id;

    if (command == "leaderboard") {
        if (message.channel.type == 'dm') console.log("Is DM");
        else {
            var embedBoard = new Discord.MessageEmbed();
            var db = new sqlite3.Database('goldScore.sqlite');
            db.all("SELECT User, Server, Score FROM RealmGold WHERE Server = (?) ORDER BY Score DESC", server, (err, rows) => {
                let i;
                console.log(rows + " " + rows.length);
                for (i = 0; i < Math.min(5, rows.length); i++) {
                    var name = message.guild.member(rows[i].User).displayName;
                    if (name == null) name = message.guild.member(rows[i].User).user.username;
                    console.log("name is " + name);
                    console.log(rows[i].User);
                    console.log(message.guild.member(rows[i].User));
                    embedBoard.addField(`${i + 1}.`, name + ' with level ' + rows[i].Score);
                }
                message.channel.send(embedBoard);
                db.close();
            });
            
                
            
        }
    }


    if (command == "score") {
        if (message.channel.type == 'dm') console.log("Is DM");
        else {
            var db = new sqlite3.Database('goldScore.sqlite');
            db.get("SELECT Score, User FROM RealmGold WHERE User = (?) AND Server = (?)", user, server, (err, row) => {
                console.log("Score report: " + row.Score + " " + row.User);
                
                if (typeof row == "undefined" || row == null) message.channel.send("Who are you?!");
                else {
                    var name = message.guild.member(row.User).displayName;
                    message.channel.send(name + "'s score is " + row.Score);
                }
                db.close();
            });
            
        }
    }
});



/*Random Image Command Parsing*/

var lastImage;
client.on('message', (message) => {
    if (!message.content.startsWith(prefix) || message.author.bot || util.isNull(message.guild)) return;
    
    
    const args = message.content.toLowerCase().slice(prefix.length).split(' ');
    const command = args.shift().toLowerCase();
    var server = message.guild.id;
    var user = message.author.id;
    var imageRoot = "C:/Users/Keaton/source/repos/ThankYouKindStranger/ThankYouKindStranger/Images/";
    if (command == "addimage") {
        /* user invokes this then posts a pic. the argument will be the name of the person they want associated.
         * this needs to check if the infrastructure for the name has been set up. if not, create a folder for the user and
         * add the name to the command list.
         */
        if (message.attachments.first() == null || message.author.bot) return;
        if (args[0] == null || typeof clowns[args[0]] == "undefined") return;

        message.attachments.each((file, flake) => {
            const currentTime = new Date();
            console.log("file: " + file);
            const this_url = file.proxyURL;
            const DOWNLOAD_DIR = `C:/Users/Keaton/source/repos/ThankYouKindStranger/ThankYouKindStranger/Images/` + args[0] + "/";
            const seed = Math.floor(Math.random() * 200);
            const file_name = args[0] + currentTime.getDate() + currentTime.getSeconds() + seed + this_url.slice(this_url.length - 4);
            console.log("file name is " + file_name);
            console.log("Download dir is " + DOWNLOAD_DIR);

            const download_file_httpget = function (file_url) {
                const options = {
                    hostname: url.parse(file_url).host,
                    protocol: 'http:',
                    port: 80,
                    path: url.parse(file_url).pathname,
                };


                const file = fs.createWriteStream(DOWNLOAD_DIR + file_name);
                http.get(options, function (res) {

                    const { statusCode } = res;
                    const contentType = res.headers['content-type'];
                    console.log(`Received ${contentType}`);
                    let error;
                    if (statusCode !== 200) {
                        error = new Error('Request Failed.\n' +
                            `Status Code: ${statusCode}`);
                    }

                    if (error) {
                        console.error(error.message);
                        // consume response data to free up memory
                        res.resume();
                        return;
                    }

                    console.log('Successfully found image');
                    res.on('data', (data) => {
                        file.write(data);
                        //console.log('Image Data');
                    });
                    res.on('end', () => {
                        file.end();
                        console.log('Image finished downloading');
                    });



                });
            };
        

        download_file_httpget(this_url);
        var db = new sqlite3.Database('goldScore.sqlite');
        db.run("INSERT INTO Images (Name, Filename, Server) VALUES ((?), (?), (?))", args[0], file_name, server);
        db.close();
        message.reply("New content added to clown: " + args[0]);
        });
    }

    if (command == "delete")
    {
        if (lastImage == null) {
            console.log("No lastImage yet");
            return;
        }
        console.log("Removing an image from the clown archives");
        var broken = lastImage.split("/");
        const file_name = broken[broken.length-1];
        const name = broken[broken.length-2];
        console.log("Name: " + name + "\nFile Name: " + file_name);
        var db = new sqlite3.Database('goldScore.sqlite');
        db.run("DELETE FROM Images WHERE Name = (?) AND Filename = (?) AND Server = (?)", name, file_name, server);
        console.log("Removed");
        message.reply("Removed: " + file_name);
        db.close();
    }

    if (typeof clowns[command] != "undefined") {
        /*this part is reached when the command matches a valid user. it will
         * make a SQL query that grabs the list of the entries. generate a random number
         * and grab that picture from the user's folder.
         */
        var db = new sqlite3.Database('goldScore.sqlite');
        db.all("SELECT Filename FROM Images WHERE Name = (?) AND Server = (?)", command, server, (err, rows) => {
            console.log(rows);
            if (rows.length == 0) {
                console.log("No SQL results found for image");
                message.channel.send("I don't have any pictures of that person!");
                return;
            }
            console.log("Number of rows is: " + rows.length);
            var selection = Math.floor(Math.random() * rows.length);
            console.log("selection is " + selection);
            var completePath = imageRoot + command + "/" + rows[selection].Filename;
            console.log("Path is: " + completePath);
            lastImage = completePath;
            message.channel.send({
                files: [{
                    attachment: completePath,
                    name: rows[selection].Filename,
                }]
            });
            db.close();
        });
    }

    if (command == "addclown") {
        if (typeof clowns[args[0]] != "undefined") {
            message.channel.send("This clown already exists!");
            return;
        }
        clowns[args[0]] = true;
        fs.writeFile("./clowns.json", JSON.stringify(clowns), (err) => {
            if (err) {
                console.error(err);
                return;
            }
            console.log("Clowns updated");
        });
        var dir = "./Images/" + args[0];
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        message.reply("Clown created: " + args[0]);
    }

    if (command == "clowns") {
        message.channel.send("The clowns are: ");
        var clownListEmbed = new Discord.MessageEmbed();
        var list = "";
        for (var clownName in clowns) {
            list += clownName;
            list += "\n";
        }
        clownListEmbed.addField("~~~~~~~~~~~~~~~~~", list);
        message.channel.send(clownListEmbed);
    }

    if (command == "removeclown") {
        if (message.author.id != "190672357143216130") return;
        console.log("you are authorized");
        console.log("Attempting to remove the clown: " + args[0]);
        if (typeof clowns[args[0]] == "undefined") {
            message.channel.send("This clown doesn't exist!");
            console.log("Clown does not exist");
            return;
        }
        delete clowns[args[0]];
        console.log("Deleted " + args[0]);
        fs.writeFile("./clowns.json", JSON.stringify(clowns), (err) => {
            if (err) {
                console.error(err);
                return;
            }
            console.log("Clowns.json updated");
        });
    }

});

/*Quote response*/
client.on('message', (message) => {
    if (!message.content.toLowerCase().includes("keabot") || message.author.bot || util.isNull(message.guild)) return;
    var server = message.guild.id;
    var user = message.author.id;
    var selection = Math.floor(Math.random() * 100);
    message.channel.send(quotes[selection].quote + "\n`" + quotes[selection].author + "`");
    console.log("Sent quote:");
    console.log(quotes[selection]);
});




// messageReactionAdd
/* Emitted whenever a reaction is added to a message.
PARAMETER              TYPE                   DESCRIPTION
messageReaction        MessageReaction        The reaction object
user                   User                   The user that applied the emoji or reaction emoji     */
client.on("messageReactionAdd", function (messageReaction, user) {
    console.log(`a reaction is added to a message`);
    console.log(messageReaction.emoji.name);

    if (messageReaction.emoji.name != "gold")
    {
        
        console.log("not a gold emoji");
        return;
    }



    var user = messageReaction.message.author.id;
    var server = messageReaction.message.guild.id;

    var gifter = messageReaction.client.user.id;
    if (gifter == user) return; //can't give gold to yourself


    var db = new sqlite3.Database('goldScore.sqlite');
    db.get("SELECT Score FROM RealmGold WHERE User = (?) AND Server = (?)", user, server, (err, row) => {
        console.log(typeof row);
        if (typeof row == 'undefined') {
            console.log("empty");
            db.run("INSERT INTO RealmGold (User, Server, Score) VALUES ((?), (?), (?))", user, server, 1);
        }
        else {
            console.log("Updating user");
            console.log(row);
            db.run("UPDATE RealmGold SET Score = (?) WHERE User = (?) AND Server = (?)", row.Score + 1, user, server);
        }
        db.close();
    });
    
});

// messageReactionRemove
/* Emitted whenever a reaction is removed from a message.
PARAMETER              TYPE                   DESCRIPTION
messageReaction        MessageReaction        The reaction object
user                   User                   The user that removed the emoji or reaction emoji     */
client.on("messageReactionRemove", function (messageReaction, user) {
    console.log(`a reaction is removed from a message`);
    if (messageReaction.emoji.name != "gold") {

        console.log("not a gold emoji");
        return;
    }
    var user = messageReaction.message.author.id;
    var server = messageReaction.message.guild.id;

    var gifter = messageReaction.client.user.id;
    if (gifter == user) return; //can't give gold to yourself

    var db = new sqlite3.Database('goldScore.sqlite');
    db.get("SELECT Score FROM RealmGold WHERE User = (?) AND Server = (?)", user, server, (err, row) => {
        console.log(typeof row);
        if (typeof row == 'undefined') {
            console.log("empty");
            db.run("INSERT INTO RealmGold (User, Server, Score) VALUES ((?), (?), (?))", user, server, 1);
        }
        else {
            console.log("Updating user");
            console.log(row);
            db.run("UPDATE RealmGold SET Score = (?) WHERE User = (?) AND Server = (?)", row.Score - 1, user, server);
        }
        db.close();
    });
});

client.login(token);
client.on('error', error => {
    console.error(error);
});
//process.on('unhandledRejection', err => console.error(`Uncaught Promise Rejection: \n${err.stack}`));
//process.on('uncaughtException', err => console.error(`There was an error here: ${err.stack}`));

process.on('SIGINT', () => {
    console.log('Closing the bot!');
    process.exit();

});