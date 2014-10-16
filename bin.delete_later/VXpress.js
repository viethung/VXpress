var http = require('http');
var fs = require('fs');
var app = require('../lib/App.js').App;
var Route = require('../lib/Route.js').Route;

var VXpress = function() {
	var configFile = './config.json';
	var stat = fs.statSync(configFile);
	if(!stat.isFile()) {
		console.log('Config file ' + configFile + ' not found');
		return;
	}
	else {
		var data = fs.readFileSync(configFile, 'utf8')
		app.setSiteConfigs(JSON.parse(data));
	}
}

//exports.locals = this.locals;
VXpress.prototype.run = function() {
	console.log('Listen on port 3000');
	http.createServer(function (req, res) {
		app.req = req;
		app.res = res;
		//var route = new Route(req, res);
		var route = new Route();
		route.Start();
	}).listen(3000);
};

exports.VXpress = VXpress;