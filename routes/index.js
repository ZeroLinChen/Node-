var express = require('express');
var router = express.Router();

// 获取主页
router.get('/', function (req, res) {
	if(req.session.userName){  //判断session 状态，如果有效，则返回主页，否则转到登录页面
		res.render('dashboard',{username : req.session.userName});
	}else{
		res.redirect('login');
	}
})



module.exports = router;
