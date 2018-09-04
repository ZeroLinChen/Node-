var express = require('express');
var router = express.Router();

// 获取登录页面
router.route('/').get(function(req, res){
	res.render('login',{ title: '登录页面' })
}).post(function(req, res){
	if(req.body.username == 'admin' && req.body.pwd == 'admin123'){
		req.session.userName = req.body.username; // 登录成功，设置 session
		res.redirect('/');
	}
	else{
		res.json({ret_code : 1, ret_msg : '账号或密码错误'});// 若登录失败，重定向到登录页面
	}
});

module.exports = router;
