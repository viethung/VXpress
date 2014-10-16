var libs = {};
var util = require('util');
require(__dirname + '/App.js')(libs);
var app = libs.App;
var helper = require(__dirname + '/Helper/Helper.js');


//var _models	= {};
//var _attributes = {};
//var metaColumns = {};
//var isNewRecord = false;

function setIsNewRecord(yes){ isNewRecord = yes; }
function getIsNewRecord(){ return isNewRecord; }

function Model() {
	this.primaryKey = '';
	this.attributes = {};
	//this.metaColumns = {};
	this.errors = {};
	this.isNewRecord = true;
	setIsNewRecord(true);
	this.prepareMetaData();
};
Model.prototype.tableName = '';
Model.prototype.modelId = '';
Model.prototype.metaColumns = {};
//Model.prototype.init = function() { this.prepareMetaData(); };

Model.prototype.prepareMetaData = function()
{
	if(helper.isObjEmpty(this.metaColumns))
	{
		var self = this;
		var q = "SHOW FIELDS FROM `"+app.getSiteConfig('database').dbname+"`.`"+this.tableName+"`";
		console.log(q + ' | ' + helper.isObjEmpty(this.metaColumns));
		app.dbpool.getConnection(function(err, conn) {
			conn.query(q, function(err, results)
			{
				for(var i=0; i < results.length; i++)
				{
					var fieldName = results[i].Field;
					var fieldDefault = results[i].Default || null;
					if(results[i].Key === 'PRI') self.primaryKey = fieldName;
					self.metaColumns[fieldName] = {
						"type"		: results[i].Type,
						"require"	: (results[i].Type==='NO')?false:true,
						"default"	: fieldDefault,
						"unique"	: (results[i].Key==='UNI')?true:false
					};
				}
				conn.end();
			});
		});
	}
};
Model.prototype.getMetaColumns = function()
{
	return this.metaColumns;
};
Model.prototype.getColumnDefaultValue = function(colName)
{
	return this.metaColumns[colName].default;
};

Model.prototype.findById = function(id, conditions, callback)
{
	var self = this;
	var q = "SELECT * from `"+app.getSiteConfig('database').dbname+"`.`"+this.tableName+"` WHERE `"+this.primaryKey+"`=?";
	var keys = Object.keys(conditions);
	if(keys.length > 0)
		q += " AND ?";
	app.dbpool.getConnection(function(err, conn) {
		conn.query(q, [id, conditions], function(err, results) {
			//self.attributes = results[0];
			conn.end();
			if(typeof callback == 'function')
				callback(results);
		});
	});
};
Model.prototype.findByAttributes = function()	//attrObj, conditions, params, callback
{
	var attrObj = arguments[0];
	var callback;
	var conditions = {};
	var params = '';

	for(var i=1; i<arguments.length; i++)
	{
		var ArgType = typeof arguments[i];
		//console.log(ArgType);
		switch(ArgType)
		{
			case 'object':
				conditions = arguments[i];
				break;
			case 'string':
				params = arguments[i];
				break;
			case 'function':
				callback= arguments[i];
				break;
		}
	}
	
	
	var self = this;
	var q = "SELECT * from `"+app.getSiteConfig('database').dbname+"`.`"+this.tableName+"` WHERE ? ";
	if(Object.keys(conditions).length > 0)
		q += "? ";
	q += params;
	
	app.dbpool.getConnection(function(err, conn) {
		var query = conn.query(q, [attrObj, conditions], function(err, results) {
			if(typeof callback == 'function')
			{
				if(results != null && results.length) {
					self.attributes = results[0];
					callback(true, err);	//results
				}
				else {
					self.attributes = {};
					callback(false, err);
				}
			}
			conn.end();
		});
	});
};
Model.prototype.findAllByAttributes = function()	//attrObj, conditions, callback
{
	var attrObj = arguments[0];
	var callback;
	var conditions = {};
	if(typeof arguments[1] == 'function')
		callback= arguments[1];
	else {
		condition = arguments[1];
		callback= arguments[2];
	}
	
	var q = "SELECT * from `"+app.getSiteConfig('database').dbname+"`.`"+this.tableName+"` WHERE ?";
	var keys = Object.keys(conditions);
	if(keys.length > 0)
		q += " ?";
	app.dbpool.getConnection(function(err, conn) {
		var query = conn.query(q, attrObj, function(err, results) {
			//self.attributes = results;
			conn.end();
			if(typeof callback == 'function')
				callback(results);
		});
		//console.log(query);
	});
};
//Model.prototype.test = function() { console.log('Model test function is called'); };
Model.prototype.query = function(q) {
	app.dbpool.getConnection(function(err, conn) {
		conn.query(q, function(err, results) {
			self.attributes = results;
			conn.end();
		});
	});
};
Model.prototype.attributeNames = function() {
	var self = this;
	var retArr = [];
	for(key in self.attributes) {
		if(self.attributes.hasOwnProperty(key))
			retArr.push(key);
	}
	return retArr;
};

Model.prototype.getAttributes = function(names) {
	var self = this;
	
	var values = [];
	for(name in self.attributes) {
		if(self.attributes.hasOwnProperty(name))
			values[name] = self.attributes.name;
	}
	
	if(util.isArray(names))
	{
		var values2 = [];
		names.forEach(function(name) {
			values2[name] = values.name || null;
		});
		return values2;
	}	
	else
		return values;
};

Model.prototype.setAttributes = function(values, safeOnly) {
	var self = this;
	safeOnly = safeOnly || true;
	if(!util.isArray(values))
		return;
	
	for(name in values) {
		if(values.hasOwnProperty(name))
			self.name = values.name;
	}
};

//module.exports = Model;

module.exports = function(lib_holder) {
	lib_holder['Model'] = Model;
}