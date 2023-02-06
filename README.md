# BOOK_REVIEW_APP

##AUTHENTICATION AND INSTALLATION EXPLANATION:

This code is a Node.js script for creating an authentication system for a web application using the Express.js framework, MySQL as the database, and Passport.js as the authentication middleware.

The first line const express = require('express'); loads the Express.js library, which is a web framework for Node.js.

The line const app = express(); creates an instance of the Express.js application.

The line const mysql = require('mysql2'); loads the MySQL2 library, which is a Node.js client for MySQL.

The line const bodyParser = require('body-parser'); loads the Body Parser library, which is used to parse incoming request bodies.

The line const bcrypt = require('bcrypt'); loads the Bcrypt library, which is used to hash and compare passwords.

The line const saltRounds = 10; sets the number of salt rounds used by the Bcrypt library to hash passwords.

The line var flash = require('connect-flash'); loads the Connect-Flash library, which is used to store messages for one-time display in response views.

The line app.use(flash()); initializes the Connect-Flash library for the Express.js application.

The line app.use(express.urlencoded({ extended: true })); sets up Express.js to parse incoming requests with the URL-encoded data.

The line app.use(bodyParser.urlencoded({ extended: true })); sets up Body Parser to parse incoming requests with the URL-encoded data.

The next block of code creates a connection to the MySQL database using the MySQL2 library. It specifies the host, user, password, and database name to use.

The line con.connect(function(err) { if (err) throw err; console.log("Connected to MySQL"); }); connects to the MySQL database and logs a message to the console if the connection is successful.

The line const secret = require('crypto').randomBytes(64).toString('hex'); generates a random secret key using the Crypto library in Node.js.

The line console.log("Secret key:", secret); logs the secret key to the console.

The line const session = require("express-session"); loads the Express-Session library, which is used to store session data.

The line app.use(session({ secret, resave: false, saveUninitialized: false })); sets up Express-Session for the Express.js application and sets the secret key and options for resaving and initializing session data.

The line const passport = require('passport'); loads the Passport.js library, which is used for authentication.

The line const LocalStrategy = require('passport-local').Strategy; loads the Passport-Local library, which provides a local authentication strategy for Passport.js.

The next block of code sets up the local authentication strategy for Passport.js. It specifies a callback function to be called when a user attempts to log in. The function takes the username, password, and a "done" callback as arguments. It first checks if the user exists in the database by querying the user table with the given username. 
