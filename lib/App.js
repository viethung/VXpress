var fs = require('fs');
var server;

var App = {};
(function(){
    var self = this;
    var appVars = {};
    var layouts = {};
    var siteConfigs = {};
    var viewFiles = {};
    var appDir = process.cwd();
	var models = {};
	//var libs = {};
	
//	var $_GET = {};
//	var $_POST = {};

    self.req = null;
    self.res = null;
	
	self.getRequestMethod = function() { return self.req.method; };

    self.getLayout = function(layoutName){ return layouts[layoutName]; };
    self.setLayout = function(layoutName, layoutData){ layouts[layoutName] = layoutData; };
    self.getLayouts = function(){ return layouts; };
    self.setLayouts = function(layoutDatas){ layouts = layoutDatas; };

    self.getAppVar = function(varName){ return appVars[varName]; };
    self.setAppVar = function(varName, varData){ appVars[varName] = varData; };
    self.getAppVars = function() { return appVars;};
    self.setAppVars = function(vars) { appVars = vars;};

    self.getSiteConfig = function(cfgName){ return siteConfigs[cfgName]; };
    self.getSiteConfigs = function() { return siteConfigs;};
    self.setSiteConfigs = function(siteConfigDatas) {
        siteConfigs = siteConfigDatas;
        server = require(__dirname+'/Server.js').Server;

        prepareSiteLayoutTemplate();
        prepareSiteErrorLayoutTemplate();
    };
	
	self.setModel = function(modelName, model){ models[modelName] = model; };
	self.getModel = function(modelName){ return models[modelName]; };
	
	//self.setLib = function(libName, lib){ libs[libName] = lib; };
	//self.getLib = function(libName){ return libs[libName]; };

    self.getViewFile = function(viewFileName) { return viewFiles[viewFileName]; };
    self.setViewFile = function(viewFileName, viewFileData) { return viewFiles[viewFileName] = viewFileData; };


    self.getAppDir = function() { return appDir; };

    function prepareSiteLayoutTemplate()
    {
        if(!layouts.siteLayout && siteConfigs["cacheViews"]) {
            var layoutFile = appDir + siteConfigs['siteLayout'];			
            fs.stat(layoutFile, function(err, stats) {
                if(err || !stats.isFile())
                    server.serveError(404, 'Site layout file not found');
                else {
                    fs.readFile(layoutFile, {'encoding':'utf-8'}, function (err, siteLayoutTemplate) {
                        if (err) throw err;
                        appVars['siteLayoutTemplate'] = siteLayoutTemplate;
                    });
                }
            });
        }
    }

    function prepareSiteErrorLayoutTemplate()
    {
        if(!layouts.siteErrorLayout) {
            var errorFile = appDir + siteConfigs['siteErrorLayout'];
            fs.stat(errorFile, function(err, stat) {
                if(err || !stat.isFile())
                    server.serveErrorRaw(errorCode, errorContent);
                else {
                    fs.readFile(errorFile, {'encoding':'utf-8'}, function (err, siteErrorLayoutTemplate) {
                        if (err) throw err;
                        appVars['siteErrorLayoutTemplate'] = siteErrorLayoutTemplate;
                    });
                }
            });
        }
    }
}).apply(App);

//module.exports = App;
module.exports = function(lib_holder) {
	lib_holder['App'] = App;
};