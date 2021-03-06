var express = require('express');
var articleApiRoutes = require('./articles-api-routes.js');
var app = express();
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()
app.use(jsonParser);
require('dotenv').config()

const nodePort = process.env.PORT || PORT;


//les routes en /html/... seront gérées par express
//par de simples renvois des fichiers statiques du répertoire "./html"
app.use('/html', express.static(__dirname + "/html"));

app.get('/', function (req, res) {
    res.redirect('/html/index.html');
});
app.use(articleApiRoutes.apiRouter); //delegate REST API routes to apiRouter(s)

app.listen(nodePort, function () {
    console.log("Pubmed-map-node is running on port " + nodePort);
});

// CORS enabled with express/node-js : 
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");                                      
            //ou avec  "www.xyz.com" à la place de "*" en production   
    res.header("Access-Control-Allow-Headers",                    
        "Origin, X-Requested-With, Content-Type, Accept");  
    next();
    });