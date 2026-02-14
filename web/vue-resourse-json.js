var app = new Vue({
el:"#app",
data:{
//声明空数组，进行数据接收，最后传递到前端页面
itemList:[], 
},
//向data数组里添加数据
mounted:function(){
this.getData();
},
methods: {
getData:function () {
var self = this;
this.$http.get("list_json.json").then(function (res) {
 
console.log(res);
 
//var lens = res.body.lists.length;
//console.log(lens);
//获取了当前数组的长度，为3
for(var i= 0,len=res.body.lists.length;i<len;i++){
//已经获取json数组中的数据，接下来如何传递到前端页面中
//获取全部数据
var selData = res.body.lists[i]; 
//console.log(selData);
 
//获取数组中的部分数据
var part = res.body.lists[i].name;
//console.log(part);
//将获取的数据push到空的数组中itenList，
self.itemList.push(selData);
 
}
})
}
}
});