var express = require('express');
var router = express.Router();
var word = require("mammoth");
var xlsx = require('xlsx');
var db = require('../dbConfig');

/* GET users listing. */
router.get('/:id', function(req, res, next) {
    console.log(req.params);
    db.file.findById(req.params.id, function(err, data){
    	console.log(data);
		if( !err ){
            var fileType = data.name.substr(data.name.indexOf('.')+1);
            console.log(fileType);
			if( fileType.indexOf('doc') >= 0 ){
                word.convertToHtml({path: './uploads/'+ data.name})
                    .then(function(result){
                        var html = result.value; // The generated HTML
                        var messages = result.messages; // Any messages, such as warnings during conversion
                        console.log(messages);
                        res.render('word',{ html: html, title: data.name });
                    })
                    .done();
			}else{
                var workbook = xlsx.readFile('./uploads/'+ data.name);
                console.log(workbook);
                res.render('users', {html: JSON.stringify(workbook), title: data.name});
			}
		}else{
			console.log(err);
		}
	});
});
module.exports = router;
