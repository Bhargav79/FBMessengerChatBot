
//requiring libraries
const ex = require('express');
const app = ex();
var port= process.env.PORT || 3000;
const body = require('body-parser');
const joke = require('./jokes');
const request = require('request');



app.use(body.urlencoded({extended:false}));
app.use(body.json());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST");
  next();
  });

//Basic GET route to the server end point
app.get('/', function(req,res){
  res.send('Hi there, I am a Facebook Messenger Chat Bot');
});

//Adding facebook webhook and verifying the token uing GET request
app.get('/webhook/', (req, res) => {
    //use this token for verification while creating the webhook
      const tokenVeri = "Your Verification Token Goes Here"
      const mode = req.query['hub.mode'];
      const token = req.query['hub.verify_token'];
      const challenge = req.query['hub.challenge'];
      if (mode && token) {
        if (mode === 'subscribe' && token === tokenVeri ) {
          console.log('WEBHOOK_VERIFIED');
          res.status(200).send(challenge);
        }
        else {
          res.sendStatus(403);
        }
      }
});

//POST request ti the webhook. Replying with appropriate message
app.post('/webhook/', function(req, res) {
	const messaging_events = req.body.entry[0].messaging
	for (let i = 0; i < messaging_events.length; i++) {
		const event = messaging_events[i]
		const sender = event.sender.id
		if (event.message && event.message.text) {
            let text = event.message.text
            if(text.includes("Hi")||text.includes("hi")||text.includes("Hello")||text.includes("hello")||text.includes("Good")||text.includes("good"))
            {
                reply(sender, "Hi There");
            }
            else if(text.includes("joke")||text.includes("one")||text.includes("One")||text.includes("another")||text.includes("Joke")||text.includes("Another")){
                const ran = Math.floor(Math.random()*10);
                reply(sender,joke[ran]);
            }
            else if(text.includes("thanks")||text.includes("thank you")||text.includes("Thanks")||text.includes("Thank You")||text.includes("Thank")||text.includes("thank")){
                reply(sender, "Alright then. I'll talk to you later. Bye");
            }
            else
            {
                reply(sender, "I can tell you a joke but if you were asking for something else, I am still learning");
            }
		}
	}
	res.sendStatus(200)
})

//Adding facebook page token
const token = "Your FaceBook Page Token Goes Here";

//The method which sends message back to the messenger
function reply(sender, text) {
	const reply = {text: text}
	request({
		url: "https://graph.facebook.com/v2.6/me/messages",
		qs : {access_token: token},
		method: "POST",
		json: {
			recipient: {id: sender},
			message : reply,
		}
	}, function(err, response, body) {
		if (err) {
			console.log("sending error")
		} else if (response.body.error) {
			console.log("response body error")
		}
	})
}

//node is listening on port 3000
app.listen(port);
