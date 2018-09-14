var express = require('express');
var router = express.Router();
var fs = require('fs');
var db = require('../dbConfig');
// 获取主页
router.use(function (req, res, next) {
    if(req.session.userName){  //判断session 状态，如果有效，则返回主页，否则转到登录页面
        next();
    }else{
        console.log('---------重定向----------');
        res.redirect('login');
    }
});

router.get('/', function (req, res) {
    db.list.find({}, function(err, data){
        if(err){
            console.log(err);
        }else{
            listData = data;
            res.render('dashboard',{username : req.session.userName, power : req.session.power, listData : data, temp : 'index'});
        }
    });
});

router.post('/list', function(req, res) {
   if( req.body.type == 'list' ){
       db.file.find({list: req.body.rule}, function(err, data) {
           res.json({ msg: err, data: data });
       })
   }else{
       var reg = new RegExp(req.body.rule,'i');
       db.file.find({name: {$regex : reg} }, function(err, data) {
           res.json({ msg: err, data: data });
       })
   }
});

router.post('/register', function (req, res) {
    db.user.findOne({name : req.body.name}, function(err, data){
        if( data ){
            res.json({'msg':'用户名重复！'});
        }else{
            db.user.create({ name: req.body.name, password: req.body.password, power: 0 }, function(err, data){
                res.json({'msg':err, data:data});
            });
        }
    });
});

router.get('/register', function (req, res) {
    db.user.find({}, { name: 1, power: 1 }, function(err, data){
        if(err){
            console.log(err);
        }else{
            res.json({msg: err, data: data});
        }
    });
});

router.post('/newlist', function (req, res) {
    db.list.findOne({name : req.body.name}, function(err, data){
        if( data ){
            res.json({'msg':'菜单名重复！'});
        }else{
            db.list.findOne({index: 1}, function(err, data){
                db.list.create({ name : req.body.name, index : 2, father : data._id}, function(err, data){
                    res.json({'msg':err, data:data});
                });
            });
        }
    });
});

router.get('/newlist', function (req, res) {
    db.list.find({ index: 2 }, function(err, data){
        if(err){
            console.log(err);
        }else{
            res.json({msg: err, data: data});
        }
    });
});

router.post('/upDataList', function (req, res) {
    db.list.findOne({name : req.body.name}, function(err, data){
        if( data ){
            res.json({'msg':'菜单名重复！'});
        }else{
            db.list.updateOne({_id: req.body.oID}, {name: req.body.name}, function(err, data){
                res.json({'msg':err, data:data});
            });
        }
    });
});

var typeArr = [];
for( var a in db ){
    typeArr.push(a);
}

router.post('/deleteFile', function (req, res) {
    console.log(typeArr);
    if( typeArr.indexOf( req.body.type ) >= 0 ){
        db[req.body.type]['findOne']({_id: req.body.id}, function (err, data) {
            if(!err){
                if( req.body.type == 'file' ){
                    fs.unlink('./uploads/'+ data.name, function(err) {
                        if(!err){
                            db[req.body.type]['deleteOne']({_id: req.body.id}, function (err, data) {
                                if(!err){
                                    res.json({msg: '删除成功', data: data});
                                }else{
                                    res.json({msg:err});
                                }
                            })
                        }else {
                            res.json({msg:err});
                        }
                    })
                }else if( req.body.type == 'list' ){
                    db.file.find({ list: req.body.id }, function(err, data){
                        if( data.length != 0 ){
                            res.json({msg: '请先把列表下的文件删除'});
                        }else{
                            db[req.body.type]['deleteOne']({_id: req.body.id}, function (err, data) {
                                if(!err){
                                    res.json({msg: '删除成功', data: data});
                                }else{
                                    res.json({msg:err});
                                }
                            })
                        }
                    })
                }else{
                    db[req.body.type]['deleteOne']({_id: req.body.id}, function (err, data) {
                        if(!err){
                            res.json({msg: '删除成功', data: data});
                        }else{
                            res.json({msg:err});
                        }
                    })
                }
            }else{
                res.json({msg:err});
            }
        })
    }else{
        res.json({msg:'参数错误'});
    }
});

module.exports = router;
