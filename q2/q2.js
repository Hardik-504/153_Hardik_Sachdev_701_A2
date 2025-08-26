const express = require('express');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const path = require('path');
const fs = require('fs');
const app = express();

const session = require('express-session');
const FileStore = require('session-file-store')(session);


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true })); //urlencode: Passes the Form Data
app.use(express.static('public'));

app.use(session({
    store: new FileStore({}),
    secret: 'hello',
    resave: false,
    saveUninitialized: false
}));

app.get('/', (req, res) => {
    res.redirect('/homepage');
});

app.get('/homepage', (req, res) => {
    res.render('homepage', { error: null });
});

app.post('/homepage', (req, res) => {
    const { txtuname, txtpassword } = req.body;

    const USER = 'harsh';
    const PASS = 'harsh@123';

    if (txtuname === USER && txtpassword === PASS) {
        req.session.user = txtuname;
        res.redirect('/dashboard');
    } else {
        res.render('homepage', { error: 'Invalid username or password!' });
    }
});

app.get('/dashboard', (req, res) => {
    if (req.session.user) {
        res.render('dashboard', { user: req.session.user });
    } else {
        res.redirect('/homepage');
    }
    
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.send('Error logging out');
        }
        res.redirect('/homepage');
    });
});

app.listen(8000, () => {
    console.log("Server is running on http://localhost:8000");
});

// app.set('view engine', 'ejs');
// app.use(express.urlencoded({ extended: true }));
// app.use(express.static('public'));



// app.get('/rrr',(req,res)=>{
//     res.send("Hello hghghghgh");
// })

// app.get('/rs',(req,res)=>{
//     res.send("Hello hi");
// })

// app.listen(8000,()=>{
//     console.log("Server Is Running on http://localhost:8000");
// })