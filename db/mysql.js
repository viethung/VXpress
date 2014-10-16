function VXP_MYSQL(){}

/*
 *	Javascript datatype: string, number, boolean, array, object, undefined and null
 */
VXP_MYSQL.prototype.getJsDataType = function(mysqlDataType) {
	var typeExtract = mysqlDataType.exec(/([a-z]*)/ig);
	//console.log(typeExtract);
	switch(typeExtract)
	{
		case "bit":
		case "tinyint":
		case "smallint":
		case "mediumint":
		case "int":
		case "integer":
		case "bigint":
		case "serial":
		case "bool":
		case "boolean":
			return "integer";		
		case "float":
			return "float";
		case "decimal":
		case "dec":
		case "double":
		case "double precision":
			return 'double';
		case "date":
		case "datetime":
		case "timestamp":
		case "time":
		case "year":
		case "char":
		case "varchar":
		case "tinytext":
		case "smaltext":
		case "text":
		case "longtext":
		case "enum":
		case "set":
		case "binary":
		case "varbinary":
		case "tinyblob":
		case "mediumblob":
		case "longblob":
			return string;
		default:
			return null;
	}
};