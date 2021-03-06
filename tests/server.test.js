const expect= require("expect");
const request= require("supertest");
const {app}= require("./../server");
const {Todo}= require("./../models/todo");
const {User}= require("./../models/user");
const {ObjectID}= require("mongodb");
const{todos, populateTodos, users, populateUsers}= require("./seed");


beforeEach(populateUsers);
beforeEach(populateTodos);

describe("POST,todos", ()=>{
    it("should create a new todo", (done)=>{
        var text="test todo"
       
       request(app) 
       .post("/todos")
        .set('x-auth', users[0].tokens[0].token)
       .send({text})
       .expect(200)
       .expect((res)=>{
           expect(res.body.text).toBe(text);
       })
       .end((err, res)=>{
           if (err){
               return done(err);
           }
           Todo.find({text}).then((todos)=>{
               expect(todos.length).toBe(1);
               expect(todos[0].text).toBe(text);
               done();
           }).catch((e)=>{
               done(e);
           })
       })
       
    });
    it("should not create todo",(done)=>{
        request(app) 
       .post("/todos")
        .set('x-auth', users[0].tokens[0].token)
       .send({})
       .expect(400)
       .end((err, res)=>{
           if(err){
               return done(err);
           }
           Todo.find().then((todos)=>{
               expect(todos.length).toBe(2);
               done();
           }).catch((e)=>{
               done(e)
           })
       })
    });
});
describe("GET /todos",()=>{
    it("should get all todos",(done)=>{
        request(app)
        .get("/todos")
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .expect((res)=>{
            expect(res.body.todos.length).toBe(1);
        })
        .end(done);
    })
})
describe("GET todos/:id",()=>{
    it("should return one todo",(done)=>{
        request(app)
        .get(`/todos/${todos[0]._id.toHexString()}`)
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .expect((res)=>{
            expect(res.body.todo.text).toBe(todos[0].text);
        })
        .end(done);
    })
        it("should not return one todo created by another user",(done)=>{
        request(app)
        .get(`/todos/${todos[1]._id.toHexString()}`)
        .set('x-auth', users[0].tokens[0].token)
        .expect(404)
        .end(done);
    })
    it("should return 404 if todo not found",(done)=>{
        var hexID= new ObjectID().toHexString();
        request(app)
        .get(`/todos/${hexID}`)
        .set('x-auth', users[0].tokens[0].token)
        .expect(404) 
        .end(done);
    })
    it("should return 404 for non ids",(done)=>{
         request(app)
        .get(`/todos/123`)
        .set('x-auth', users[0].tokens[0].token)
        .expect(404) 
        .end(done);
    })
})
describe("DELETE /todos/:id", ()=>{
    it("should remove a todo", (done)=>{
        var hexID= todos[1]._id.toHexString();
        request(app)
        .delete(`/todos/${hexID}`)
        .set('x-auth', users[1].tokens[0].token)
        .expect(200)
        .expect((res)=>{
            expect(res.body.todo._id).toBe(hexID)
        })
        .end((err, res)=>{
            if(err){
                return done(err);
            }
            Todo.findById(hexID).then((todo)=>{
                expect(todo).toNotExist();
                done();
            }).catch((e)=>done(e));
        })
    });
     it("should not remove a todo owned by another user", (done)=>{
        var hexID= todos[0]._id.toHexString();
        request(app)
        .delete(`/todos/${hexID}`)
        .set('x-auth', users[1].tokens[0].token)
        .expect(404)
        .end((err, res)=>{
            if(err){
                return done(err);
            }
            Todo.findById(hexID).then((todo)=>{
                expect(todo).toExist();
                done();
            }).catch((e)=>done(e));
        })
    });
    it("should return 404 if no todo", (done)=>{
         var hexID= new ObjectID().toHexString();
        request(app)
        .delete(`/todos/${hexID}`)
        .set('x-auth', users[1].tokens[0].token)
        .expect(404) 
        .end(done);
    });
    it("should return 404 if invalid id", (done)=>{
         request(app)
        .delete(`/todos/123`)
        .set('x-auth', users[1].tokens[0].token)
        .expect(404) 
        .end(done);
    })
})
describe("PATCH /todos/:id", ()=>{
    it("should update the todo", (done)=>{
        var hexID= todos[0]._id.toHexString();
        var text= "new text";
        request(app)
        .patch(`/todos/${hexID}`)
        .set('x-auth', users[0].tokens[0].token)
        .send({
            completed:true,
            text
        })
        .expect(200)
        .expect((res)=>{
            expect(res.body.todo.text).toBe(text);
            expect(res.body.todo.completed).toBe(true);
            expect(res.body.todo.completedAt).toBeA("number");
        })
        .end(done)

    })
     it("should not update the todo created by another user", (done)=>{
        var hexID= todos[0]._id.toHexString();
        var text= "new text";
        request(app)
        .patch(`/todos/${hexID}`)
        .set('x-auth', users[1].tokens[0].token)
        .send({
            completed:true,
            text
        })
        .expect(404)
        .end(done)

    })
    it("should clear completedAt when completed is updated to false", (done)=>{
        var hexID= todos[1]._id.toHexString();
        var text= "new text!!!!!!";
        request(app)
        .patch(`/todos/${hexID}`)
        .set('x-auth', users[1].tokens[0].token)
        .send({
            completed:false,
            text
        })
        .expect(200)
        .expect((res)=>{
            expect(res.body.todo.text).toBe(text);
            expect(res.body.todo.completed).toBe(false);
            expect(res.body.todo.completedAt).toNotExist();
        })
        .end(done)

    })
})

describe("GET /users/me", ()=>{
    it("should return user if authenticated", (done)=>{
        request(app)
        .get("/users/me")
        .set("x-auth", users[0].tokens[0].token)
        .expect(200)
        .expect((res)=>{
            expect(res.body._id).toBe(users[0]._id.toHexString());
            expect(res.body.email).toBe(users[0].email);

        })
        .end(done);
    })
    it("should return 401 if user not authenticated", (done)=>{
         request(app)
        .get("/users/me")
        .expect(401)
        .expect((res)=>{
            expect(res.body).toEqual({});
        })
        .end(done);

    })
})

describe("POST /users",()=>{
    it("should create a user", (done)=>{
        var email= "example@example.com";
        var password= "password";
        
        request(app)
        .post("/users")
        .send({email, password})
        .expect(200)
        .expect((res)=>{
            expect(res.headers["x-auth"]).toExist()
            expect(res.body.email).toExist()
            expect(res.body._id).toExist()
        })
        .end((err)=>{
            if(err){
                return done(err);
            }else{
                User.findOne({email}).then((user)=>{
                    expect(user).toExist();
                    expect(user.password).toNotBe(password);
                    done(); 
                }).catch((e)=>done(e));
            }
        });
    })
    it("should return validation error if request invalid", (done)=>{
         request(app)
        .post("/users")
        .send({
            email: "and",
            password: "123"
        })
        .expect(400)
        .end(done);
    })
    it("should not create user if email is in use", (done)=>{
         request(app)
        .post("/users")
        .send({
            email: users[0].email,
            password: "123456"
        })
        .expect(400)
        .end(done);
    })
})

describe("POST /users/login", ()=>{
    it("should login user and return auth token",(done)=>{
        request(app)
        .post("/users/login")
        .send({
            email:users[1].email,
            password: users[1].password
        })
        .expect(200)
        .expect((res)=>{
            expect(res.headers["x-auth"]).toExist()
        })
        .end((err, res)=>{
            if(err){
                return done(err);
            } else{
                User.findById(users[1]._id).then((user)=>{
                    expect(user.tokens[1]).toInclude({
                        access:"auth",
                        token: res.headers["x-auth"]
                    })
                    done();
                }).catch((e)=>done(e));
            }
        })
    })
    it("should reject invalid login", (done)=>{
  request(app)
        .post("/users/login")
        .send({
            email:users[0].email,
            password:"password"
        })
        .expect(400)
        .expect((res)=>{
            expect(res.headers["x-auth"]).toNotExist()
        })
        .end((err, res)=>{
            if(err){
                return done(err);
            } else{
                User.findById(users[1]._id).then((user)=>{
                    expect(user.tokens.length).toBe(1);
                    done();
                }).catch((e)=>done(e));
            }
        })
    })
})

describe("DELETE /users/me/token", ()=>{
  it('should remove auth token on logout', (done)=>{
      request(app)
      .delete('/users/me/token')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .end((err, res)=>{
          if(err){
              return done(err)
          } else{
              User.findById(users[0]._id).then((user)=>{
                  expect(user.tokens.length).toBe(0);
                  done();
              }).catch((e)=>done(e));
          }
      })
  })  
})
