var fs = require('fs');
//var app = require(__dirname + '/App.js');
//var server = require(__dirname + '/Server.js');
var libs = {};
require(__dirname+'/App.js')(libs);
var app = libs.App;
require(__dirname+'/Server.js')(libs);
var server = libs.Server;
var helper = require(__dirname + '/Helper/Helper.js');

function Controller() {
	this.layout = 'main';
	this.errorFile = 'error.html';
	this.menu = new Array();
	this.breadcrumbs = new Array();
	this.defaultAction = 'index';
	this.pageTitle = '';

	this.moduleId = '';
	this.controllerId = '';
//	this.req = null;
//	this.res = null;
}
Controller.prototype.$_GET = {};
Controller.prototype.$_POST = {};

/*
Controller.prototype.init = function(opts) {
	var self = this;
	self.res = opts.res || self.res;
	self.req = opts.req || self.req;
};
*/

/*
 *	get/set layout
 */
Controller.prototype.setLayout = function(newLayout) {
	var self = this;
	self.layout = newLayout;
};
Controller.prototype.getLayout = function() {
	var self = this;
	return self.layout;
};

/*
 *	get/set menu
 */
Controller.prototype.setMenu = function(newMenu) {
        var self = this;
        self.menu = newMenu;
};
Controller.prototype.getMenu = function() {
        var self = this;
        return self.menu;
};

/*
 *	get/set breadcrumbs
 */
Controller.prototype.setBreadcrumbs = function(newBreadcrumbs) {
        var self = this;
        self.breadcrumbs = newBreadcrumbs;
};
Controller.prototype.getBreadcrumbs = function() {
        var self = this;
        return self.breadcrumbs;
};

/*
 *	get/set defaultAction
 */
Controller.prototype.setDefaultAction = function(newDefaultAction) {
        var self = this;
        self.defaultAction = newDefaultAction;
};
Controller.prototype.getDefaultAction = function() {
        var self = this;
        return self.defaultAction;
};

/*
 *      get/set pageTitle
 */
Controller.prototype.setPageTitle = function(newPageTitle) {
        var self = this;
        self.pageTitle = newPageTitle;
};
Controller.prototype.getPageTitle = function() {
        var self = this;
        return self.pageTitle;
};

/*
 *      get/set controllerId
 */
Controller.prototype.setControllerId = function(newControllerId) {
        var self = this;
        self.controllerId = newControllerId;
};
Controller.prototype.getControllerId = function() {
        var self = this;
        return self.controllerId;
};

/*
 *      get/set moduleId
 */
Controller.prototype.setModuleId = function(newModuleId) {
        var self = this;
        self.moduleId = newModuleId;
};
Controller.prototype.getModuleId = function() {
        //var self = this;
        return this.moduleId;
};

/*
 *      get/set response
 */
/*
Controller.prototype.setResponse = function(newResponse) {
        var self = this;
        self.response = newResponse;
};
Controller.prototype.getResponse = function() {
        var self = this;
        return self.response;
};
*/

Controller.prototype.getViewFile = function(viewFile) {
	var self = this;
        if(viewFile.charAt(0) === '/')
            return app.getAppDir() + '/mvc/views' + viewFile + '.html';
        else
            return process.cwd() + '/mvc/views/' + self.controllerId + '/' + viewFile + '.html';
};

//Controller.prototype.getLayoutFile = function() {
//	var self = this;
//	return process.cwd() + '/mvc/views/layout/' + self.layout + '.html';
//}

//Controller.prototype.getErrorFile = function() {
//	return process.cwd() + '/mvc/views/layout/' + this.errorFile;
//}

Controller.prototype.redirect = function(uri, params) {
	var server = "http://" + app.req.headers.host;
	var getParams = require('querystring').stringify(params);
	var myUri = '';
	if(uri.match(/\/\w+\/\w+/))
		myUri = uri.replace(/\//, '/?r=');
	else if(uri.match(/\w+\/\w+/))
		myUri = '/?r=' + uri;
	else
		myUri = '/?r=' + this.getControllerId() + '/' + uri;
	app.res.writeHead(301, {Location: server + myUri + '&' + getParams});
	app.res.end();
};

/*
 * Render view file for embedded somewhere 
 * @param viewFile: string: view file name
 * @param data: array/object? could be null
 * @param ret: return render view or not, default to false
 */

Controller.prototype.renderPartial = function(viewFile, data, cbFunc)
{
    var self = this;
//  var tData = new Array();
    var retObj = null;
    data = data || null;

    var viewFileName = self.getViewFile(viewFile);
    var template = '';
	var viewFileContent = app.getViewFile(viewFileName);
	var cacheViews = app.getSiteConfig("cacheViews");
	
	if(viewFileContent && cacheViews)
	{
		var content = viewFileContent.replace(/<\?(\w+)\?>/g, function($0, $1) {
			return (data != null && data.hasOwnProperty($1))?data[$1]:'';
		});
		retObj = {"code":200, "content":content};
		if(typeof cbFunc === 'function')
			cbFunc(retObj);
		else
			return retObj;
	}
	else
	{
	    fs.stat(viewFileName, function(err, stats) {
    	    if(err || !stats.isFile())
				server.serveError(404, "View file not found");
	        else {
				fs.readFile(viewFileName, {'encoding':'utf-8'}, function (err, viewFileContent) {
					if(err) throw err;
					if(cacheViews)
						app.setViewFile(viewFileName, viewFileContent);

					var content = viewFileContent.replace(/<\?(\w+)\?>/g, function($0, $1) {
						return (data != null && data.hasOwnProperty($1))?data[$1]:'';
					});
					retObj = {"code":200, "content":content};
					if(typeof cbFunc === 'function')
						cbFunc(retObj);
					else
						return retObj;
				});
	        }
    	});
	}
};

/*
 * Render view file and response to request
 * @param viewFile: string: view file name
 * @param data: array/object? could be null 
 * @param ret: return render view or not, default to false
 */
Controller.prototype.render = function(viewFile, data)	//, ret)
{
    var self = this;
    data = data || null;
    var viewFileName = self.getViewFile(viewFile);
    var cacheViews = app.getSiteConfig("cacheViews");

    if(app.getViewFile(viewFileName) && cacheViews) {
        var viewFileContent = app.getViewFile(viewFileName);
        var template = app.getAppVar('siteLayoutTemplate');
        server.serveViewPage(viewFileContent, template, data, self.pageTitle);
    }
    else
    {
        fs.stat(viewFileName, function(err, stats) {
            if(err || !stats.isFile())
                server.serveError(404, "View file not found");
            else {
                fs.readFile(viewFileName, {'encoding':'utf-8'}, function (err, viewFileContent) {                
                    if (err) throw err;
                    if(cacheViews)	//Cache view
                        app.setViewFile(viewFileName, viewFileContent);

                    var layoutFile = app.getAppDir() + app.getSiteConfig('siteLayout');
                    fs.stat(layoutFile, function(err, stats) {
                        if(err || !stats.isFile())
                            server.serveError(404, 'Site layout file not found');
                        else {
                            fs.readFile(layoutFile, {'encoding':'utf-8'}, function (err, siteLayoutTemplate) {
                                if (err) throw err;
								server.serveViewPage(viewFileContent, siteLayoutTemplate, data, self.pageTitle);
                            });
                        }
                    });
                });
            }
        });
    }
};


//module.exports = Controller;
module.exports = function(lib_holder) {
	lib_holder['Controller'] = Controller;
}
