# Pubmed-Map


NodeJs server of the pubmed-map project. The aim of this project is the localization and mapping of biomedical literature from medline and life science journals from pubmed.gov library (NIH National Library of Medicine and NCBI National Center for Biotechnology Information). The Spring Microservices part of this project is available at https://gitlab.com/Dr.MCY/pubmed-map_spring and the Angular front part is availalbe at https://github.com/MichaelCholay/Pubmed-map-Front.

To run this part, please fill environment variables for NodeJs(PORT), for mongoDb (USER_MONGO, PASSWORD_MONGO, DB_NAME_MONGO, URL_MONGO) and google maps api (KEY_GOOGLEMAPS) with your personal values in the .sample-env file and save it as .env file at the root of your project.
This application create a NoSQL collection (named articles) in a database named pubmed-map and fill it daily with scientific publications from the pubmed library. A connection with the Google maps API is used for the geocoding of address of publication's authors.

