var express = require('express');
var router = express.Router();
var db = require('../dbConfig');

// 获取登录页面
router.route('/').get(function(req, res){
	res.render('login',{ title: '登录页面' })
}).post(function(req, res){
	db.user.findOne({ name: req.body.name}, function(err, data) {
		console.log(req.body.name);
		console.log(data);
        if( data.password == req.body.password ){
            req.session.userName = req.body.name; // 登录成功，设置 session
            req.session.power = data.power;
            res.json({msg:err});
        }else{
            res.json({msg : '账号或密码错误'});// 若登录失败，重定向到登录页面
        }
	});
});

module.exports = router;
