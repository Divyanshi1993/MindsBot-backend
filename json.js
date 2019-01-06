var obj = {
name :'divya'
}
var objjson = JSON.stringify(obj);
console.log(objjson);


var obj2 = '{"name":"divya","age":26}';
var parseJson = JSON.parse(obj2);
console.log(parseJson.name);
