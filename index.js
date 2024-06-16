import express from "express";
import bodyParser from "body-parser";
import { fileURLToPath } from "url";
import { dirname } from "path";
import mysql from "mysql2";
import bcrypt from "bcrypt";

const db=mysql.createConnection({
    host: "sql7.freesqldatabase.com",
    user: "sql7714106",
    database: "sql7714106",
    password: "jFBhbcliJV",
    port: 3306
});
db.connect((err)=>{
    if(err)
    console.error("Error connecting to the database: ",err);
});
db.on('error',(err)=>{
    console.error("Database Error: ",err);
    if(err.code=='ECONNRESET')
    handleDisconnect()
});
function handleDisconnect()
{
    db.connect((err)=>{
        if(err)
        {
            console.error("Error reconnecting: ",err);
            setTimeout(handleDisconnect,2000);
        }
        else
        console.log("Reconnected");
    });
}
const __dirname=dirname(fileURLToPath(import.meta.url));
const port=3000;
const saltRounds=10;
const app=express();
var books=[];
var response="";
var name="";

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
try
{
    db.query("SELECT title from `TABLE 1`",function (err,result){
        if(err)
        console.error("Error: ",err);
        if(result.length>0)
        {
            for(var i=0;i<result.length;i++)
            {
                books.push(result[i].title);
            }
        }
    });
}
catch(err)
{
    console.error("Error: ",err);
}
app.get("/",(req,res)=>{
    res.render(__dirname+"/views/open.ejs",{
        books: books,
    });
});
app.get("/login",(req,res)=>{
    res.render(__dirname+"/views/login.ejs",{
        response: response,
    });
})
app.get("/signup",(req,res)=>{
    res.render("signup.ejs");
})
app.post("/login",async (req,res) =>{
    const username=req.body.Username;
    const password=req.body.Password;
    try
    {
        db.query("SELECT * FROM users WHERE email=?",[username],function(err,result){
            if(err)
            console.error("Error: ",err);
            if(result.length>0)
            {
                const pass=result[0].password;
                name=result[0].fName;
                bcrypt.compare(password,pass,(err,result)=>{
                    if(err)
                    console.error("Error: ",err);
                    else
                    {
                        if(result)
                        {
                            response="Login Successful";
                            res.redirect("/user_open");
                        }
                        else
                        {
                            response="Invalid Credentials. Try Again.";
                            res.redirect("/login");
                        }
                    }
                });
            }
            else
            {
                response="User does not exist.";
                res.redirect("/login");
            }
        });
    }
    catch(err){
        console.error("Error: ",err.message);
        res.redirect("/");
    }
});
app.post("/signup",async (req,res)=>{
    const fName=req.body.fname;
    const lName=req.body.lname;
    const username=req.body.mail;
    const password=req.body.pswd;
    try
    {
        db.query("SELECT * FROM users WHERE email=?",[username], function(err,result){
            if(err)
            console.log("Error: ",err);
            if(result.length>0)
            {
                res.render(__dirname+"/views/signup.ejs",{
                    alert: "User already exist. Try logging in.",
                });
            }
            else
            {
                bcrypt.hash(password,saltRounds,async (err,hash)=>{
                    if(err)
                    console.error("Error: ",err.message);
                    else
                    {
                        try
                        {
                            db.execute("INSERT INTO users(fName,lName,email,password) VALUES (?,?,?,?)",[fName,lName,username,hash]);
                            res.redirect("/user_open")
                        }
                        catch(err)
                        {
                            console.error("Error: ",err);
                        }
                    }
                });
            }
        });
    }
    catch(err)
    {
        console.error("Error: ",err);
    }
});
app.get("/search",(req,res)=>{
    res.render(__dirname+"/views/search.ejs",{
        books: books,
    });
});
app.get("/user_open",(req,res)=>{
    res.render(__dirname+"/views/user_open.ejs",{
        Name: name,
    });
});
app.get("/terms_and_conditions",(req,res)=>{
    res.render(__dirname+"/views/terms_and_conditions.ejs");
});
app.get("/privacy_policy",(req,res)=>{
    res.render(__dirname+"/views/privacy_policy.ejs");
});
app.listen(port,()=>{
    console.log(`Server is running on port ${port}.`)
});
