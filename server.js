var express= require("express");
var bodyParser= require("body-parser");

var {mongoose}= require("./db/mongoose");
var {Todo}= require("./models/todo");
var {User}= require("./models/user");

var app=express();

app.use(bodyParser.json());

app.post("/todos", (req,res)=>{
    var todo= new Todo({
        text: req.body.text
    });
    todo.save().then((todo)=>{
        res.send(todo);
    },(e)=>{
        res.status(400).send(e);
    });
});

app.get("/todos", (req,res)=>{
    Todo.find().then((todos)=>{
        res.send({todos});
    }, (e)=>{
        res.status(400).send(e);
    })
})

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Server has started");
});

module.exports={app};