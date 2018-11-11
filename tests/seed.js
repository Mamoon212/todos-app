const {Todo}= require("./../models/todo");
const {User}= require("./../models/user");
const {ObjectID}= require("mongodb");
const jwt= require("jsonwebtoken");

var userOneId= new ObjectID();
var userTwoId= new ObjectID();

const users=[{
    _id: userOneId,
    email: "kalb@kalb.com",
    password: "kalb",
    tokens:[{
        access: "auth",
        token: jwt.sign({_id: userOneId, access: "auth"},"abc13").toString()
        }]
},{
    _id: userTwoId,
    email: "2otta@2otta.com",
    password: "2otta",
    tokens:[{
        access: "auth",
        token: jwt.sign({_id: userTwoId, access: "auth"},"abc13").toString()
        }]
}]

const todos= [{
        _id: new ObjectID(),
        text:"1",
        _creator: userOneId
    },{
        _id: new ObjectID(),
        text:"2",
        completed: true,
        completedAt: 333,
        _creator: userTwoId
    }];
    
const populateTodos= (done)=>{
    Todo.remove({}).then(()=>{
      Todo.insertMany(todos);  
    }).then(()=>done());
} 

const populateUsers= (done)=>{
    User.remove({}).then(()=>{
        var userOne= new User(users[0]).save();
        var userTwo= new User(users[1]).save();
        
        return Promise.all([userOne, userTwo])
    }).then(()=>done());
}

module.exports= {todos, populateTodos, users, populateUsers};