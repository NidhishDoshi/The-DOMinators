//Importing Libraries
import express from "express";
import bodyParser from "body-parser";
import { fileURLToPath } from "url";
import { dirname } from "path";
import mysql from "mysql2";
import bcrypt from "bcrypt";
import ExcelJS from "exceljs";

const app = express(); //Initialize Express.js
const port = 3000; //Set Port
const saltRounds = 10;

//Establish connection to MySQL database
const db = mysql.createConnection({
    host: "sql12.freesqldatabase.com",
    user: "sql12715405",
    database: "sql12715405",
    password: "yGUFn6HaP8",
    port: 3306,
});

//Connect to database
db.connect((err) => {
    if (err) {
        console.error("Error connecting to the database: ", err);
        
    } else {
        console.log("Connected to MySQL database...");
    }
});

//Handle error with connection to database
db.on('error', (err) => {
    console.error("Database Error: ", err);
    if (err.code === 'ECONNRESET') {
        handleDisconnect();
    }
});

function handleDisconnect() {
    db.connect((err) => {
        if (err) {
            console.error("Error reconnecting: ", err);
            setTimeout(handleDisconnect, 2000);
        } else {
            console.log("Reconnected to MySQL database...");
        }
    });
}

const __dirname = dirname(fileURLToPath(import.meta.url)); //Get current path

app.use(express.static('public')); //Serve static files from the public directory
app.use(bodyParser.urlencoded({ extended: true })); //Make the parsed data accessible on the req.body property

//Define variables
let books = [];
var name="";
var email="";
let cs_all_books = [];
let me_all_books = [];
let ee_all_books = [];
let ce_all_books = [];
let ch_all_books = [];
let ep_all_books = [];

//Get titles of all the books from the database
try {
    db.query("SELECT title FROM `TABLE 1`", function (err, result) {
        if (err) {
            console.error("Error fetching books: ", err);
        } else {
            if (result.length > 0) {
                for (let i = 0; i < result.length; i++) {
                    books.push(result[i].title);
                }
            }
        }
    });
} catch (err) {
    console.error("Error fetching books: ", err);
}

//Render the open.ejs file
app.get("/", (req, res) => {
    res.render(__dirname + "/views/open.ejs", {
        books: books,
    });
});

//Render the login.ejs file
app.get("/login", (req, res) => {
    res.render(__dirname + "/views/login.ejs", {
        response: "",
    });
});

//Render the signup.ejs file
app.get("/signup", (req, res) => {
    res.render(__dirname + "/views/signup.ejs");
});

//Get the data input by the user and check if it is valid or not
app.post("/login", async (req, res) => {
    const username = req.body.Username;
    const password = req.body.Password;
    if(username!='Admin@iitdh.ac.in'){
    try {
        db.query("SELECT * FROM users WHERE email=?", [username], function (err, result) {
            if (err) {
                console.error("Error: ", err);
            } else {
                if (result.length > 0) {
                    const pass = result[0].password;
                    name = result[0].fName;
                    email = result[0].email;
                    bcrypt.compare(password, pass, (err, result) => {
                        if (err) {
                            console.error("Error: ", err);
                        } else {
                            if (result) {
                                res.render(__dirname + "/views/user_open.ejs", {
                                    Name: name,
                                    email: email,
                                    books: books,
                                });
                            } else {
                                res.render(__dirname + "/views/login.ejs", {
                                    response: "Invalid Credentials. Try Again.",
                                });
                            }
                        }
                    });
                } else {
                    res.render(__dirname + "/views/login.ejs", {
                        response: "User does not exist.",
                    });
                }
            }
        });
    } catch (err) {
        console.error("Error: ", err.message);
        res.redirect("/");
    }}
    else{
        try{
            db.query("SELECT * FROM users WHERE email='Admin@iitdh.ac.in'",function(err,result){
                if(err)
                console.error("Error: ",err);
                else{
                    const pass=result[0].password;
                    name = result[0].fName;
                    bcrypt.compare(password, pass, (err, result) => {
                        if (err) {
                            console.error("Error: ", err);
                        } else {
                            if (result) {
                                res.render(__dirname + "/views/admin_open.ejs", {
                                    Name: name,
                                    books: books,
                                });
                            } else {
                                res.render(__dirname + "/views/login.ejs", {
                                    response: "Invalid Credentials. Try Again.",
                                });
                            }
                        }
                    });
                }
            });
        }
        catch(err){
        console.error("Error: ",err);}
    }
});

//Sign-up a new user
app.post("/signup", async (req, res) => {
    const fName = req.body.fname;
    const lName = req.body.lname;
    const username = req.body.mail;
    const password = req.body.pswd;
    const Branch = req.body.branch_name;
    try {
        db.query("SELECT * FROM users WHERE email=?", [username], function (err, result) {
            if (err) {
                console.error("Error: ", err);
            } else {
                if (result.length > 0) {
                    res.render(__dirname + "/views/signup.ejs", {
                        alert: "User already exists. Try logging in.",
                    });
                } else {
                    bcrypt.hash(password, saltRounds, async (err, hash) => {
                        if (err) {
                            console.error("Error: ", err.message);
                        } else {
                            try {
                                db.execute("INSERT INTO users(fName, lName, email, password, Branch) VALUES (?, ?, ?, ?, ?)", [fName, lName, username, hash, Branch]);
                                name = fName;
                                email = username;
                                const email1=email.slice(0,email.indexOf('@'));
                                const sql=`CREATE TABLE ${email1} (id SERIAL NOT NULL, title TEXT, author TEXT, genre TEXT, department TEXT, vendor TEXT, publisher TEXT, borrowed_date DATETIME, returned_date DATETIME)`;
                                db.execute(sql);
                                res.render(__dirname + "/views/user_open.ejs", {
                                    Name: fName,
                                    email: email,
                                    books: books,
                                });
                            } catch (err) {
                                console.error("Error: ", err);
                            }
                        }
                    });
                }
            }
        });
    } catch (err) {
        console.error("Error: ", err);
    }
});

//Render search.ejs file
app.get("/search", (req, res) => {
    res.render(__dirname + "/views/search.ejs", {
        books: books,
    });
});

//Render user_open.ejs file
app.get("/user_open", (req, res) => {
    res.render(__dirname + "/views/user_open.ejs", {
        Name: name,
        email: email,
        books: books,
    });
});

//Render cs.ejs file
app.get("/cs", (req, res) => {
    db.query("SELECT * FROM `TABLE 1` WHERE department='Computer Science'", function (err, result) {
        if (err) {
            console.error("Error: ", err);
        } else {
            for (let i = 0; i < result.length; i++) {
                cs_all_books.push(result[i]);
            }
            res.render(__dirname + "/views/cs.ejs", {
                cs_all: cs_all_books,
                Name: name, 
                email: email,
            });
            cs_all_books = []; 
        }
    });
});

//Render me.ejs file
app.get("/me", (req, res) => {
    db.query("SELECT * FROM `TABLE 1` WHERE department='Mechanical Engineering'", function (err, result) {
        if (err) {
            console.error("Error: ", err);
        } else {
            for (let i = 0; i < result.length; i++) {
                me_all_books.push(result[i]);
            }
            res.render(__dirname + "/views/me.ejs", {
                me_all: me_all_books,
                Name: name,
                email: email, 
            });
            me_all_books = []; 
        }
    });
});

//Render ee.ejs file
app.get("/ee", (req, res) => {
    db.query("SELECT * FROM `TABLE 1` WHERE department='Electrical Engineering'", function (err, result) {
        if (err) {
            console.error("Error: ", err);
        } else {
            for (let i = 0; i < result.length; i++) {
                ee_all_books.push(result[i]);
            }
            res.render(__dirname + "/views/ee.ejs", {
                ee_all: ee_all_books,
                Name: name,
                email: email, 
            });
            ee_all_books = []; 
        }
    });
});

//Render ce.ejs file
app.get("/ce", (req, res) => {
    db.query("SELECT * FROM `TABLE 1` WHERE department='Civil Engineering'", function (err, result) {
        if (err) {
            console.error("Error: ", err);
        } else {
            for (let i = 0; i < result.length; i++) {
                ce_all_books.push(result[i]);
            }
            res.render(__dirname + "/views/ce.ejs", {
                ce_all: ce_all_books,
                Name: name, 
                email: email,
            });
            ce_all_books = []; 
        }
    });
});

//Render ch.ejs file
app.get("/ch", (req, res) => {
    db.query("SELECT * FROM `TABLE 1` WHERE department='Chemical Engineering'", function (err, result) {
        if (err) {
            console.error("Error: ", err);
        } else {
            for (let i = 0; i < result.length; i++) {
                ch_all_books.push(result[i]);
            }
            res.render(__dirname + "/views/ch.ejs", {
                ch_all: ch_all_books,
                Name: name,
                email: email, 
            });
            ch_all_books = []; 
        }
    });
});

//Render ep.ejs file
app.get("/ep", (req, res) => {
    db.query("SELECT * FROM `TABLE 1` WHERE department='Engineering Physics'", function (err, result) {
        if (err) {
            console.error("Error: ", err);
        } else {
            for (let i = 0; i < result.length; i++) {
                ep_all_books.push(result[i]);
            }
            res.render(__dirname + "/views/ep.ejs", {
                ep_all: ep_all_books,
                Name: name, 
                email: email,
            });
            ep_all_books = []; 
        }
    });
});

//Render page.ejs file
app.post("/page",(req,res)=>{
  const book_name=req.body.book_name;
  try
  {
      db.query("SELECT * FROM `TABLE 1` WHERE title=?",[book_name],function(err,result){
          if(err){
              console.error("Error: ",err);
          }
          else{
              if(result.length>0){
              const details=result[0];
              res.render(__dirname+"/views/page.ejs",{
                  Name: name,
                  email: email,
                  title: details.title,
                  author: details.author,
                  description: details.description,
                  genre: details.genre,
                  department: details.department,
                  count: details.count,
                  vendor: details.vendor,
                  vendor_id: details.vendor_id,
                  publisher: details.publisher,
                  publisher_id: details.publisher_id,
                  photo_link: details.photo_link
          });}
          else{
              console.log("Book does not exist");
          }
      }
      });
  }
  catch(err){
      console.error("Error: ",err);
  }
});

app.post("/page1",(req,res)=>{
    const title = req.body.title;
    const button = req.body.button;
    if(button==='borrow'){
        try{
            db.query("UPDATE `TABLE 1` SET count = count-1 WHERE title=?",[title],function(err,result){
                if(err)
                console.log("Error updating count");
                else{
                    try{
                        db.query("SELECT * FROM `TABLE 1` WHERE title=?",[title],function(err,result){
                            if(err)
                            console.error("Error: ",err);
                            else{
                                if(result.length>0){
                                    const details=result[0];
                                    const email1=email.slice(0,email.indexOf('@'));
                                    const date=new Date();
                                    const sql = `INSERT INTO ${email1} (title, author, genre, department, vendor, publisher, borrowed_date) VALUES(?, ?, ?, ?, ?, ?, ?)`
                                    db.execute(sql,[details.title,details.author,details.genre,details.department,details.vendor,details.publisher,date]);
                                    let r_time=new Date(date.getTime());
                                    r_time.setDate(r_time.getDate()+14);
                                    res.render(__dirname+"/views/borrowed.ejs",{
                                        Name: name,
                                        email: email,
                                        title: title,
                                        r_time: r_time
                                    });
                                }
                            }
                        });
                    }
                    catch(err)
                    {
                        console.error("Error: ",err);
                    }
                }
            });
        }
        catch(err)
        {
            console.err("Error: ",err);
        }
    }
});


//Render news.ejs file
app.get("/news_archive",(req,res)=>{
    res.render(__dirname+"/views/news.ejs",{
        Name: name,
        email: email,
    });
})

//Render suggest_new_books.ejs file
app.get("/suggest_new",(req,res)=>{
    res.render(__dirname+"/views/suggest_new_books.ejs",{
        Name: name,
        email: email,
    });
});

//Enter the suggestions to the database
app.post("/suggested",(req,res)=>{
    const name = req.body.Name;
    const email = req.body.Email;
    const title = req.body.title;
    const author = req.body.author;
    const vendor = req.body.vendor;
    const publisher = req.body.publisher;
    const department = req.body.department;
    try{
        db.execute("INSERT INTO suggestion(name, email, title, author, vendor, publisher, department) VALUES (?,?,?,?,?,?,?)",[name,email,title,author,vendor,publisher,department]);
        res.redirect("/user_open");
    }
    catch(err)
    {
        console.error("Error: ",err);
    }
});

//Render terms_and_conditions.ejs file
app.get("/terms_and_conditions",(req,res)=>{
  res.render(__dirname+"/views/terms_and_conditions.ejs");
});

//Render privacy_policy.ejs file
app.get("/privacy_policy",(req,res)=>{
  res.render(__dirname+"/views/privacy_policy.ejs");
});

//Render contact.ejs file
app.get("/contact",(req,res)=>{
  res.render(__dirname+"/views/contact.ejs");
});

//Render DOMinators_club.ejs file
app.get("/club",(req,res)=>{
    res.render(__dirname+"/views/DOMinators_club.ejs");
});

//Render sitemap.ejs file
app.get("/sitemap",(req,res)=>{
    res.render(__dirname+"/views/sitemap.ejs");
});

//Render code_of_conduct.ejs file
app.get("/coc",(req,res)=>{
    res.render(__dirname+"/views/code_of_conduct.ejs");
});

//Render about.ejs file
app.get("/about",(req,res)=>{
    res.render(__dirname+"/views/about.ejs");
});

//Send branding.html file
app.get("/branding",(req,res)=>{
    res.sendFile(__dirname+"/views/branding.html");
});

//Render Disclaimer.ejs file
app.get("/disclaimer",(req,res)=>{
    res.render(__dirname+"/views/Disclaimer.ejs");
});

//Listen to which port the server is running on
app.listen(port,()=>{
  console.log(`Server is running on port ${port}.`)
});