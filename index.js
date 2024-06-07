import express from "express";
import bodyParser from "body-parser";
import { fileURLToPath } from "url";
import { dirname } from "path";
import pg from "pg";
import env from "dotenv";

env.config();
const db=new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "postgres",
    password: "veda123",
    port: 5432
});
const __dirname=dirname(fileURLToPath(import.meta.url));
const port=3000;
const app=express();
var response="";
db.connect();

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
        const result=await db.query("SELECT password FROM users WHERE name=$1",[username]);
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
