//Heroku scheduler for pubmed api call (at 02:00 on every day)

const articlesApiRoutes = require('./articles-api-routes');

console.log("Scheduler running ...");
articlesApiRoutes.find_Pmid_bySearch_with_terms()   
