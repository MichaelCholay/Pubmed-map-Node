const articlesApiRoutes = require('./articles-api-routes');

// articlesApiRoutes = require('./articles-api-routes')

console.log("Scheduler running ...");
articlesApiRoutes.find_Pmid_bySearch_with_terms()
console.log("Scheduler end !!!");