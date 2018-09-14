var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var db = mongoose.connect('mongodb://localhost/local', {useNewUrlParser:true}, function(err){
    if(err){
        console.log('Connection Error:' + err)
    }else{
        console.log('Connection success!') }
});

var mySchema = new Schema({name:String, password:String, power:Number, index:Number, father:String, list:String, lastUpdataTime:Date});
var MyModel = {
    user : mongoose.model('user', mySchema),
    list : mongoose.model('list', mySchema),
    file : mongoose.model('file', mySchema)
};

module.exports = MyModel;