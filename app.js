const express = require('express');
const app = express();
const path = require('path');

const crypto = require('crypto');
const secret = crypto.randomBytes(64).toString('hex');
console.log(secret);

const session = require("express-session");
app.use(session({
    secret: "ef26ea49688b4db326a7cedc0076ac9ebe6242d387299db702f9a393aef083fc3f57b5c2cfea1bfa41861338c5e693c9e1024f6cce70bb3093c25befd2ff49dd"
}));

const Sequelize = require('sequelize');
const sequelize = new Sequelize('review book', 'root', 'root_toor', {
    host: 'localhost',
    dialect: 'mysql'
});



sequelize
    .authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

const User = sequelize.define('user', {
    username: {
        type: Sequelize.STRING
    },
    password: {
        type: Sequelize.STRING
    }
});


const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(
    function(username, password, done) {
        User.findOne({ where: { username: username } }).then(user => {
            if (!user) {
                return done(null, false, { message: 'Incorrect username' });
            }
            if (user.password !== password) {
                return done(null, false, { message: 'Incorrect password' });
            }
            return done(null, user);
        });
    }
));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findByPk(id).then(user => {
        done(null, user);
    });
});

app.use(passport.initialize());
app.use(passport.session());


app.use(express.static('static'));

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/views/templates/layout.html');
});

app.get('/static/styles.css', function(req, res) {
    res.set('Content-Type', 'text/css');
    res.sendFile(__dirname + '/views/static/styles.css');
});


app.get("/", (req, res) => {
    res.sendFile(__dirname + "/views/templates/layout.html");
});


app.get('/login', function(req, res) {
    res.sendFile(__dirname + '/views/login.html');
});

app.get('/register', (req, res) => {
    res.render('/views/register.html');
});

app.listen(3000, () => {
    console.log('App listening on port 3000');
});