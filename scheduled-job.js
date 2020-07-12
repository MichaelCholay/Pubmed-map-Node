var getArticlesFromPubmed = require('./articles-api-routes')

console.log("Scheduler running ...");
getArticlesFromPubmed.find_Pmid_bySearch_with_terms()
console.log("Scheduler end !!!");