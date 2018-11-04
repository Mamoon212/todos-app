var mongoose= require("mongoose")
mongoose.Promise=global.Promise;
// mongoose.connect("mongodb://localhost/todo-app", { useNewUrlParser: true })
mongoose.connect(`${process.env.DATABASEURl}`, { useNewUrlParser: true })
// mongoose.connect("mongodb://Mamoon:m362951847@ds145563.mlab.com:45563/todo", { useNewUrlParser: true })
module.exports={mongoose};