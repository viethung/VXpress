var fs = require('fs');
var path = require('path');
var http = require('http');
var util = require("util");

var VXpress = {
	models:	{}
};
(function(){
	var self = this;
	var configData = {};
	
	//require(__dirname+"/lib/App.js")(self);
	//Loading VXpress lib files of Model, Controller, Server, Route and App
	fs.readdirSync(__dirname+"/lib/").forEach(function(file) { if(path.extname(file) === '.js') require(__dirname+"/lib/" + file)(self); });
	
	var configFile = this.App.getAppDir() + '/config.json';
	//var configFile = process.cwd() + '/config.json';
	var stat = fs.statSync(configFile);
	if(stat.isFile()) {
		var data = fs.readFileSync(configFile, 'utf8')
		configData = JSON.parse(data);
	}
	else 
		console.log('Config file ' + configFile + ' not found');
	
	this.App.setSiteConfigs(configData);

	if(configData.database.dbtech === 'mysql')
	{
		var db = require(configData.database.dbtech);
		this.App.vxpdb = require('./db/'+configData.database.dbtech);
		var pool = db.createPool({
			host     : configData.database.dbhost,
			user     : configData.database.dbuser,
			password : configData.database.dbpass,
			database : configData.database.dbname
		});
		//pool.on('connection', function(err, connection) {
		//	connection.query('SET SESSION auto_increment_increment=1');
		//});
		this.App.dbpool = pool;
	}
	
	console.log('Listen on port 3000');
	http.createServer(function (req, res) {
		self.App.req = req;
		self.App.res = res;		
		var route = new self.Route();
		route.Start();
	}).listen(3000);

	//http.on('close', function() {
	//	console.log('http close event');
	//	app.dbconn.end();
	//});
	
	this.getModel = function(modelName) { return this.models[modelName]; };
	this.setModel = function(modelName, model) { this.models[modelName] = model; };
}).apply(VXpress);
module.exports = VXpress;

//Loading all user's models
var modelDir = path.join(VXpress.App.getAppDir(), "mvc", "models");
fs.readdirSync(modelDir).forEach(function(file) {
	var modelName = path.basename(file, ".js");
	var myModel = require(path.join(modelDir, file));
	//console.log(myModel);
	//myModel.prepareMetaData();
	//var model = new myModel;	
	//model.init();
	//VXpress.models[modelName] = model;
	VXpress.models[modelName] = myModel;
});