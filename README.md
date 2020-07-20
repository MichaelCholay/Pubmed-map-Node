# Welcome to Pubmed-map !
 ### Search - Localize - Cooperate

Pubmed-map allows localization and mapping of authors of biomedical literature from medline and life science journals of pubmed.gov library (NIH National Library of Medicine and NCBI National Center for Biotechnology Information) in the aim to develop cooperation between scientists. 
 
Pubmed-map is divided into 4 parts available in this Github account :
   
   - [Pubmed-map - API REST]([https://github.com/MichaelCholay/Pubmed-map-Node](https://github.com/MichaelCholay/Pubmed-map-Node)) to send requests to the official Pubmed api and to save specific articles' data in MongoDb with NodeJs server.
   - [Pubmed-map - Spring Microservice article]([https://github.com/MichaelCholay/Pubmed-map-spring-articles](https://github.com/MichaelCholay/Pubmed-map-spring-articles)) to send request to Pubmed-map API and to analyze recovered data
   - [Pubmed-map - Spring Microservice authentification]([https://github.com/MichaelCholay/Pubmed-map-spring-jwt](https://github.com/MichaelCholay/Pubmed-map-spring-jwt)) to allow creation of user session and selection of favorite articles in MySQL database. This part is based on JWT authentification tutorial of [grokonez.com](http://www.grokonez.com)
   - [Pubmed-map - Angular]([https://github.com/MichaelCholay/Pubmed-map-Front](https://github.com/MichaelCholay/Pubmed-map-Front)), the front part of this project based on open-source [Leaflet library]([https://www.leafletjs.com](https://www.leafletjs.com))
   
   
   ## Technologies for development of Pubmed-map
   
   - NodeJs v12 with several packages as express v4.17.1(network framework), axios v0.19.2 (HTTP client for API request), xml-js v1.6.11 (converter of XML text to Javascript object / JSON text), mongoDb v3.5.9 (official MongoDb driver) and XMLHttpRequest v1.8.0 (HTTP client for API request) ⇒ creation of the API to question Pubmed
   - MongoDB v4.2, non-relationnal database ⇒ articles storage
   - Spring boot v2.3.1 ⇒ java-based microservices
   - MySQL v8, relational database ⇒ user and favorite articles storage
   - Angular v9, TypeScript-based open-source web application framework
