import express from "express";
import bodyParser from "body-parser";
import { fileURLToPath } from "url";
import { dirname } from "path";
import mysql from "mysql2";
import bcrypt from "bcrypt";
import { name } from "ejs";

const app = express();
const port = 3000;
const saltRounds = 10;

const db = mysql.createConnection({
    host: "sql7.freesqldatabase.com",
    user: "sql7714106",
    database: "sql7714106",
    password: "jFBhbcliJV",
    port: 3306,
});

db.connect((err) => {
    if (err) {
        console.error("Error connecting to the database: ", err);
        
    } else {
        console.log("Connected to MySQL database...");
    }
});

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

const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

let books = [];
let cs_all_books = [];
let me_all_books = [];
let ee_all_books = [];
let ce_all_books = [];
let ch_all_books = [];

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

app.get("/", (req, res) => {
    res.render(__dirname + "/views/open.ejs", {
        books: books,
    });
});

app.get("/login", (req, res) => {
    res.render(__dirname + "/views/login.ejs", {
        response: "",
    });
});

app.get("/signup", (req, res) => {
    res.render(__dirname + "/views/signup.ejs");
});

app.post("/login", async (req, res) => {
    const username = req.body.Username;
    const password = req.body.Password;
    try {
        db.query("SELECT * FROM users WHERE email=?", [username], function (err, result) {
            if (err) {
                console.error("Error: ", err);
            } else {
                if (result.length > 0) {
                    const pass = result[0].password;
                    const name = result[0].fName;
                    bcrypt.compare(password, pass, (err, result) => {
                        if (err) {
                            console.error("Error: ", err);
                        } else {
                            if (result) {
                                res.render(__dirname + "/views/user_open.ejs", {
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
    }
});

app.post("/signup", async (req, res) => {
    const fName = req.body.fname;
    const lName = req.body.lname;
    const username = req.body.mail;
    const password = req.body.pswd;
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
                                db.execute("INSERT INTO users(fName, lName, email, password) VALUES (?, ?, ?, ?)", [fName, lName, username, hash]);
                                res.render(__dirname + "/views/user_open.ejs", {
                                    Name: fName,
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

app.get("/search", (req, res) => {
    res.render(__dirname + "/views/search.ejs", {
        books: books,
    });
});

app.get("/user_open", (req, res) => {
    res.render(__dirname + "/views/user_open.ejs", {
        Name: name, 
        books: books,
    });
});

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
            });
            cs_all_books = []; 
        }
    });
});

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
            });
            me_all_books = []; 
        }
    });
});

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
            });
            ee_all_books = []; 
        }
    });
});

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
            });
            ce_all_books = []; 
        }
    });
});

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
            });
            ch_all_books = []; 
        }
    });
});

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
                  title: details.title,
                  author: details.author,
                  description: details.description,
                  genre: details.genre,
                  department: details.department,
                  count: details.count,
                  vendor: details.vendor,
                  publisher: details.publisher,
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
app.get("/terms_and_conditions",(req,res)=>{
  res.render(__dirname+"/views/terms_and_conditions.ejs");
});
app.get("/privacy_policy",(req,res)=>{
  res.render(__dirname+"/views/privacy_policy.ejs");
});
app.get("/contact",(req,res)=>{
  res.render(__dirname+"/views/contact.ejs");
})
app.listen(port,()=>{
  console.log(`Server is running on port ${port}.`)
});
