var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan')
var session = require('express-session');
var bodyparser = require('body-parser');

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

// 使用 session 中间件
app.use(session({
	secret :  'secret', // 对session id 相关的cookie 进行签名
	resave : true,
	saveUninitialized: false, // 是否保存未初始化的会话
	cookie : {
		maxAge : 1000 * 60 * 30, // 设置 session 的有效时间，单位毫秒
	},
}));

// app.use('/login', loginRouter);
// 获取登录页面
app.get('/login', function(req, res){
	res.render('login',{ title: '登录页面' })
});

// 用户登录
app.post('/login', function(req, res){
	if(req.body.username == 'admin' && req.body.pwd == 'admin123'){
		req.session.userName = req.body.username; // 登录成功，设置 session
		res.redirect('/');
	}
	else{
		res.json({ret_code : 1, ret_msg : '账号或密码错误'});// 若登录失败，重定向到登录页面
	}
});

// 获取主页
app.get('/', function (req, res) {
	if(req.session.userName){  //判断session 状态，如果有效，则返回主页，否则转到登录页面
		res.render('home',{username : req.session.userName});
	}else{
		res.redirect('login');
	}
})

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
