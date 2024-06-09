import express from "express";
import bodyParser from "body-parser";
import { fileURLToPath } from "url";
import { dirname } from "path";
import pg from "pg";
import env from "dotenv";
import mysql from "mysql2";

env.config();
const Database = mysql.createConnection({
    host: "sql7.freesqldatabase.com",
    user: "sql7712621",
    database: "sql7712621",
    password: "lnzSk48cVz",
    port: 3306
});
Database.connect();
const __dirname=dirname(fileURLToPath(import.meta.url));
const port=3000;
const app=express();
var response="";


app.use(express.static('assets'));
app.use(bodyParser.urlencoded({extended: true}));
app.get("/",(req,res)=>{
    res.render(__dirname+"/views/login.ejs",{
        response: response,
    });
});

app.post("/login",async (req,res) =>{
    const username=req.body.Username;
    const password=req.body.Password;
    try
    {
        const result= await Database.query("SELECT password FROM users WHERE name=$1",[username]);
        const pass=result.rows[0].password;
        if(password===pass)
        {
            response="Login Successful.";
            res.redirect("/");
        }
        else{
            response="INVALID CREDENTIALS!!. Try Again.";
            res.redirect("/");
        }
    }
    catch(err){
        console.error("Error: ",err.message);
        res.redirect("/");
    }
})
app.listen(port,()=>{
    console.log(`Server is running on port ${port}.`)
});
