function Helper(){}
Helper.prototype.isObjEmpty = function(obj){ return (Object.keys(obj).length === 0); };


module.exports = new Helper;
//module.exports = function(lib_holder) {
//	lib_holder['Helper'] = new Helper;
//}