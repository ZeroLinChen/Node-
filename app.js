var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var bodyparser = require('body-parser');
var fs = require('fs');
var multer = require('multer');
var upload = multer({ dest: 'uploads/' }).single('file');

var db = require('./dbConfig');
var indexRouter = require('./routes/index');
var loginRouter = require('./routes/login');
var usersRouter = require('./routes/users');

var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html'); // 设置解析模板文件类型：这里为html文件
app.engine('html', require('ejs').__express); // 使用ejs引擎解析html文件中ejs语法

app.use(logger('dev'));
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
// 使用 session 中间件
app.use(session({
	secret :  'secret', // 对session id 相关的cookie 进行签名
	resave : true,
	saveUninitialized: false, // 是否保存未初始化的会话
	cookie : {
		maxAge : 1000 * 60 * 240, // 设置 session 的有效时间，单位毫秒
	},
}));

app.use('/login', loginRouter);
app.use('/', indexRouter);
app.use('/users',usersRouter);

//文件上传
//获取listID
var listID = '';
app.post('/listID', function(req, res) {
    console.log(req.body);
    listID = req.body.listID;
    console.log(listID);
    res.json({msg:'', data: {listID: listID}})
});

app.post('/upDataFile', function(req, res) {
    db.file.findOne({ _id: req.body.fileID}, function (err, data) {
        console.log(data);
        if( !err || data.length > 0 ){
            listID = data.list;
            res.json({msg:'', data: {listID: data.list, name: data.name, fileID: req.body.fileID}});
        }else(
            res.json({msg:'出错！找不到该数据'})
        )
    });
});

app.post('/profile', function (req, res) {
    db.file.find({list: listID}, {name: 1}, function(err, data){
        upload(req, res, function (err) {
            console.log(req.body);
            console.log(req.file);
            if (err) {
                console.log(err);
                res.json({msg:'上传失败，请检查网络'});
            }
            // console.log(req);
            console.log('listID:' + listID)
            // console.log('listID:'+list);
            console.log(data);
            var fname = req.file.filename;
            var oname = req.file.originalname;
            var cheackName = false;

            for( var i = 0; i < data.length; i++){
                if( data[i].name == oname ){
                    console.log('cheackName')
                    cheackName = true;
                    break
                }
            }
            if( !cheackName ){
                console.log('readFile');
                fs.readFile('./uploads/'+fname,function(err,data){
                    if( data != 'undefind' ) {
                        fs.writeFile('./uploads/'+oname,data,function(err,data){
                            fs.unlink('./uploads/'+ fname, function(err) {
                                if( err ){
                                    res.json({msg:err});
                                    return
                                }
                            });
                            if( req.body.type ){
                                fs.unlink('./uploads/'+ req.body.ooname, function(err) {
                                    if( err ){
                                        console.log(111111111111);
                                        res.json({msg:err});
                                        return
                                    }else{
                                        db.file.updateOne({ _id: req.body.fileID }, {name: oname, lastUpdataTime: Date.now()}, function (err, data) {
                                            if(!err){
                                                console.log(222222222222222);
                                                res.json({msg:'更新成功'});
                                            }else{
                                                console.log('——————————————————————————————————————————————————');
                                                res.json({msg:err});
                                            }
                                        })
                                    }
                                });
                            }else{
                                db.file.create({ name: oname, list: req.body.listID, lastUpdataTime: Date.now()}, function (err, data) {
                                    if(!err){
                                        res.json({msg:'上传成功'});
                                    }else{
                                        console.log('——————————————————————————————————————————————————');
                                        res.json({msg:err});
                                    }
                                });
                            }
                        })
                    }else {
                        res.json({msg:'数据库文件夹中该文件已存在，请联系管理员删除'});
                    }
                })
            }else{
                res.json({msg:'该列表中文件已存在'});
            }
        })
    });
});
// 退出
app.get('/logout', function (req, res) {
	req.session.userName = null; // 删除session
	res.redirect('login');
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
module.exports = app;
