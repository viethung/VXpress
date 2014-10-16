var fs = require('fs');
var path = require('path');

var gii = {
	M:	{},
	V:	{},
	C:	{}
};

(function() {
	console.log(__dirname);
	fs.readdirSync(__dirname+"/mvc/models").forEach(function(file) { require(__dirname+"/mvc/models/" + file)(M); });
	fs.readdirSync(__dirname+"/mvc/controllers").forEach(function(file) { require(__dirname+"/mvc/controllers/" + file)(C); });
	
}).apply(gii);
module.exports = gii;