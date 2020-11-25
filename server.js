require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const dns = require("dns")

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

mongoose.connect(process.env.DB_URL,{useNewUrlParser: true, useUnifiedTopology: true })


//mongoose schema
 const urlSchema = mongoose.Schema({
   originalUrl:{
     type: String,
     required:true,
     unique: true
   },
   shortUrl:{
     type: String,
     unique: true
   }
 })

 //model
 const Url = mongoose.model("Url", urlSchema)

//configure bodyParser
app.use(bodyParser.urlencoded({extended: false}))

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

//thajks to this solution tgat help to generate this function https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript/1349426#
function generateUrl() {
   var result           = '';
   var characters       = 'abcdefghijklmnopqrstuvwxyz0123456789';
   var charactersLength = characters.length;
   for ( var i = 0; i < 5; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

app.post("/api/shorturl/new", (req, res)=>{
 let url = req.body.url
	let short = req.body.short_url.toLowerCase()
	let ranUrl = generateUrl()
	let shortUrl = short === ""?ranUrl:short

 //check mongoose connection =  1 fir connection
 console.log(mongoose.connection.readyState)

//if the user do not enter a string, gejerateva random string

	let result = url.replace(/(^\w+:|^)\/\//ig, "").split(/[/?#]/)[0];
 console.log(result)

	dns.lookup(result, (err, address, family) => {
    console.log(err)
   if(err) return res.json({error: 'invalid url'})
   
   //find the last short url in the database
   /*Url.find({}).limit(1).sort({shortUrl: -1}).select('shortUrl').exec((err, data)=>{
        if (err) return res.json({error:err})
        let short_url= data[0].shortUrl+1*/

	//using stribg variabkes instead of nunbers
	//find the DB to nake sure that the stribgvis uniwue befire snding it to the Db
	Url.find({}).exec((err, data)=>{
	if (err) return res.json({error:err})
		data.map(short =>{
			console.log(short.shortUrl)
		if(shortUrl !== short.shortUrl){
		return shortUrl
		}else{
			shortUrl = "Short Url Exist"}
		})
		if(shortUrl === "Short Url Exist"){
   res.json({short_url: "Short Url Exist"})
		} else{
   //instance to be saved in DB
   const shortDom = new Url({originalUrl: url, shortUrl:shortUrl})
   
   shortDom.save((err, domain)=>{
     if (err) return res.json({error: err})
   
   
   res.json({original_url:url, short_url:shortUrl})
   
  console.log('address: %j family: IPv%s', address, family)
  })
}
   })
});
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
