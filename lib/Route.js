var libs = {};

var url = require('url');
var qs = require('querystring');
var fs = require('fs');
var util = require('util');
var zlib = require('zlib');

require(__dirname+'/App.js')(libs);
var app = libs.App;
require(__dirname+'/Server.js')(libs);
var server = libs.Server;

String.prototype.firstLetterUpper = function() {
    return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase();
}
/*
Object.defineProperty(Object.prototype, "extend", {
    enumerable: false,
    value: function(from) {
        var props = Object.getOwnPropertyNames(from);
        var dest = this;
        props.forEach(function(name) {
            if (name in dest) {
                var destination = Object.getOwnPropertyDescriptor(from, name);
                Object.defineProperty(dest, name, destination);
            }
        });
        return this;
    }
});
*/

//function Route(req, res) {
function Route() {
//	var self = this;
//	self.res = res;
//	self.req = req;
/*
	self.MimeType = {
		'.png'	:	'image/png',
		'.jpg'	:	'image/jpg',
		'.gif'	:	'image/gif',
		'.ico'	:	'image/x-icon',
		'.css'	:	'text/css',
		'.less'	:	'text/less',
		'.js'	:	'application/javascript'
	};
*/
	var postData = '';
	if(app.req.method === 'POST')
	{
		app.req.on('data', function(data) {
			postData += data;
		});
	}
	//app.req.on('end', function(){		
	//});
}

Route.prototype.funcResponse = function(statusCode, data) {
	var self = this;
	app.res.writeHead(statusCode, '', {'Content-Type':'text/html'});
	app.res.end(data);
}
Route.prototype.CNotFound = function(cToLoad) {
	var self = this;
	if(cToLoad.length === 0)
		self.funcResponse(404, 'Controller not found');
	else
		self.funcResponse(404, 'Controller ' + cToLoad + ' not found');

}
/*
Route.prototype.serveStaticFile = function() {
	var self = this;
	var fileName = process.cwd() + app.req.url;
	var ext = fileName.substr(-4);
	fs.stat(fileName, function (err, stats) {
		if(err || !stats.isFile())
			self.funcResponse(404, 'File ' + fileName + 'not found');
		else {
			var modified = true;
			try {
				var mtime = new Date(app.req.headers['if-modified-since']);
				if (mtime >= stats.mtime) {
					modified = false;
				}
			} catch (e) {
				console.warn(e);
			}
			if(modified) {
				var headerObj = {
					"Content-Type": self.MimeType[ext],
					"Cache-Control":"max-age=2592000, public",	//30 days
					"Last-Modified": stats.mtime
				};

				var rawFile = fs.createReadStream(fileName);
  				var acceptEncoding = app.req.headers["Accept-Encoding"];
				if (!acceptEncoding) {
					acceptEncoding = '';
				}
				// Note: this is not a conformant accept-encoding parser.
				// See http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.3
				if (acceptEncoding.match(/\bdeflate\b/)) {
					headerObj['Content-Encoding'] = 'deflate';
					rawFile = rawFile.pipe(zlib.createDeflate());
				} else if (acceptEncoding.match(/\bgzip\b/)) {
					headerObj['Content-Encoding'] = 'gzip';
					rawFile = rawFile.pipe(zlib.createGzip());
				} 
				app.res.writeHead(200, headerObj);
				rawFile.pipe(app.res);
			}
			else {
				app.res.writeHead(304);
				app.res.end();
			}
		}
	});
}
*/
Route.prototype.Start = function()
{
	var self = this;
	var postData='';
	// Serve static file
	if('GET' == app.req.method && (app.req.url.substr(0,6) === '/asset' || app.req.url === '/favicon.ico')) {
		server.serveStaticFile();
	}
	else
	{
		var url_parts = url.parse(app.req.url, true);
		var r = url_parts.query.r;
		delete url_parts.query.r;
		//app.$_GET = url_parts.query;
		if(r !== '' && typeof r != 'undefined')
			r = r.split('/');
		else
			r = [app.getSiteConfig('defaultController'), null];

		app.req.on('data', function(chunk) {
			postData += chunk;
		});

		app.req.on('end', function() {
			//app.$_POST = qs.parse(postData);
			
			//send data to router
			var cToLoad = app.getAppDir() + '/mvc/controllers/C'+r[0].firstLetterUpper()+'.js';
			fs.stat(cToLoad, function (err, stat) {
				if(err || !stat.isFile)
					self.CNotFound(r[0].firstLetterUpper());
				else {				
					var controller = require(cToLoad);
					var c = new controller();
					c.$_POST = qs.parse(postData);
					var cAction = r[1] || c.defaultAction || 'index';
					if(typeof c[cAction] !== 'function')
						server.serveError(400, 'Bad request');
					else
						c[cAction](url_parts.query);
				}
			});
		});
	}
};
//module.exports = Route;
module.exports = function(lib_holder) {
	lib_holder['Route'] = Route;
}
