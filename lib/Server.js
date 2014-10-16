var fs = require('fs');
//var app = require(__dirname + '/App.js');
var libs = {};
require(__dirname+'/App.js')(libs);
var app = libs.App;
var helper = require(__dirname + '/Helper/Helper.js');

var Server = {};
(function(){
	var self = this;
	self.MimeType = {
        '.png'  :   'image/png',
        '.jpg'  :   'image/jpg',
        '.gif'  :   'image/gif',
        '.ico'  :   'image/x-icon',
        '.css'  :   'text/css',
        '.less' :   'text/less',
        '.js'   :   'application/javascript'
    };
	
	self.serveErrorRaw = function(errorCode, errorContent) {
		app.res.writeHead(errorCode, errorContent, {'Content-Type':'text/html'});
		app.res.end(errorContent);
	};

	self.serveError = function(errorCode, errorContent) {
		var errorObj = {"errorCode":errorCode, "errorContent":errorContent};
		var siteErrorLayoutTemplate = app.getAppVar('siteErrorLayoutTemplate');
		var content = siteErrorLayoutTemplate.replace(/<\?(\w+)\?>/g, function($0, $1) {
			return errorObj[$1];
		});
		app.res.writeHead(200, 'Success', {'Content-Type':'text/html'});
		app.res.end(content);
	};

	self.serveStaticFile = function() {
            var fileName = app.getAppDir() + app.req.url.replace(/\/asset\//g, "/public/");
            var ext = fileName.substr(-4);

            fs.stat(fileName, function (err, stats) {
                if(err || !stats.isFile())
                    self.serveErrorRaw(404, 'File ' + fileName + 'not found');
                else {
                    var modified = true;
                    try {
                        var mtime = new Date(app.req.headers['if-modified-since']);
                        if (mtime >= stats.mtime)
                            modified = false;
                    } catch (e) {
                        console.warn(e);
                    }
                    if(modified) {
                        var headerObj = {
                                "Content-Type": self.MimeType[ext],
                                "Cache-Control":"max-age=2592000, public",  //30 days
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
                    else {	//Cache found, return 304 for not modified
                        app.res.writeHead(304);
                        app.res.end();
                    }
                }
            });
	};

	self.serveViewPage = function(viewFileContent, template, data, pageTitle)
	{
		var viewFileData = [];
		viewFileData['pageTitle'] = ((typeof pageTitle == 'String' && pageTitle != '')?pageTitle+' - ':'')+app.getSiteConfig('siteTitle');		
		viewFileData['pageContent'] = viewFileContent.replace(/<\?(\w+)\?>/g, function($0, $1) {                
			return data[$1];
		});
		viewFileData['pageContent'] = viewFileData['pageContent'].replace(/<\?=(\w+)\.*(\w*)\?>/g, function($0, $1, $2) {
			/*
			console.log('-----------------');
			//console.log(data);
			console.log($0);
			console.log($1);
			console.log($2);
			//console.log(data[$1]);
			console.log('-----------------');
			*/
			if(data.hasOwnProperty($1) && !helper.isObjEmpty(data[$1])) {				
				if($2 === '')
					return require('querystring').stringify(data[$1].attributes);
				else if(data[$1].hasOwnProperty('attributes') && data[$1].attributes.hasOwnProperty($2)) {
					return data[$1].attributes[$2];
				}
				else
					return '';
			}
			else
				return '';
		});

		//console.log(viewFileData['pageContent']);

		var content = template.replace(/<\?(\w+)\?>/g, function($0, $1) {
			return viewFileData[$1];
		});
		app.res.writeHead(200, 'Success', {'Content-Type':'text/html'});
		app.res.end(content);
	};
/*
	self.serveViewPageCache = function(viewFileName, data, pageTitle) {
		var viewFileData = [];
		viewFileData['pageTitle'] = ((pageTitle != '')?pageTitle+' - ':'')+app.getSiteConfig('siteTitle');
		viewFileData['pageContent'] = app.getViewFile(viewFileName).replace(/<\?(\w+)\?>/g, function($0, $1) {
			return data[$1];
		});
		
		
		var template = app.getAppVar('siteLayoutTemplate');
		var content = template.replace(/<\?(\w+)\?>/g, function($0, $1) {
			return viewFileData[$1];
		});
		app.res.writeHead(200, 'Success', {'Content-Type':'text/html'});
		app.res.end(content);
	};
*/
}).apply(Server);

//module.exports = Server;
module.exports = function(lib_holder) {
	lib_holder['Server'] = Server;
}
