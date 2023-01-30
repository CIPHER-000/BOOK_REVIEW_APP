const express = require('express');
const app = express();

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





app.get('/login', (req, res) => {
    res.render('login.html');
});

app.get('/register', (req, res) => {
    res.render('register.html');
});

app.listen(3000, () => {
    console.log('App listening on port 3000');
});