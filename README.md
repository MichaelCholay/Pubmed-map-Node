# Welcome to Pubmed-map !
 ### Search - Localize - Cooperate
 
 (API - REST: part 1/4)

Pubmed-map allows localization and mapping of authors of biomedical literature from medline and life science journals of pubmed.gov library (NIH National Library of Medicine and NCBI National Center for Biotechnology Information) in the aim to develop cooperation between scientists. At this time, Pubmed-map API collect articles of the TOP3 of scientific journals (Cell, Nature Reviews Genetics and Nature Reviews Molecular Cell Biology) each day).
 
Pubmed-map is divided into 4 parts available in this Github account :
   
   - [Pubmed-map - API REST]([https://github.com/MichaelCholay/Pubmed-map-Node](https://github.com/MichaelCholay/Pubmed-map-Node)) to send daily requests to the official Pubmed api and to save specific articles' data in MongoDb with NodeJs server.
   - [Pubmed-map - Spring Microservice article]([https://github.com/MichaelCholay/Pubmed-map-spring-articles](https://github.com/MichaelCholay/Pubmed-map-spring-articles)) to send request to Pubmed-map API and to analyze recovered data
   - [Pubmed-map - Spring Microservice authentification]([https://github.com/MichaelCholay/Pubmed-map-spring-jwt](https://github.com/MichaelCholay/Pubmed-map-spring-jwt)) to allow creation of user session and selection of favorite articles in MySQL database. This part is based on JWT authentification tutorial of [grokonez.com](http://www.grokonez.com)
   - [Pubmed-map - Angular]([https://github.com/MichaelCholay/Pubmed-map-Front](https://github.com/MichaelCholay/Pubmed-map-Front)), the front part of this project based on open-source [Leaflet library]([http://www.leafletjs.com](http://www.leafletjs.com))
 

## Technologies for development of Pubmed-map
   
   - NodeJs v12 with several packages as express v4.17.1(network framework), axios v0.19.2 (HTTP client for API request), xml-js v1.6.11 (converter of XML text to Javascript object / JSON text), mongoDb v3.5.9 (official MongoDb driver) and XMLHttpRequest v1.8.0 (HTTP client for API request). Moreover, you need a project with a billing account and the Geolocation API  enabled in google maps to allow the geolocation of authors' address ⇒ creation of the API to question Pubmed
   - MongoDB v4.2, non-relationnal database ⇒ articles storage
   - Spring boot v2.3.1 ⇒ java-based microservices
   - MySQL v8, relational database ⇒ user and favorite articles storage
   - Angular v9, TypeScript-based open-source web application framework

## Technologies for CI/CD of Pubmed-map
   
   - [Heroku](www.heroku.com), Cloud application platform
   - [MongoDB Atlas]([https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)), Cloud noSQL database
   - [ClearDB](www.cleardb.com), Cloud MySQL database
   - [GitHub actions]([https://fr.github.com/features/actions](https://fr.github.com/features/actions)), CI/CD workflow

## How to use Pubmed-map - API REST

### Installation
   In your terminal :
   - clone this repository `git clone https://github.com/MichaelCholay/Pubmed-map-Node.git`
   - in the new created folder **pubmed-map**, use the command `npm install`to install all needed packages

### Configuration
Then, use the provided **.sample-env** file to set environment variables and save and rename it **.env** at the root of the project. The needed environment variables are:
   - PORT: a free port to run the node server.js
   - DB_NAME_MONGO: a name for the mongoDb collection
   - URL_MONGO: an url for the connection of your noSQL database
   - KEY_GOOGLEMAPS: an API key for the connection at the geolocation API of google maps

### Run
`node server.js`

### API URL
An API documentation (swagger-ui) is provided with the  [Pubmed-map - Spring Microservice article]([https://github.com/MichaelCholay/Pubmed-map-spring-articles](https://github.com/MichaelCholay/Pubmed-map-spring-articles)).
#
