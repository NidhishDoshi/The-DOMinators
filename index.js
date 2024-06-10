import express from "express";
import bodyParser from "body-parser";
import { fileURLToPath } from "url";
import { dirname } from "path";
import mysql from "mysql2";
import bcrypt from "bcrypt";

const db=mysql.createConnection({
    host: "sql7.freesqldatabase.com",
    user: "sql7712621",
    database: "sql7712621",
    password: "lnzSk48cVz",
    port: 3306
});
db.connect();
const __dirname=dirname(fileURLToPath(import.meta.url));
const port=3000;
const saltRounds=10;
const app=express();
var books=[];
var response="";

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
try
{
    db.query("SELECT title from `TABLE 1`",function (err,result){
        if(err) throw err;
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
        db.query("SELECT password FROM users WHERE username=?",[username],function(err,result){
            if(err) throw err;
            if(result.length>0)
            {
                const pass=result[0].password;
                bcrypt.compare(password,pass,(err,result)=>{
                    if(err)
                    console.error("Error: ",err);
                    else
                    {
                        if(result)
                        {
                            response="Login Successful";
                            res.redirect("/search");
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
    const username=req.body.mail;
    const password=req.body.pswd;
    try
    {
        db.query("SELECT * FROM users WHERE username=?",[username], function(err,result){
            if(err) throw err;
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
                            db1.execute("INSERT INTO users(username,password) VALUES (?,?)",[username,hash]);
                            res.redirect("/search")
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
app.listen(port,()=>{
    console.log(`Server is running on port ${port}.`)
});
