var _= require("lodash");
var express= require("express");
var bodyParser= require("body-parser");
const {ObjectID}= require("mongodb");
var {mongoose}= require("./db/mongoose");
var {Todo}= require("./models/todo");
var {User}= require("./models/user");

var app=express();

app.use(bodyParser.json());
 console.log(process.env.DATABASEURl);
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
    });
});

app.get("/todos/:id", (req,res)=>{
    var id= req.params.id;
    if(!ObjectID.isValid(id)){
        console.log("ID not valid");
        return res.status(404).send();
    }
    Todo.findById(id).then((todo)=>{
        if(todo){
            res.send({todo});
        } else{
            res.status(404).send();
        }
    }).catch((e)=>{
        res.status(400).send();
    });
});

app.delete("/todos/:id", (req,res)=>{
    var id= req.params.id;
    if(!ObjectID.isValid(id)){
        console.log("ID not valid");
        return res.status(404).send();
    }
    Todo.findByIdAndRemove(id).then((todo)=>{
        if(todo){
            res.send({todo});
        } else{
            res.status(404).send();
        }
    }).catch((e)=>{
        res.status(400).send();
    });
});

app.patch("/todos/:id", (req, res)=>{
    var id= req.params.id;
    var body= _.pick(req.body, ['text', 'completed']);
     if(!ObjectID.isValid(id)){
        console.log("ID not valid");
        return res.status(404).send();
    }
    if(_.isBoolean(body.completed)&&body.completed){
        body.completedAt= new Date().getTime();
    } else{
        body.completed = false;
        body.completedAt = null;
    }
    
    Todo.findByIdAndUpdate(id, {$set:body}, {new: true}).then((todo)=>{
        if(todo){
            res.send({todo});
        } else{
            res.status(404).send();
        }
    }).catch((e)=>{
        res.status(400).send();
    })
})

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Server has started");
});

module.exports={app};