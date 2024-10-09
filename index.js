//Importing Libraries
import express, { response } from "express";
import bodyParser from "body-parser";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import mysql from "mysql2";
import bcrypt from "bcrypt";
import ExcelJS from "exceljs";
import nodemailer from "nodemailer";
import cron from "cron";

const app = express(); //Initialize Express.js
const port = 3000; //Set Port
const saltRounds = 10;

//Establish connection to MySQL database
const db = mysql.createConnection({
    host: "sql12.freesqldatabase.com",
    user: "sql12736584",
    database: "sql12736584",
    password: "UJWjUphMiu",
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
var r_email="";
var code=-1;
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
                    bcrypt.compare(password, pass, async (err, result) => {
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
                    email = result[0].email;
                    bcrypt.compare(password, pass, (err, result) => {
                        if (err) {
                            console.error("Error: ", err);
                        } else {
                            if (result) {
                                res.render(__dirname + "/views/admin_open.ejs", {
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
                }
            });
        }
        catch(err){
        console.error("Error: ",err);}
    }
});

app.get("/forgot_password",(req,res)=>{
    res.render(__dirname+"/views/forgot_password.ejs");
});

app.post("/reset_password",async (req,res)=>{
    r_email = req.body.email;
    const result = await new Promise((resolve,reject)=>{
        db.query(`SELECT * FROM users WHERE email = ?`,[r_email],(err,result)=>{
            if(err){
                return reject(err);
            }
            resolve(result);
        });
    });
    if(result.length > 0){
    code = Math.floor(Math.random()*10000);
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'thedominators4444@gmail.com',
            pass: 'mlja cufb bgtt zkiq'
        }
    });
    let mailOptions = {
        from: '"The DOMinators" <thedominators4444@gmail.com>',
        to: r_email,
        subject: "Reset Password",
        html: `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Document</title>
        </head>
        <body>
            <div style="display: flex; justify-content: center;">
                <img src="https://election.iitdh.ac.in/static/media/logog.084b1a7a95f4bcd9fccd.png" width="150px" alt="Logo">
                <h4 style="color: #89288f; font-size: xx-large;">Reset Password</h4>
            </div>
            <div style="text-align: center;">
                <p style="font-size: x-large;">Secret Code</p>
                <p style="font-size: x-large;">${code}</p>
            </div>
        </body>
        </html>`,
    };
    transporter.sendMail(mailOptions,(error, info)=>{
        if(error){
            return console.log(error);
        }
        res.render(__dirname+"/views/code.ejs");
    });}
    else{
        res.render(__dirname+"/views/forgot_password.ejs",{
            response: "User does not exist.",
        });
    }
});

app.post("/code",(req,res)=>{
    const in_code=req.body.code;
    if(in_code==code && in_code>=0){
        res.sendFile(__dirname+"/views/reset.html");
    }
    else{
        res.render(__dirname+"/views/code.ejs",{
            response: "Incorrect Code",
        });
    }
});

app.post("/reset",(req,res)=>{
    const new_pass = req.body.Password;
    bcrypt.hash(new_pass,saltRounds,async (err,hash)=>{
        if(err){
            console.error("Error: ",err);
        }
        else{
            try{
                db.query('UPDATE users SET password = ? WHERE email = ?',[hash,r_email],function(err,result){
                    if(err){
                        console.error("Error: ",err);
                    }
                    else{
                        res.redirect("/");
                    }
                });
            }
            catch(err){
                console.error("Error: ",err);
            }
        }
    });
});

//Sign-up a new user
app.post("/signup", async (req, res) => {
    const fName = req.body.fname;
    const lName = req.body.lname;
    const username = req.body.mail;
    const password = req.body.pswd;
    const Branch = req.body.branch_name;
    const check = username.slice(username.indexOf('@')+1);
    if(check!=='iitdh.ac.in'){
        res.render(__dirname+"/views/signup.ejs",{
            access: "Access Denied",
        });
    }
    else{
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
                                const sql=`CREATE TABLE ${email1} (id SERIAL NOT NULL, title TEXT, author TEXT, genre TEXT, department TEXT, vendor TEXT, publisher TEXT, borrowed_date DATETIME, returned_date DATETIME, queue_pos INT)`;
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
    }}
});

//Render search.ejs file
app.get("/search", (req, res) => {
    res.render(__dirname + "/views/search.ejs", {
        books: books,
    });
});

//Render user_open.ejs file
app.get("/user_open", async (req, res) => {
    if(name!=="" && email!==""){
    if (res) {
    }
    res.render(__dirname + "/views/user_open.ejs", {
        Name: name,
        email: email,
        books: books,
    });}
    else{
        res.redirect("/");
    }
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
                  photo_link: details.photo_link,
                  queue: details.queue
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
    else{
        try{
            db.query("UPDATE `TABLE 1` SET queue = queue+1 WHERE title=?",[title],function(err,result){
                if(err)
                console.error("Error: ",err);
                else{
                    try{
                        db.query("SELECT * FROM `TABLE 1` WHERE title=?",[title],function(err,result){
                            if(err)
                            console.error("Error: ",err);
                            if(result.length>0){
                            const details = result[0];
                            const email1=email.slice(0,email.indexOf('@'));
                            const date=new Date();
                            const sql = `INSERT INTO ${email1} (title, author, genre, department, vendor, publisher, queue_pos) VALUES(?, ?, ?, ?, ?, ?, ?)`
                            db.execute(sql,[details.title,details.author,details.genre,details.department,details.vendor,details.publisher,details.queue]);
                            res.render(__dirname+"/views/inqueue.ejs",{
                                Name: name,
                                email: email,
                                title: title,
                                queue_pos: details.queue
                            });
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
        catch(err){
            console.error("Error: ",err);
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

app.get("/order", async (req, res) => {
    var ans = [];
    const email1 = email.slice(0, email.indexOf("@"));

    try {
        const sql1 = `SELECT title, borrowed_date FROM ${email1} WHERE (returned_date IS NULL AND (queue_pos IS NULL OR queue_pos = 0))`;
        const result1 = await new Promise((resolve, reject) => {
            db.query(sql1, (err, result) => {
                if (err) {
                    return reject(err);
                }
                resolve(result);
            });
        });

        for (let i = 0; i < result1.length; i++) {
            const title_now = result1[i].title;
            const borrow_now = result1[i].borrowed_date;
            var ans1 = [];

            const result2 = await new Promise((resolve, reject) => {
                db.query("SELECT * FROM `TABLE 1` WHERE title = ?", [title_now], (err, results) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(results);
                });
            });

            if (result2.length > 0) {
                ans1.push(result2[0].title);
                ans1.push(result2[0].photo_link);
                ans1.push(result2[0].author);
                ans1.push(result2[0].department);
                ans1.push(result2[0].genre);
                ans1.push(result2[0].vendor);
                ans1.push(result2[0].publisher);
                ans1.push(borrow_now);
                ans1.push(result2[0].queue);
            }
            ans.push(ans1);
        }

        const sql2 = `SELECT title, queue_pos FROM ${email1} WHERE borrowed_date IS NULL`;
        const result3 = await new Promise((resolve, reject) => {
            db.query(sql2, (err, result) => {
                if (err) {
                    return reject(err);
                }
                resolve(result);
            });
        });

        for (let i = 0; i < result3.length; i++) {
            const title_now = result3[i].title;
            const queue_pos = result3[i].queue_pos;
            var ans1 = [];

            const result4 = await new Promise((resolve, reject) => {
                db.query("SELECT * FROM `TABLE 1` WHERE title = ?", [title_now], (err, results) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(results);
                });
            });

            if (result4.length > 0) {
                ans1.push(result4[0].title);
                ans1.push(result4[0].photo_link);
                ans1.push(result4[0].author);
                ans1.push(result4[0].department);
                ans1.push(result4[0].genre);
                ans1.push(result4[0].vendor);
                ans1.push(result4[0].publisher);
                ans1.push(0);
                ans1.push(queue_pos);
            }
            ans.push(ans1);
        }
        res.render(__dirname + "/views/order.ejs", {
            Name: name,
            orders: ans,
            email: email
        });
    } catch (err) {
        console.error("Error: ", err);
        res.status(500).send("Internal Server Error");
    }
});

app.post("/return",async (req,res)=>{
    const title=req.body.title;
    const email1=email.slice(0,email.indexOf('@'));
    const date=new Date();
    try{
        const sql1 = `UPDATE ${email1} SET returned_date = ? WHERE (title = ? AND (queue_pos IS NULL OR queue_pos = 0) AND returned_date IS NULL)`
        db.execute(sql1,[date,title]);
        const result1 = await new Promise((resolve,reject)=>{
            db.query("SELECT * FROM `TABLE 1` WHERE title=?",[title],(err,result)=>{
                if(err){
                    return reject(err);
                }
                resolve(result);
            });
        });
        if(result1[0].queue==0){
            var c_date = new Date();
            db.execute(`INSERT INTO ${email1} (title, author, genre, department, vendor, publisher, borrowed_date) VALUES(?, ?, ?, ?, ?, ?, ?)`,[result1[0].title,result1[0].author,result1[0].genre,result1[0].department,result1[0].vendor,result1[0].publisher,c_date]);
            res.redirect("/order");
    }
        else{
            await new Promise((resolve,reject)=>{
                db.query("UPDATE `TABLE 1` SET queue=queue-1 WHERE title=? AND queue <> 0",[title],(err,result)=>{
                    if(err){
                        return reject(err);
                    }
                    resolve(result);
                });
            });
            const result2 = await new Promise((resolve,reject)=>{
                db.query("SELECT email FROM users",(err,result)=>{
                    if(err){
                        return reject(err);
                    }
                    resolve(result);
                });
            });
            for(var i=0;i<result2.length;i++){
                const email1 = result2[i].email.slice(0,result2[i].email.indexOf('@'));
                const date=new Date();
                const sql1 = `UPDATE ${email1} SET borrowed_date=?, queue_pos=0 WHERE title=? AND queue_pos=1`
                await new Promise((resolve,reject)=>{
                    db.query(sql1,[date,title],(err,result)=>{
                        if(err){
                            return reject(err);
                        }
                        resolve(result);
                    });
                });
                const sql = `UPDATE ${email1} SET queue_pos=queue_pos-1 WHERE title = ? AND queue_pos > 1`
                await new Promise((resolve,reject)=>{
                    db.query(sql,[title],(err,result)=>{
                        if(err){
                            return reject(err);
                        }
                        resolve(result);
                    });
                });
            }
            res.redirect("/order");
        }
    }
    catch(err){
        console.error("Error: ",err)
    }
});

app.post("/admin_return",async (req,res)=>{
    const title=req.body.title;
    const email_use = req.body.email
    const email1=email_use.slice(0,email_use.indexOf('@'));
    const date=new Date();
    try{
        const sql1 = `UPDATE ${email1} SET returned_date = ? WHERE (title = ? AND (queue_pos IS NULL OR queue_pos = 0) AND returned_date IS NULL)`
        db.execute(sql1,[date,title]);
        const result1 = await new Promise((resolve,reject)=>{
            db.query("SELECT queue FROM `TABLE 1` WHERE title=?",[title],(err,result)=>{
                if(err){
                    return reject(err);
                }
                resolve(result);
            });
        });
        if(result1[0].queue==0){
        db.query("UPDATE `TABLE 1` SET count = count+1 WHERE title=?",[title],function(err,result){
            if(err)
            console.error("Error: ",err);
            else{
                res.redirect("/users_admin");
            }
        });}
        else{
            await new Promise((resolve,reject)=>{
                db.query("UPDATE `TABLE 1` SET queue=queue-1 WHERE title=? AND queue <> 0",[title],(err,result)=>{
                    if(err){
                        return reject(err);
                    }
                    resolve(result);
                });
            });
            const result2 = await new Promise((resolve,reject)=>{
                db.query("SELECT email FROM users",(err,result)=>{
                    if(err){
                        return reject(err);
                    }
                    resolve(result);
                });
            });
            for(var i=0;i<result2.length;i++){
                const email1 = result2[i].email.slice(0,result2[i].email.indexOf('@'));
                const date=new Date();
                const sql1 = `UPDATE ${email1} SET borrowed_date=?, queue_pos=0 WHERE title=? AND queue_pos=1`
                await new Promise((resolve,reject)=>{
                    db.query(sql1,[date,title],(err,result)=>{
                        if(err){
                            return reject(err);
                        }
                        resolve(result);
                    });
                });
                const sql = `UPDATE ${email1} SET queue_pos=queue_pos-1 WHERE title = ? AND queue_pos > 1`
                await new Promise((resolve,reject)=>{
                    db.query(sql,[title],(err,result)=>{
                        if(err){
                            return reject(err);
                        }
                        resolve(result);
                    });
                });
            }
            res.redirect("/users_admin");
        }
    }
    catch(err){
        console.error("Error: ",err)
    }
})

app.get("/profile",async (req,res)=>{
    const email1=email.slice(0,email.indexOf('@'));
    const sql=`SELECT * FROM ${email1}`;
    const result = await new Promise((resolve,reject)=>{
        db.query(sql,(err,result)=>{
            if(err){
                return reject(err);
            }
            resolve(result);
        });
    });
    const result1 = await new Promise((resolve,reject)=>{
        db.query("SELECT * FROM users WHERE fName = ?",[name],(err,result)=>{
            if(err){
                return reject(err);
            }
            resolve(result);
        });
    });
    if(result.length>0){
        var details=[];
        for(var i=0;i<result.length;i++){
            const title = result[i].title;
            const photo_link = await new Promise((resolve,reject)=>{
                db.query("SELECT photo_link, queue FROM `TABLE 1` WHERE title=?",[title],(err,result)=>{
                    if(err){
                        return reject(err);
                    }
                    resolve(result);
                });
            });
            details.push(photo_link[0].photo_link);
            details.push(photo_link[0].queue);
        }
        res.render(__dirname+"/views/profile.ejs",{
            FName: result1[0].fName,
            Name: name,
            LName: result1[0].lName,
            email: email,
            branch: result1[0].Branch,
            history: result,
            photos: details
        });
    }
    else{
        res.render(__dirname+"/views/profile.ejs",{
            FName: result1[0].fName,
            Name: name,
            LName: result1[0].lName,
            email: email,
            branch: result1[0].Branch
        });
    }
});

app.get("/logout",(req,res)=>{
    name="";
    email="";
    res.render(__dirname+"/views/open.ejs");
});

let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'thedominators4444@gmail.com',
        pass: 'mlja cufb bgtt zkiq'
    }
});
const sendEmail = (to,subject,book,date)=>{let mailOptions = {
    from: '"The DOMinators" <thedominators4444@gmail.com>',
    to: to,
    subject: subject,
    html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html dir="ltr" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en" style="padding:0;Margin:0">
     <head>
      <meta charset="UTF-8">
      <meta content="width=device-width, initial-scale=1" name="viewport">
      <meta name="x-apple-disable-message-reformatting">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta content="telephone=no" name="format-detection">
      <title>New email template 2024-07-03</title><!--[if (mso 16)]>
        <style type="text/css">
        a {text-decoration: none;}
        </style>
        <![endif]--><!--[if gte mso 9]><style>sup { font-size: 100% !important; }</style><![endif]--><!--[if gte mso 9]>
    <xml>
        <o:OfficeDocumentSettings>
        <o:AllowPNG></o:AllowPNG>
        <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentSettings>
    </xml>
    <![endif]--><!--[if !mso]><!-- -->
      <link href="https://fonts.googleapis.com/css?family=Roboto:400,400i,700,700i" rel="stylesheet"><!--<![endif]-->
      <style type="text/css">
    #form1 .radio-selector [option][selected] {
        background-color:#f09870;
        color:#ffffff;
    }
    .amp-form-submit-success .hidden-block {
        display:none;
    }
    .amp-carousel-button-next {
        right:0;
        outline:0;
    }
    .amp-carousel-button-prev {
        left:0;
        outline:0;
    }
    #outlook a {
        padding:0;
    }
    .ExternalClass {
        width:100%;
    }
    .ExternalClass,
    .ExternalClass p,
    .ExternalClass span,
    .ExternalClass font,
    .ExternalClass td,
    .ExternalClass div {
        line-height:100%;
    }
    .es-button {
        mso-style-priority:100!important;
        text-decoration:none!important;
    }
    a[x-apple-data-detectors] {
        color:inherit!important;
        text-decoration:none!important;
        font-size:inherit!important;
        font-family:inherit!important;
        font-weight:inherit!important;
        line-height:inherit!important;
    }
    .es-desk-hidden {
        display:none;
        float:left;
        overflow:hidden;
        width:0;
        max-height:0;
        line-height:0;
        mso-hide:all;
    }
    @media only screen and (max-width:600px) {p, ul li, ol li, a { line-height:150%!important } h1, h2, h3, h1 a, h2 a, h3 a { line-height:120%!important } h1 { font-size:30px!important; text-align:left } h2 { font-size:26px!important; text-align:left } h3 { font-size:20px!important; text-align:left } h1 a { text-align:left } .es-header-body h1 a, .es-content-body h1 a, .es-footer-body h1 a { font-size:30px!important } h2 a { text-align:left } .es-header-body h2 a, .es-content-body h2 a, .es-footer-body h2 a { font-size:26px!important } h3 a { text-align:left } .es-header-body h3 a, .es-content-body h3 a, .es-footer-body h3 a { font-size:20px!important } .time-button li span { display:inline-block; background:rgb(244, 244, 244); color:rgb(15, 15, 15); font-size:16px; font-weight:bold; padding:9px 16px 9px 16px; border-radius:5px; cursor:pointer } .es-menu td a { font-size:10px!important } .es-header-body p, .es-header-body ul li, .es-header-body ol li, .es-header-body a { font-size:13px!important } .es-content-body p, .es-content-body ul li, .es-content-body ol li, .es-content-body a { font-size:13px!important } .es-footer-body p, .es-footer-body ul li, .es-footer-body ol li, .es-footer-body a { font-size:12px!important } .es-infoblock p, .es-infoblock ul li, .es-infoblock ol li, .es-infoblock a { font-size:11px!important } *[class="gmail-fix"] { display:none!important } .es-m-txt-c, .es-m-txt-c h1, .es-m-txt-c h2, .es-m-txt-c h3 { text-align:center!important } .es-m-txt-r, .es-m-txt-r h1, .es-m-txt-r h2, .es-m-txt-r h3 { text-align:right!important } .es-m-txt-l, .es-m-txt-l h1, .es-m-txt-l h2, .es-m-txt-l h3 { text-align:left!important } .es-m-txt-r img, .es-m-txt-c img, .es-m-txt-l img { display:inline!important } .es-button-border { display:inline-block!important } a.es-button, button.es-button { font-size:14px!important; display:inline-block!important } .es-btn-fw { border-width:10px 0px!important; text-align:center!important } .es-adaptive table, .es-btn-fw, .es-btn-fw-brdr, .es-left, .es-right { width:100%!important } .es-content table, .es-header table, .es-footer table, .es-content, .es-footer, .es-header { width:100%!important; max-width:600px!important } .es-adapt-td { display:block!important; width:100%!important } .adapt-img { width:100%!important; height:auto!important } .es-m-p0 { padding:0px!important } .es-m-p0r { padding-right:0px!important } .es-m-p0l { padding-left:0px!important } .es-m-p0t { padding-top:0px!important } .es-m-p0b { padding-bottom:0!important } .es-m-p20b { padding-bottom:20px!important } .es-mobile-hidden, .es-hidden { display:none!important } tr.es-desk-hidden, td.es-desk-hidden, table.es-desk-hidden { width:auto!important; overflow:visible!important; float:none!important; max-height:inherit!important; line-height:inherit!important } tr.es-desk-hidden { display:table-row!important } table.es-desk-hidden { display:table!important } td.es-desk-menu-hidden { display:table-cell!important } table.es-table-not-adapt, .esd-block-html table { width:auto!important } table.es-social { display:inline-block!important } table.es-social td { display:inline-block!important } .es-desk-hidden { display:table-row!important; width:auto!important; overflow:visible!important; max-height:inherit!important } }
    @media only screen and (max-width:9999px) {.time-button span.active { background:rgb(186, 232, 232)!important; color:rgb(39, 38, 67) } .time-button span:hover { background:rgb(186, 232, 232)!important; color:rgb(39, 38, 67) } }
    @media screen and (max-width:384px) {.mail-message-content { width:414px!important } }
    </style>
     </head>
     <body style="width:100%;font-family:roboto, 'helvetica neue', helvetica, arial, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0">
      <div dir="ltr" class="es-wrapper-color" lang="en" style="background-color:#F4F6F7"><!--[if gte mso 9]>
                <v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t">
                    <v:fill type="tile" color="#f4f6f7"></v:fill>
                </v:background>
            <![endif]-->
       <table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top;background-color:#F4F6F7">
         <tr style="border-collapse:collapse">
          <td valign="top" style="padding:0;Margin:0">
           <table cellpadding="0" cellspacing="0" class="es-content" align="center" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%">
             <tr style="border-collapse:collapse">
              <td align="center" style="padding:0;Margin:0">
               <table bgcolor="#ffffff" class="es-header-body" align="center" cellpadding="0" cellspacing="0" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:600px">
                 <tr style="border-collapse:collapse">
                  <td align="left" style="padding:0;Margin:0;padding-top:10px;padding-left:20px;padding-right:20px">
                   <table cellpadding="0" cellspacing="0" width="100%" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                     <tr style="border-collapse:collapse">
                      <td align="center" valign="top" style="padding:0;Margin:0;width:560px">
                       <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                         <tr style="border-collapse:collapse">
                          <td style="padding:0;Margin:0">
                           <table cellpadding="0" cellspacing="0" width="100%" class="es-menu" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                             <tr class="links" style="border-collapse:collapse">
                              <td align="center" valign="top" width="100%" style="Margin:0;padding-left:5px;padding-right:5px;padding-top:10px;padding-bottom:10px;border:0"><a target="_blank" href="https://iitdh.ac.in" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:none;display:block;font-family:'times new roman', times, baskerville, georgia, serif;color:#333333;font-size:16px">WEB SITE</a></td>
                             </tr>
                           </table></td>
                         </tr>
                       </table></td>
                     </tr>
                   </table></td>
                 </tr>
                 <tr style="border-collapse:collapse">
                  <td align="left" style="padding:0;Margin:0">
                   <table cellpadding="0" cellspacing="0" width="100%" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                     <tr style="border-collapse:collapse">
                      <td align="center" valign="top" style="padding:0;Margin:0;width:600px">
                       <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                         <tr style="border-collapse:collapse">
                          <td align="center" style="padding:0;Margin:0;padding-top:5px;padding-bottom:5px;font-size:0">
                           <table border="0" width="95%" height="100%" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                             <tr style="border-collapse:collapse">
                              <td style="padding:0;Margin:0;border-bottom:1px solid #cccccc;background:none;height:1px;width:100%;margin:0px"></td>
                             </tr>
                           </table></td>
                         </tr>
                       </table></td>
                     </tr>
                   </table></td>
                 </tr>
                 <tr style="border-collapse:collapse">
                  <td align="left" style="Margin:0;padding-top:10px;padding-bottom:10px;padding-left:20px;padding-right:20px">
                   <table cellpadding="0" cellspacing="0" width="100%" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                     <tr style="border-collapse:collapse">
                      <td align="center" valign="top" style="padding:0;Margin:0;width:560px">
                       <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                         <tr style="border-collapse:collapse">
                          <td align="center" style="padding:0;Margin:0;font-size:0px"><img src="https://election.iitdh.ac.in/static/media/logog.084b1a7a95f4bcd9fccd.png" alt style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic" width="160"></td>
                         </tr>
                       </table></td>
                     </tr>
                   </table></td>
                 </tr>
                 <tr style="border-collapse:collapse">
                  <td align="left" style="padding:0;Margin:0">
                   <table cellpadding="0" cellspacing="0" width="100%" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                     <tr style="border-collapse:collapse">
                      <td align="center" valign="top" style="padding:0;Margin:0;width:600px">
                       <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                         <tr style="border-collapse:collapse">
                          <td align="center" style="padding:0;Margin:0;padding-top:5px;padding-bottom:5px;font-size:0">
                           <table border="0" width="95%" height="100%" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                             <tr style="border-collapse:collapse">
                              <td style="padding:0;Margin:0;border-bottom:1px solid #cccccc;background:none;height:1px;width:100%;margin:0px"></td>
                             </tr>
                           </table></td>
                         </tr>
                       </table></td>
                     </tr>
                   </table></td>
                 </tr>
               </table></td>
             </tr>
           </table>
           <table cellpadding="0" cellspacing="0" class="es-content" align="center" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%">
             <tr style="border-collapse:collapse">
              <td align="center" style="padding:0;Margin:0">
               <table bgcolor="#ffffff" class="es-content-body" align="center" cellpadding="0" cellspacing="0" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:600px">
                 <tr style="border-collapse:collapse">
                  <td align="left" style="Margin:0;padding-top:20px;padding-bottom:20px;padding-left:20px;padding-right:20px">
                   <table cellpadding="0" cellspacing="0" width="100%" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                     <tr style="border-collapse:collapse">
                      <td align="center" valign="top" style="padding:0;Margin:0;width:560px">
                       <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                         <tr style="border-collapse:collapse">
                          <td align="center" style="padding:0;Margin:0;padding-bottom:10px;font-size:0"><img src="https://eixdmcb.stripocdn.email/content/guids/CABINET_23b09dc352206b9a3436692531aaf1f2/images/48401577371549314.png" alt style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic" width="41"></td>
                         </tr>
                         <tr style="border-collapse:collapse">
                          <td align="center" class="es-m-txt-c" style="padding:0;Margin:0"><h2 style="Margin:0;line-height:26px;mso-line-height-rule:exactly;font-family:'times new roman', times, baskerville, georgia, serif;font-size:22px;font-style:normal;font-weight:bold;color:#333333">Reminder to Return</h2></td>
                         </tr>
                       </table></td>
                     </tr>
                     <tr style="border-collapse:collapse">
                      <td align="center" valign="top" style="padding:0;Margin:0;width:560px">
                       <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                         <tr style="border-collapse:collapse">
                          <td align="center" style="padding:0;Margin:0;padding-top:5px"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:roboto, 'helvetica neue', helvetica, arial, sans-serif;line-height:24px;color:#333333;font-size:16px">Remember to return&nbsp;</p></td>
                         </tr>
                       </table></td>
                     </tr>
                     <tr style="border-collapse:collapse">
                      <td align="center" valign="top" style="padding:0;Margin:0;width:560px">
                       <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                         <tr style="border-collapse:collapse">
                          <td align="center" style="padding:0;Margin:0;padding-top:15px"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:roboto, 'helvetica neue', helvetica, arial, sans-serif;line-height:24px;color:#333333;font-size:16px">Return ${book} before ${date} to avoid any fine.</p></td>
                         </tr>
                       </table></td>
                     </tr>
                   </table></td>
                 </tr>
               </table></td>
             </tr>
           </table>
           <table cellpadding="0" cellspacing="0" class="es-footer" align="center" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;background-repeat:repeat;background-position:center top">
             <tr style="border-collapse:collapse">
              <td align="center" style="padding:0;Margin:0">
               <table bgcolor="#ffffff" class="es-footer-body" align="center" cellpadding="0" cellspacing="0" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FAFAFA;width:600px">
                 <tr style="border-collapse:collapse">
                  <td align="left" style="padding:0;Margin:0">
                   <table cellpadding="0" cellspacing="0" width="100%" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                     <tr style="border-collapse:collapse">
                      <td align="center" valign="top" style="padding:0;Margin:0;width:600px">
                       <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                         <tr style="border-collapse:collapse">
                          <td align="center" style="padding:0;Margin:0;padding-top:5px;padding-bottom:5px;font-size:0">
                           <table border="0" width="95%" height="100%" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                             <tr style="border-collapse:collapse">
                              <td style="padding:0;Margin:0;border-bottom:1px solid #cccccc;background:none;height:1px;width:100%;margin:0px"></td>
                             </tr>
                           </table></td>
                         </tr>
                       </table></td>
                     </tr>
                   </table></td>
                 </tr>
                 <tr style="border-collapse:collapse">
                  <td align="left" style="padding:0;Margin:0;padding-top:5px;padding-left:20px;padding-right:20px">
                   <table cellpadding="0" cellspacing="0" width="100%" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                     <tr style="border-collapse:collapse">
                      <td align="center" valign="top" style="padding:0;Margin:0;width:560px">
                       <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                         <tr style="border-collapse:collapse">
                          <td style="padding:0;Margin:0">
                           <table cellpadding="0" cellspacing="0" width="100%" class="es-menu" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                             <tr class="links" style="border-collapse:collapse">
                              <td align="center" valign="top" width="50%" style="Margin:0;padding-left:5px;padding-right:5px;padding-top:10px;padding-bottom:10px;border:0"><a target="_blank" href="https://iitdh.ac.in" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:none;display:block;font-family:'times new roman', times, baskerville, georgia, serif;color:#333333;font-size:13px">WEB SITE</a></td>
                              <td align="center" valign="top" width="50%" style="Margin:0;padding-left:5px;padding-right:5px;padding-top:10px;padding-bottom:10px;border:0"><a target="_blank" href="mailto:cs23bt009@iitdh.ac.in" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:none;display:block;font-family:'times new roman', times, baskerville, georgia, serif;color:#333333;font-size:13px">CONTACT</a></td>
                             </tr>
                           </table></td>
                         </tr>
                       </table></td>
                     </tr>
                   </table></td>
                 </tr>
               </table></td>
             </tr>
           </table>
           <table cellpadding="0" cellspacing="0" class="es-content" align="center" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%">
             <tr style="border-collapse:collapse">
              <td align="center" style="padding:0;Margin:0">
               <table class="es-content-body" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:600px" cellspacing="0" cellpadding="0" align="center" role="none">
                 <tr style="border-collapse:collapse">
                  <td align="left" style="Margin:0;padding-left:20px;padding-right:20px;padding-top:30px;padding-bottom:30px">
                   <table width="100%" cellspacing="0" cellpadding="0" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                     <tr style="border-collapse:collapse">
                      <td valign="top" align="center" style="padding:0;Margin:0;width:560px">
                       <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                         <tr style="border-collapse:collapse">
                         <td align="center" style="padding:0;Margin:0;padding-top:15px"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:roboto, 'helvetica neue', helvetica, arial, sans-serif;line-height:24px;color:#333333;font-size:16px">Better late than never!</p></td>
                         </tr>
                       </table></td>
                     </tr>
                   </table></td>
                 </tr>
               </table></td>
             </tr>
           </table></td>
         </tr>
       </table>
      </div>
     </body>
    </html>`,
};
transporter.sendMail(mailOptions,(error, info)=>{
    if(error){
        return console.log(error);
    }
    console.log("Message sent");
});
};
const job = new cron.CronJob('0 0 * * *',async ()=>{
    const result1 = await new Promise((resolve,reject)=>{
        db.query("SELECT email FROM users",(err,result)=>{
            if(err){
                return reject(err);
            }
            resolve(result);
        });
    });
    console.log(result1);
    for(var i=0;i<result1.length;i++){
        const email1 = result1[i].email.slice(0,result1[i].email.indexOf('@'));
        const sql =`SELECT title, borrowed_date FROM ${email1} WHERE (borrowed_date IS NOT NULL AND returned_date IS NULL)`
        const result2 = await new Promise((resolve,reject)=>{
            db.query(sql,(err,result)=>{
                if(err){
                    return reject(err);
                }
                resolve(result);
            });
        });
        for(var j=0;j<result2.length;j++){
            const date = new Date();
            let r_date = new Date(result2[j].borrowed_date.getTime());
            r_date.setDate(r_date.getDate()+12);
            let return_date = new Date(result2[j].borrowed_date.getTime());
            return_date.setDate(return_date.getDate()+14)
            if(r_date.getDate()===date.getDate()){
            sendEmail(result1[i].email,"Return Alert",result2[j].title,return_date);}
        }
    }
    var next_date = new Date();
    next_date.setDate(next_date.getDate()+1);
    next_date = next_date.toLocaleDateString();
    next_date = '_' + next_date.slice(0,next_date.indexOf('/'))+'_'+next_date.slice(next_date.indexOf('/')+1,next_date.lastIndexOf('/'))+'_'+next_date.slice(next_date.lastIndexOf('/')+1);
    var prev_date = new Date();
    prev_date.setDate(prev_date.getDate()-1);
    prev_date = prev_date.toLocaleDateString();
    prev_date = '_' + prev_date.slice(0,prev_date.indexOf('/'))+'_'+prev_date.slice(prev_date.indexOf('/')+1,prev_date.lastIndexOf('/'))+'_'+prev_date.slice(prev_date.lastIndexOf('/')+1);
    const sql = `CREATE TABLE ${next_date}(books TEXT, first TEXT, second TEXT, third TEXT, fourth TEXT)`
    db.execute(sql);
    const sql1 = `DROP TABLE IF EXISTS ${prev_date}`
    db.execute(sql1);
},null,true,'IST');
job.start();

app.get("/admin_profile",(req,res)=>{
    if(name=='Admin'){
        res.render(__dirname+"/views/admin_profile.ejs",{
            Name: name,
            books: books,
            email: email,
        });
    }
});

app.get("/suggestions_admin", async (req,res)=>{
   if(name=='Admin'){
    const result = await new Promise((resolve,reject)=>{
        db.query("SELECT * FROM suggestion",(err,result)=>{
            if(err){
                return reject(err);
            }
            resolve(result);
        });
    });
    res.render(__dirname+"/views/suggestions_admin.ejs",{
        Name: name,
        books: books,
        suggestions: result,
    });
   } 
});

app.post("/del_suggestion",async (req,res)=>{
    const user_email = req.body.name;
    const title = req.body.title;
    await new Promise((resolve,reject)=>{
        db.query('DELETE FROM suggestion WHERE email = ? AND title = ?',[user_email,title],(err,result)=>{
            if(err){
                return reject(err);
            }
            resolve(result);
        });
    });
    res.redirect("/suggestions_admin");
});

app.get("/users_admin",async (req,res)=>{
    if(name=='Admin'){
        const result = await new Promise((resolve,reject)=>{
            db.query('SELECT * FROM users',(err,result)=>{
                if(err){
                    return reject(err);
                }
                resolve(result);
            });
        });
        res.render(__dirname+"/views/users_admin.ejs",{
            Name: name,
            books: books,
            users: result,
        });
    }
});

app.post("/update-fName",async (req,res)=>{
    const change = req.body.fName;
    const to_change = req.body.placeholder;
    await new Promise((resolve,reject)=>{
        db.query("UPDATE users SET fName = ? WHERE email = ?",[change,to_change],(err,result)=>{
            if(err){
                return reject(err);
            }
            resolve(result);
        });
    });
    res.redirect("/users_admin");
});

app.post("/update-lName",async (req,res)=>{
    const change = req.body.lName;
    const to_change = req.body.placeholder;
    await new Promise((resolve,reject)=>{
        db.query("UPDATE users SET lName = ? WHERE email = ?",[change,to_change],(err,result)=>{
            if(err){
                return reject(err);
            }
            resolve(result);
        });
    });
    res.redirect("/users_admin");
});

app.post("/update-email",async (req,res)=>{
    const change = req.body.email;
    const to_change = req.body.placeholder;
    await new Promise((resolve,reject)=>{
        db.query("UPDATE users SET email = ? WHERE email = ?",[change,to_change],(err,result)=>{
            if(err){
                return reject(err);
            }
            resolve(result);
        });
    });
    res.redirect("/users_admin");
});

app.post("/update-branch",async (req,res)=>{
    const change = req.body.Branch;
    const to_change = req.body.placeholder;
    await new Promise((resolve,reject)=>{
        db.query("UPDATE users SET Branch = ? WHERE email = ?",[change,to_change],(err,result)=>{
            if(err){
                return reject(err);
            }
            resolve(result);
        });
    });
    res.redirect("/users_admin");
});

app.post("/ind-user",async (req,res)=>{
    const ind_email = req.body.email;
    const email1 = ind_email.slice(0,ind_email.indexOf('@'));
    const sql = `SELECT * FROM ${email1}`;
    const result = await new Promise((resolve,reject)=>{
        db.query(sql,(err,result)=>{
            if(err){
                return reject(err);
            }
            resolve(result);
        });
    });
    res.render(__dirname+"/views/ind_user.ejs",{
        Name: name,
        books: books,
        user_email: ind_email,
        result: result
    });
});

app.get("/admin_open",(req,res)=>{
    if(name=='Admin'){
        res.render(__dirname+"/views/admin_open.ejs",{
            Name: name,
            books: books,
        });
    }
    else{
        res.redirect("/");
    }
});

app.get("/books_admin",async (req,res)=>{
    const result = await new Promise((resolve,reject)=>{
        db.query("SELECT * FROM `TABLE 1`",(err,result)=>{
            if(err){
                return reject(err);
            }
            resolve(result);
        });
    });
    if(name=='Admin'){
    res.render(__dirname+"/views/books_admin.ejs",{
        Name: name,
        details: result,
        books: books
    });}
    else{
        res.redirect("/");
    }
});

app.get("/reservation_admin",async (req,res)=>{
    var prev_date = new Date();
    prev_date.setDate(prev_date.getDate());
    prev_date = prev_date.toLocaleDateString();
    prev_date = '_' + prev_date.slice(0,prev_date.indexOf('/'))+'_'+prev_date.slice(prev_date.indexOf('/')+1,prev_date.lastIndexOf('/'))+'_'+prev_date.slice(prev_date.lastIndexOf('/')+1);
    const result1 = await new Promise((resolve,reject)=>{
        db.query(`SELECT * FROM ${prev_date}`,(err,result)=>{
            if(err){
                return reject(err);
            }
            resolve(result);
        });
    });
    res.render(__dirname+"/views/reservation_admin.ejs",{
        Name: name,
        day1: result1,
    });
});

app.post("/update-title",async (req,res)=>{
    const change = req.body.title;
    const to_change = req.body.placeholder;
    await new Promise((resolve,reject)=>{
        db.query("UPDATE `TABLE 1` SET title = ? WHERE title = ?",[change,to_change],(err,result)=>{
            if(err){
                return reject(err);
            }
            resolve(result);
        });
    });
    res.redirect("/books_admin");
});

app.post("/update-description",async (req,res)=>{
    const change = req.body.description;
    const to_change = req.body.placeholder;
    await new Promise((resolve,reject)=>{
        db.query("UPDATE `TABLE 1` SET description = ? WHERE title = ?",[change,to_change],(err,result)=>{
            if(err){
                return reject(err);
            }
            resolve(result);
        });
    });
    res.redirect("/books_admin");
});

app.post("/update-author",async (req,res)=>{
    const change = req.body.author;
    const to_change = req.body.placeholder;
    await new Promise((resolve,reject)=>{
        db.query("UPDATE `TABLE 1` SET author = ? WHERE title = ?",[change,to_change],(err,result)=>{
            if(err){
                return reject(err);
            }
            resolve(result);
        });
    });
    res.redirect("/books_admin");
});

app.post("/update-genre",async (req,res)=>{
    const change = req.body.genre;
    const to_change = req.body.placeholder;
    await new Promise((resolve,reject)=>{
        db.query("UPDATE `TABLE 1` SET genre = ? WHERE title = ?",[change,to_change],(err,result)=>{
            if(err){
                return reject(err);
            }
            resolve(result);
        });
    });
    res.redirect("/books_admin");
});

app.post("/update-department",async (req,res)=>{
    const change = req.body.department;
    const to_change = req.body.placeholder;
    await new Promise((resolve,reject)=>{
        db.query("UPDATE `TABLE 1` SET department = ? WHERE title = ?",[change,to_change],(err,result)=>{
            if(err){
                return reject(err);
            }
            resolve(result);
        });
    });
    res.redirect("/books_admin");
});

app.post("/update-count",async (req,res)=>{
    const change = req.body.count;
    const to_change = req.body.placeholder;
    await new Promise((resolve,reject)=>{
        db.query("UPDATE `TABLE 1` SET count = ? WHERE title = ?",[change,to_change],(err,result)=>{
            if(err){
                return reject(err);
            }
            resolve(result);
        });
    });
    res.redirect("/books_admin");
});

app.post("/update-vendor",async (req,res)=>{
    const change = req.body.vendor;
    const to_change = req.body.placeholder;
    await new Promise((resolve,reject)=>{
        db.query("UPDATE `TABLE 1` SET vendor = ? WHERE title = ?",[change,to_change],(err,result)=>{
            if(err){
                return reject(err);
            }
            resolve(result);
        });
    });
    res.redirect("/books_admin");
});

app.post("/update-vendor-id",async (req,res)=>{
    const change = req.body.vendor_id;
    const to_change = req.body.placeholder;
    await new Promise((resolve,reject)=>{
        db.query("UPDATE `TABLE 1` SET vendor_id = ? WHERE title = ?",[change,to_change],(err,result)=>{
            if(err){
                return reject(err);
            }
            resolve(result);
        });
    });
    res.redirect("/books_admin");
});

app.post("/update-publisher",async (req,res)=>{
    const change = req.body.publisher;
    const to_change = req.body.placeholder;
    await new Promise((resolve,reject)=>{
        db.query("UPDATE `TABLE 1` SET publisher = ? WHERE title = ?",[change,to_change],(err,result)=>{
            if(err){
                return reject(err);
            }
            resolve(result);
        });
    });
    res.redirect("/books_admin");
});

app.post("/update-publisher-id",async (req,res)=>{
    const change = req.body.publisher_id;
    const to_change = req.body.placeholder;
    await new Promise((resolve,reject)=>{
        db.query("UPDATE `TABLE 1` SET publisher_id = ? WHERE title = ?",[change,to_change],(err,result)=>{
            if(err){
                return reject(err);
            }
            resolve(result);
        });
    });
    res.redirect("/books_admin");
});

app.get("/admin_add_book",(req,res)=>{
    if(name=='Admin'){
        res.sendFile(__dirname+"/views/admin_add_book.html");
    }
    else{
        res.redirect("/");
    }
});

app.post("/reservation",(req,res)=>{
    const title = req.body.title;
    res.render(__dirname+"/views/reservation.ejs",{
        Name: name,
        email: email,
        title: title,
    });
});

app.post("/reserve_day",async (req,res)=>{
    const day = req.body.day;
    const title = req.body.title;
    var next_date = new Date();
    next_date.setDate(next_date.getDate()+1);
    next_date = next_date.toLocaleDateString();
    next_date = '_' + next_date.slice(0,next_date.indexOf('/'))+'_'+next_date.slice(next_date.indexOf('/')+1,next_date.lastIndexOf('/'))+'_'+next_date.slice(next_date.lastIndexOf('/')+1);
    var date = new Date();
    date.setDate(date.getDate());
    date = date.toLocaleDateString();
    date = '_' + date.slice(0,date.indexOf('/'))+'_'+date.slice(date.indexOf('/')+1,date.lastIndexOf('/'))+'_'+date.slice(date.lastIndexOf('/')+1);
    const result1 = await new Promise((resolve,reject)=>{
        db.query(`SELECT * FROM ${date} WHERE books=?`,[title],(err,result)=>{
            if(err){
                return reject(err);
            }
            resolve(result);
        });
    });
    const result2 = await new Promise((resolve,reject)=>{
        db.query(`SELECT * FROM ${next_date} WHERE books=?`,[title],(err,result)=>{
            if(err){
                return reject(err);
            }
            resolve(result);
        });
    });
    if(day=='Date1'){
    res.render(__dirname+"/views/reserve.ejs",{
        Name: name,
        books: books,
        date: result1,
        day: 1,
        title: title,
    });}
    else{
        res.render(__dirname+"/views/reserve.ejs",{
            Name: name,
            books: books,
            date: result2,
            day: 2,
            title: title,
        });
    }
});

app.post("/reserve",async (req,res)=>{
    const title = req.body.title;
    const slot = req.body.slot;
    const day = req.body.day;
    if(slot==1){
        var time = 'first';
    }
    else if(slot==2){
        var time='second';
    }
    else if(slot==3){
        var time='third';
    }
    else{
        var time='fourth';
    }
    if(day==1){
        var date = new Date();
        date.setDate(date.getDate());
        date = date.toLocaleDateString();
        date = '_' + date.slice(0,date.indexOf('/'))+'_'+date.slice(date.indexOf('/')+1,date.lastIndexOf('/'))+'_'+date.slice(date.lastIndexOf('/')+1);
    }
    else{
        var date = new Date();
        date.setDate(date.getDate()+1);
        date = date.toLocaleDateString();
        date = '_' + date.slice(0,date.indexOf('/'))+'_'+date.slice(date.indexOf('/')+1,date.lastIndexOf('/'))+'_'+date.slice(date.lastIndexOf('/')+1);
    }
    await new Promise((resolve,reject)=>{
        db.query(`UPDATE ${date} SET ${time} = ? WHERE books=?`,[name,title],(err,result)=>{
            if(err){
                return reject(err);
            }
            resolve(result);
        });
    });
    res.redirect("/user_open");
});

const getRandomBooks = (books, count) => {
    let shuffled = books.slice(); 
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; 
    }
    return shuffled.slice(0, count);
};
const removeDuplicates = (books) => {
    const seen = new Set();
    return books.filter(book => {
        const duplicate = seen.has(book.title);
        seen.add(book.title);
        return !duplicate;
    });
};
const ensureNineUniqueBooks = async (initialRecommendations, borrowedBookTitles, department) => {
    let recommendations = removeDuplicates(initialRecommendations);
    const requiredCount = 9;

    if (recommendations.length < requiredCount) {
        
        const [additionalBooksByDept] = await db.promise().query(
            "SELECT * FROM `TABLE 1` WHERE department = ? AND title NOT IN (?)", 
            [department, borrowedBookTitles.concat(recommendations.map(b => b.title))]
        );
        recommendations = recommendations.concat(
            getRandomBooks(additionalBooksByDept, requiredCount - recommendations.length)
        );

        recommendations = removeDuplicates(recommendations);

        if (recommendations.length < requiredCount) {
            const [allBooks] = await db.promise().query(
                "SELECT * FROM `TABLE 1`  WHERE title NOT IN (?)", 
                [borrowedBookTitles.concat(recommendations.map(b => b.title))]
            );
            recommendations = recommendations.concat(
                getRandomBooks(allBooks, requiredCount - recommendations.length)
            );
            recommendations = removeDuplicates(recommendations);
        }
    }

    return recommendations.slice(0, requiredCount);
};
app.get("/recommendations", async (req, res) => {
    let recommendations=[];
    if(name!=="" && email!==""){
    if (res) {
        const username=email.slice(0,email.indexOf('@'));
        try {
           const [user] = await db.promise().query('SELECT Branch FROM users WHERE email = ?', [email]);
           if (user.length === 0) {
               return res.status(404).send('User not found');
           }
           const Branch = user[0].Branch;
           const [borrowedBooks] = await db.promise().query(`SELECT title FROM ${username}`);
           const borrowedBookTitles = borrowedBooks.map(b => b.title);
           if (borrowedBooks.length > 0) {
               const [genresResult] = await db.promise().query("SELECT DISTINCT genre FROM `TABLE 1` WHERE title IN (?)", [borrowedBookTitles]);
               const genres = genresResult.map(g => g.genre);
              
               if (genres.length > 0) {
               const [booksByGenres] = await db.promise().query("SELECT * FROM `TABLE 1` WHERE genre IN (?) AND title NOT IN (?)", [genres, borrowedBookTitles]);
               recommendations = getRandomBooks(booksByGenres, 7);
           } 
       }
           if (recommendations.length < 7) {
               const [booksByDept] = await db.promise().query("SELECT * FROM `TABLE 1` WHERE department = ? AND title NOT IN (?)", [Branch, borrowedBookTitles.length ? borrowedBookTitles : [""]]);
               recommendations = recommendations.concat(getRandomBooks(booksByDept, 7 - recommendations.length));
           }
           recommendations = await ensureNineUniqueBooks(recommendations, borrowedBookTitles, Branch);
    } catch (error) {
           console.error(error);
           res.status(500).send('Server error');
       }
    }
    res.render(__dirname + "/views/recommendations.ejs", {
        Name: name,
        email: email,
        books: books,
        recommendations: recommendations
    });}
    else{
        res.redirect("/");
    }
});

app.post("/add_book",(req,res)=>{
    const title = req.body.title;
    const description = req.body.description;
    const author = req.body.author;
    const genre = req.body.genre;
    const department = req.body.department;
    const count = req.body.count;
    const vendor = req.body.vendor;
    const vendor_id = req.body.vendor_id;
    const publisher = req.body.publisher;
    const publisher_id = req.body.publisher_id;
    db.execute('INSERT INTO `TABLE 1`(title,description,author,genre,department,count,vendor,vendor_id,publisher,publisher_id) VALUES (?,?,?,?,?,?,?,?,?,?)',[title,description,author,genre,department,count,vendor, vendor_id,publisher,publisher_id]);
    res.redirect("/books_admin");
});

app.get("/upcoming_reservation",async (req,res)=>{
    var next_date = new Date();
    next_date.setDate(next_date.getDate()+1);
    next_date = next_date.toLocaleDateString();
    next_date = '_' + next_date.slice(0,next_date.indexOf('/'))+'_'+next_date.slice(next_date.indexOf('/')+1,next_date.lastIndexOf('/'))+'_'+next_date.slice(next_date.lastIndexOf('/')+1);
    var date = new Date();
    date.setDate(date.getDate());
    date = date.toLocaleDateString();
    date = '_' + date.slice(0,date.indexOf('/'))+'_'+date.slice(date.indexOf('/')+1,date.lastIndexOf('/'))+'_'+date.slice(date.lastIndexOf('/')+1);
    const result11 = await new Promise((resolve,reject)=>{
        const sql11 = `SELECT books FROM ${date} WHERE first=?`;
        db.query(sql11,[name],(err,result)=>{
            if(err){
                return reject(err);
            }
            resolve(result);
        });
    });
    const result12 = await new Promise((resolve,reject)=>{
        const sql11 = `SELECT books FROM ${date} WHERE second=?`;
        db.query(sql11,[name],(err,result)=>{
            if(err){
                return reject(err);
            }
            resolve(result);
        });
    });
    const result13 = await new Promise((resolve,reject)=>{
        const sql11 = `SELECT books FROM ${date} WHERE third=?`;
        db.query(sql11,[name],(err,result)=>{
            if(err){
                return reject(err);
            }
            resolve(result);
        });
    });
    const result14 = await new Promise((resolve,reject)=>{
        const sql11 = `SELECT books FROM ${date} WHERE fourth=?`;
        db.query(sql11,[name],(err,result)=>{
            if(err){
                return reject(err);
            }
            resolve(result);
        });
    });
    const result21 = await new Promise((resolve,reject)=>{
        const sql11 = `SELECT books FROM ${next_date} WHERE first=?`;
        db.query(sql11,[name],(err,result)=>{
            if(err){
                return reject(err);
            }
            resolve(result);
        });
    });
    const result22 = await new Promise((resolve,reject)=>{
        const sql11 = `SELECT books FROM ${next_date} WHERE second=?`;
        db.query(sql11,[name],(err,result)=>{
            if(err){
                return reject(err);
            }
            resolve(result);
        });
    });
    const result23 = await new Promise((resolve,reject)=>{
        const sql11 = `SELECT books FROM ${next_date} WHERE third=?`;
        db.query(sql11,[name],(err,result)=>{
            if(err){
                return reject(err);
            }
            resolve(result);
        });
    });
    const result24 = await new Promise((resolve,reject)=>{
        const sql11 = `SELECT books FROM ${next_date} WHERE fourth=?`;
        db.query(sql11,[name],(err,result)=>{
            if(err){
                return reject(err);
            }
            resolve(result);
        });
    });
    res.render(__dirname+"/views/upcoming_reservations.ejs",{
        Name: name,
        email: email,
        books: books,
        r11: result11,
        r12: result12,
        r13: result13,
        r14: result14,
        r21: result21,
        r22: result22,
        r23: result23,
        r24: result24
    });
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

app.get("/timings",(req,res)=>{
    res.sendFile(__dirname+"/views/timings.html");
});

//Render code_of_conduct.ejs file
app.get("/coc",(req,res)=>{
    res.render(__dirname+"/views/code_of_conduct.ejs");
});

//Render about.ejs file
app.get("/about",(req,res)=>{
    res.render(__dirname+"/views/about.ejs");
});

app.get("/faq",(req,res)=>{
    res.sendFile(__dirname+"/views/faq.html");
})

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