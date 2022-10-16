var app = require('express')();
var express = require('express');
var path = require('path');
var http = require('http').Server(app);
var bcrypt = require('bcrypt');
var bodyParser = require('body-parser');
var router = require('./routes/router.js');
var Authrouter = require('./routes/Authrouter.js');
const mysql = require('mysql')
const {urlencoded} = require('body-parser')
const methodOverride = require('method-override')
const session = require('express-session')
const flash = require('connect-flash')

//database
const db = mysql.createConnection({
    connectionLimit:10,
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'polyclinic database'
  })
    db.connect((err)=>{
        if(err){
            throw err
        }
        console.log('database connected')
    })

  
// Access public folder from root
app.use('/public', express.static('public'));
app.get('/layouts/', function(req, res) {
  res.render('view');
});

//use
app.use(methodOverride('_method'))
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())
app.use(session({
    secret:'thesecretkey',
    resave:false,
    saveUninitialized:false,
}));
app.use(flash())


// Add Authentication Route file with app
app.use('/', Authrouter); 

//register admin
Authrouter.post('/register', async (req,res)=>{
    const {username,password} = req.body;
    const hash = await bcrypt.hash(password, 12);
    const admin = {
        username,
        password: hash,
    }
    let sql = 'INSERT INTO admin SET ?';
    db.query(sql,admin,(err,data)=>{
        if(!err){
            req.flash('success','New Admin created')
              res.redirect('/register')
        }else{
            console.log(err) 
        }
        console.log(req.body)
    })
})



//For set layouts of html view
var expressLayouts = require('express-ejs-layouts');
const { render } = require('ejs');
const { route } = require('./routes/router.js');
const { rmSync } = require('fs');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);


// Add Route file with app
  app.use('/', router);

//login admin
router.post('/dashboard', async (req,res)=>{
    res.locals = {  title: 'Dashboard' };
    const {username, password} = req.body;
    const pass = req.body.password;

    let sql = 'SELECT password  FROM admin where username = username'
    db.query(sql,async (err,data)=>{
        if(!err){
        let dbPass = JSON.stringify(data)
         dbPass = data[0].password
         console.log(dbPass)
        let dbP = await bcrypt.compare(pass,dbPass)
        if(dbP){
            req.session.username = username
            let sql = 'SELECT * from appointment ORDER BY id DESC';
            db.query(sql,(err,data)=>{
        if(!err){
            res.render('Dashboard/dashboard', {data,message: req.flash('success')});
        }
    }) 
        }else{
            res.redirect('/admin')
        }
        console.log(dbP)
    }
        
    })
})

//logout

//landing page
router.get('/', (req,res)=>{

  res.render('Home/index', {layout:false, message: req.flash('success')})
})


// Dashboard
router.get('/dashboard', function (req, res) {
    res.locals = {  title: 'Dashboard' };
    if(!req.session.username){
        res.redirect('/')
    }else{
        let sql = 'SELECT * from appointment ORDER BY id DESC';
    db.query(sql,(err,data)=>{
        if(!err){
            res.render('Dashboard/dashboard', {data,message: req.flash('success')});
        }
    })
    }
       
})

//Get patient by ID
router.get('/dashboard/:id', (req,res)=>{

    let sql = 'SELECT * from appointment WHERE id = ?';
    db.query(sql,req.params,(err,data)=>{
        if(!err){
            res.send(data)
        }else{
            console.log(err)
        }
    })
})

// Delete Patient
router.delete('/dashboard/:id', (req,res)=>{
    let sql = 'DELETE from appointment WHERE id = ?';
    db.query(sql,req.params.id,(err,data)=>{
        if(!err){
            req.flash('success','Successfully deleted the patient')
            res.redirect('/dashboard')
        }else{
            console.log(err)
        }
    })
})

// Add patient appointment
router.post('/', (req,res,e)=>{
    const patient = req.body;
    let sql = 'INSERT INTO appointment SET ?';
    db.query(sql,patient,(err,data)=>{
        if(!err){
            req.flash('success','Successfully made an appointment')
              res.redirect('/')
        }else{
            console.log(err) 
        }
        console.log(req.body)
    })
})


app.listen(2000, function(){
  console.log('listening on *:8000');
});
