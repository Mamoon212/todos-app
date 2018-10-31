var mongoose= require("mongoose")
mongoose.Promise=global.Promise;
mongoose.connect("mongodb://localhost/todo-app", { useNewUrlParser: true })
module.exports={mongoose};