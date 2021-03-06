var express = require('express');
const apiRouter = express.Router();
const axios = require('axios').default;
var convert = require('xml-js');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
require('dotenv').config()
const cron = require("node-cron");
let shell = require("shelljs");

var myGenericMongoClient = require('./my_generic_mongo_client');
const { response } = require('express');

const optionDate = { year: "numeric", month: "2-digit", day: "2-digit" }

// Replace mongoId by PMID
function replace_mongoId_byPmid(article) {
    if (article != null) {
        article._id = article.pmid;
        delete article._id;
    }
    return article;
}


// Replace mongoId by PMID in ArrayList
function replace_mongoId_byPmid_inArray(publicationArray) {
    for (i in publicationArray) {
        replace_mongoId_byPmid(publicationArray[i]);
    }
    return publicationArray;
}

// Find article with publication date after a specific date
function findArticlesWithDateMini(articles, dateMini) {
    var selArticles = [];
    for (i in articles) {
        if (articles[i].revisionDate >= dateMini) {
            selArticles.push(articles[i]);
        }
    }
    console.log("number of articles: " + selArticles.length + " published /revised after " + dateMini)
    return selArticles;
}


//Get all articles / Get all articles published / revised after a date
//exemple URL: http://localhost:9999/article-api/public/articles (returning all articles)
//             http://localhost:9999/article-api/public/articles?dateMini=2020-06-19
apiRouter.route('/article-api/public/articles')
    .get(function (req, res, next) {
        var dateMini = req.query.dateMini;
        myGenericMongoClient.genericFindList('articles', {}, function (err, allArticle) {
            if (dateMini) {
                res.send(replace_mongoId_byPmid_inArray(findArticlesWithDateMini(allArticle, dateMini)));
            } else {
                res.send(allArticle);
                console.log("number of articles in database: " + allArticle.length)
            }
            if (err)
                res.send(err)
        });
    });

// Get article by _id
//exemple URL: http://localhost:9999/article-api/public/article/pmid/19909739
apiRouter.route('/article-api/public/article/pmid/:_id')
    .get(function (req, res, next) {
        var articlePmid = req.params._id;
        myGenericMongoClient.genericFindOne('articles',
            { '_id': articlePmid },
            function (err, article) {
                if (err)
                    res.send(err)
                if (article) {
                    res.send(article);
                    console.log("Article with PMID: " + articlePmid + " is found")
                } else {
                    console.log("No article found with the PMID: " + articlePmid)
                }
            });
    });

// Get article with a required word in title
//exemple URL: http://localhost:9999/article-api/public/articles/title/USP25
apiRouter.route('/article-api/public/articles/title/:wordTitle')
    .get(function (req, res, next) {
        var titleSearch = req.params.wordTitle;
        var titleSearchFormatted = titleSearch.replace(/[+]/g, "|")
        myGenericMongoClient.genericFindList('articles',
            { 'articleTitle': { $regex: titleSearchFormatted, $options: 'i' } },
            function (err, articlesListTitle) {
                if (err)
                    res.send(err)
                res.send(replace_mongoId_byPmid(articlesListTitle));
                console.log("number of article(s) with word(s) \"" + titleSearchFormatted.replace(/[|]/g, ", ") + "\" in title: " + articlesListTitle.length)
            });
    });

// Get article by journal
//exemple URL: http://localhost:9999/article-api/public/articles/journal/Molecular+cell
apiRouter.route('/article-api/public/articles/journal/:journal')
    .get(function (req, res, next) {
        var journalSearch = req.params.journal;
        var journalSearchFormatted = journalSearch.replace(/[+]/g, " ")
        console.log("journal: " + journalSearchFormatted)
        myGenericMongoClient.genericFindList('articles',
            { 'journal': journalSearchFormatted },
            function (err, articlesListJournal) {
                if (err)
                    res.send(err)
                res.send(replace_mongoId_byPmid(articlesListJournal));
                console.log("number of articles in " + journalSearchFormatted + " journal: " + articlesListJournal.length)
            });
    });


// Get article with required words in abstract
//exemple URL: http://localhost:9999/article-api/public/articles/abstract/usp28+USP25
apiRouter.route('/article-api/public/articles/abstract/:wordAbstract')
    .get(function (req, res, next) {
        var wordsSearch = req.params.wordAbstract;
        var abstractSearchFormatted = wordsSearch.replace(/[+]/g, "|")
        console.log(abstractSearchFormatted)
        myGenericMongoClient.genericFindList('articles',
            { 'articleAbstract': { $regex: abstractSearchFormatted, $options: 'i' } },
            function (err, articlesListAbstract) {
                if (err)
                    res.send(err)
                res.send(replace_mongoId_byPmid(articlesListAbstract));
                console.log("number of articles with this search \"" + abstractSearchFormatted.replace(/[|]/g, ", ") + "\" in abstract: " + articlesListAbstract.length)
            });
    });

// Get articles with required words in keywords
//exemple URL: http://localhost:9999/article-api/public/articles/keywords/ubiquitin+specific+protease
apiRouter.route('/article-api/public/articles/keywords/:keyword')
    .get(function (req, res, next) {
        var keywordsSearch = req.params.keyword;
        var keywordsSearchFormatted = keywordsSearch.replace(/[+]/g, " ")
        console.log(keywordsSearchFormatted)
        myGenericMongoClient.genericFindList('articles',
            { 'keywordsList': { $regex: keywordsSearchFormatted } },
            function (err, articlesListKeywords) {
                if (err)
                    res.send(err)
                res.send(replace_mongoId_byPmid(articlesListKeywords));
                console.log("number of articles with this search \"" + keywordsSearchFormatted + "\" in keywords: " + articlesListKeywords.length)
            });
    });


//Get articles with a author lastname +/- forename
//exemple URL: http://localhost:9999/article-api/public/articles/author/cholay
//             http://localhost:9999/article-api/public/articles/author/cholay?forename=michael
apiRouter.route('/article-api/public/articles/author/:lastName')
    .get(function (req, res, next) {
        var lastName = req.params.lastName
        var foreName = req.query.foreName;
        if (foreName != undefined) {
            var authorQuery = { $and: [{ 'authorsList.lastName': { $regex: lastName, $options: 'i' } }, { 'authorsList.foreName': { $regex: foreName, $options: 'i' } }] }
        } else {
            var authorQuery = { 'authorsList.lastName': { $regex: lastName, $options: 'i' } }
        }
        myGenericMongoClient.genericFindList('articles',
            authorQuery,
            function (err, articlesListAuthor) {
                if (err)
                    res.send(err)
                res.send(replace_mongoId_byPmid_inArray(articlesListAuthor));
                if (foreName != undefined)
                    console.log("number of articles of this author \"" + lastName + " " + foreName + "\": " + articlesListAuthor.length)
                else console.log("number of articles of this author \"" + lastName + "\": " + articlesListAuthor.length)
            })
    });

// exemple URL: http://localhost:9999/article-api/public/geoloc (returning all geoloc)
//             http://localhost:9999/article-api/public/articles?dateMini=2010-01-01
apiRouter.route('/article-api/public/geoloc')
    .get(function (req, res, next) {
        var dateMini = req.query.dateMini;
        myGenericMongoClient.genericFindList('geoloc', {}, function (err, allGeoloc) {
            if (dateMini) {
                res.send(replace_mongoId_byPmid_inArray(findArticlesWithDateMini(allGeoloc, dateMini)));
            } else {
                res.send(replace_mongoId_byPmid_inArray(allGeoloc));
            }
        });
    });


// Get _id list for articles with search of pubmed-api each day
function find_Pmid_bySearch_with_terms() {
    var urlApiSearch = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&retmode=json&usehistory=y&reldate=1&term=' + journalsList
    let request = new XMLHttpRequest()
    request.open("GET", urlApiSearch)
    request.send()
    request.onload = function () {
        if (request.status === 200) {
            var responseJs = JSON.parse(request.responseText)
            var count = responseJs.esearchresult.count
            if (count != 0) {
                var querykey = responseJs.esearchresult.querykey
                var webenv = responseJs.esearchresult.webenv
                console.log("idlist: " + responseJs.esearchresult.idlist)
                find_Article_Data_byFtech_with_PMID(querykey, webenv)
            } else {
                console.log("No result for this query")
            }
        }
    }
}


// Get all data of articles with Pubmed api each day
apiRouter.route('/article-api/public/articlePmidFinder')
    .get(function (req, res, next) {
        find_Pmid_bySearch_with_terms()
    })

// Get all data for articles with fetch of pubmed-api and xml conversion
function find_Article_Data_byFtech_with_PMID(querykey, webenv) {
    var urlApiFetch = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&query_key=' + querykey + '&WebEnv=' + webenv + '&rettype=abstract&retmode=xml'
    let request = new XMLHttpRequest()
    request.open("GET", urlApiFetch)
    request.send()
    request.onload = () => {
        console.log("requestSatus :" + request.status)
        if (request.status === 200) {
            responseJs = convert.xml2js(request.responseText, options)
            var publiListInput = responseJs.PubmedArticleSet.PubmedArticle
            if (publiListInput.length === undefined) {
                attributes_for_one_article(responseJs)
            } else attributes_for_list_of_articles(publiListInput)

        }
    }
}

// ArticleData when request return only one article
function attributes_for_one_article(responseJs) {
    console.log("***** 1 article found with this request ******")
    var article = new Object()
    var medlineCitationPropertyOneArticle = responseJs.PubmedArticleSet.PubmedArticle.MedlineCitation
    var articlePropertyOneArticle = responseJs.PubmedArticleSet.PubmedArticle.MedlineCitation.Article


    article._id = medlineCitationPropertyOneArticle.PMID
    article.articleTitle = articlePropertyOneArticle.ArticleTitle
    article.journal = articlePropertyOneArticle.Journal.Title


    // if (medlineCitationPropertyOneArticle.hasOwnProperty("DateCompleted")) {
    //     date = new Date(Date.UTC(medlineCitationPropertyOneArticle.DateCompleted.Year, medlineCitationPropertyOneArticle.DateCompleted.Month - 1, medlineCitationPropertyOneArticle.DateCompleted.Day))
    // } else date = new Date(Date.UTC(articlePropertyOneArticle.ArticleDate.Year, articlePropertyOneArticle.ArticleDate.Month - 1, articlePropertyOneArticle.ArticleDate.Day))
    // article.publicationDate = date.toLocaleDateString(undefined, optionDate)

    // dateOfRevision = new Date(Date.UTC(medlineCitationPropertyOneArticle.DateRevised.Year, medlineCitationPropertyOneArticle.DateRevised.Month - 1, medlineCitationPropertyOneArticle.DateRevised.Day))
    // article.revisionDate = dateOfRevision.toLocaleDateString('fr-CA', optionDate)

    article.articleAbstract = articlePropertyOneArticle.Abstract.AbstractText
    article.pubmedUrl = "https://pubmed.ncbi.nlm.nih.gov/" + article._id

    if (medlineCitationPropertyOneArticle.hasOwnProperty("KeywordList")) {
        article.keywordsList = medlineCitationPropertyOneArticle.KeywordList.Keyword
    } else article.keywordsList = "Not available"
    article.authorsList = []
}

const journalsList = 'Cell[ta]+OR+Nature+Reviews+Genetics[ta]+OR+Nature+Reviews+Molecular+Cell+Biology[ta]'

// ArticleData when request return a list of articles
async function attributes_for_list_of_articles(publiListInput) {
    console.log("Start of uploading data from Pubmed library")
    console.log("***** " + publiListInput.length + " articles found with this request ******")

    for (let i = 1; i <= publiListInput.length; i++) {
        var article = new Object()
        var medlineCitationPropertyListArticles = publiListInput[i - 1].MedlineCitation
        var articlePropertyListArticles = publiListInput[i - 1].MedlineCitation.Article
        article._id = medlineCitationPropertyListArticles.PMID
        article.articleTitle = articlePropertyListArticles.ArticleTitle
        article.journal = articlePropertyListArticles.Journal.Title

        if (medlineCitationPropertyListArticles.hasOwnProperty("DateRevised")) {
            // dateOfRevision = new Date(Date.UTC(medlineCitationPropertyListArticles.DateRevised.Year, medlineCitationPropertyListArticles.DateRevised.Month - 1, medlineCitationPropertyListArticles.DateRevised.Day))
            article.revisionDate = `${medlineCitationPropertyListArticles.DateRevised.Year}-${medlineCitationPropertyListArticles.DateRevised.Month}-${medlineCitationPropertyListArticles.DateRevised.Day}`
        } else {
            article.revisionDate = "No revision date"
            console.log("no DateRevised property for " + article._id)
        }
        // article.revisionDate = dateOfRevision.toLocaleDateString('fr-CA', optionDate)

        if (articlePropertyListArticles.hasOwnProperty("Abstract")) {
            if (Array.isArray(articlePropertyListArticles.Abstract.AbstractText)) {
                article.articleAbstract = articlePropertyListArticles.Abstract.AbstractText.join(" ")
            }
            else article.articleAbstract = articlePropertyListArticles.Abstract.AbstractText
        } else {
            article.articleAbstract = "Not available"
            console.log("no AbstractText property for " + article._id)
        }

        article.pubmedUrl = "https://pubmed.ncbi.nlm.nih.gov/" + article._id

        if (medlineCitationPropertyListArticles.hasOwnProperty("KeywordList")) {
            if (Array.isArray(medlineCitationPropertyListArticles.KeywordList.Keyword)) {
                article.keywordsList = medlineCitationPropertyListArticles.KeywordList.Keyword.join(", ")
            }
            else article.keywordsList = medlineCitationPropertyListArticles.KeywordList.Keyword
        } else {
            article.keywordsList = "No keyword"
            console.log("No keyword for " + article._id)
        }

        if (articlePropertyListArticles.hasOwnProperty("AuthorList")) {
            article.authorsList = []
            var authorsListInput = articlePropertyListArticles.AuthorList.Author
            if (Array.isArray(authorsListInput)) {
                for (let index = 1; index <= authorsListInput.length; index++) {
                    var author = new Object()
                    author.lastName = authorsListInput[index - 1].LastName
                    author.foreName = authorsListInput[index - 1].ForeName
                    var affiliationInfoString = JSON.stringify(authorsListInput[index - 1].AffiliationInfo)
                    if (affiliationInfoString == undefined) {
                        author.affiliationPubmed = "No available affiliation"
                    } else {
                        if (affiliationInfoString.includes("Affiliation")) {
                            var affiliationAdress = affiliationInfoString.split('"Affiliation":"')
                            author.affiliationPubmed = affiliationAdress[1]
                            if (author.affiliationPubmed.includes("Electronic address:")) {
                                var affiliation = (author.affiliationPubmed.split('. Electronic address: '))
                                author.affiliationPubmed = affiliation[0]
                                if (affiliation[1].slice(-1) === '.') {
                                    author.email = affiliation[1].slice(0, affiliation[1].length - 1)
                                } else author.email = affiliation[1]
                            } else author.email = "Not available"
                        } else author.affiliationPubmed = affiliationInfoString
                    }

                    //////////// geocoding \\\\\\\\\\\\\\

                    var affPubmed = author.affiliationPubmed

                    if (affPubmed != undefined) {
                        var affPubmedUTF8 = encodeURI(affPubmed)
                        const mapsApiKey = process.env.KEY_GOOGLEMAPS || KEY_GOOGLEMAPS
                        var urlGeoCodingAPI = `https://maps.googleapis.com/maps/api/geocode/json?address=${affPubmedUTF8}&key=${mapsApiKey}`

                        const geocod = await axios.get(urlGeoCodingAPI)
                            .then(resp => {
                                author.googleFormatedAdress = resp.data.results[0].formatted_address
                                author.latitude = resp.data.results[0].geometry.location.lat
                                author.longitude = resp.data.results[0].geometry.location.lng
                            })
                            .catch(err => console.log(err))
                    } else {
                        geoloc.latitude = "Not available"
                        geoloc.longitude = "Not available"
                    }
                    article.authorsList.push(author)
                }

            } else {
                var author = new Object()
                author.lastName = authorsListInput.LastName
                author.foreName = authorsListInput.ForeName
                var affiliationInfoString = JSON.stringify(authorsListInput.AffiliationInfo)
                if (affiliationInfoString == undefined) {
                    author.affiliationPubmed = "No available affiliation"
                } else {
                    if (affiliationInfoString.includes("Affiliation")) {
                        var affiliationAdress = affiliationInfoString.split('"Affiliation":"')
                        author.affiliationPubmed = affiliationAdress[1]
                        if (author.affiliationPubmed.includes("Electronic address:")) {
                            var affiliation = (author.affiliationPubmed.split('. Electronic address: '))
                            author.affiliationPubmed = affiliation[0]
                            if (affiliation[1].slice(-1) === '.') {
                                author.email = affiliation[1].slice(0, affiliation[1].length - 1)
                            } else author.email = affiliation[1]
                        } else author.email = "Not available"
                    } else author.affiliationPubmed = affiliationInfoString
                }
                article.authorsList.push(author)
            }
        }

        console.log()
        console.log("------------------------- ARTICLE " + i + " / " + publiListInput.length + " -------------------------")
        console.log(JSON.stringify(article, null, " "))
        console.log()

        myGenericMongoClient.genericInsertOne('articles',
            article,
            function (err, res) {
                if (err)
                    res.send(err)
                res.send(article);
            });
        console.log("Article with PMID " + article._id + " is successfully saved")
        
    }
    console.log("End of uploading data from Pubmed library")
}

    // Conversion of xml results to Js object
    const removeJsonTextAttribute = function (value, parentElement) {
        try {
            const parentOfParent = parentElement._parent;
            const pOpKeys = Object.keys(parentElement._parent);
            const keyNo = pOpKeys.length;
            const keyName = pOpKeys[keyNo - 1];
            const arrOfKey = parentElement._parent[keyName];
            const arrOfKeyLen = arrOfKey.length;
            if (arrOfKeyLen > 0) {
                const arr = arrOfKey;
                const arrIndex = arrOfKey.length - 1;
                arr[arrIndex] = value;
            } else {
                parentElement._parent[keyName] = value;
            }
        } catch (e) { }
    };

    var options = {
        compact: true,
        spaces: 2,
        trim: true,
        nativeType: false,
        ignoreDeclaration: true,
        ignoreInstruction: true,
        ignoreAttributes: true,
        ignoreComment: true,
        ignoreCdata: true,
        ignoreDoctype: true,
        textFn: removeJsonTextAttribute
    };

    //local scheduler for pubmed api call (at 14:00 on every day-of-week)
    // cron.schedule("0 14 * * */1", async ()=>{
    //     console.log("Scheduler running ...");
    //     find_Pmid_bySearch_with_terms()
        // if(shell.exec("dir").code !== 0){
        //     console.log("Something went wrong");
        // }
    // });

    exports.apiRouter = apiRouter;
    exports.find_Pmid_bySearch_with_terms = find_Pmid_bySearch_with_terms;