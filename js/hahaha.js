// var app = new Vue({
// 	el: '#app',
// 	data:{
// 		data:[
// 		{
// 			"abc":"aaaaaaaaaaa","企业组织机构代码":"bbbbbbbbbbbbbbbb",

// 			"上级单位":"cccccccccc","集团或者管理部门":"dddddddddddddd"
// 		}
// 		]}
// 	})


var app = new Vue({
	el:"#app",
	data:{
//声明空数组，进行数据接收，最后传递到前端页面
itemList:[]
}
//向data数组里添加数据
mounted:function(){
	this.getData();
}
methods: {
	getData:function () {
		var self = this;
		this.$http.get("https://xiaoyanse.github.io/moban2243/js/list.json").then(function (res) {

			console.log(res);

			for(var i= 0,len=res.body.lists.length;i<len;i++){
				var selData = res.body.lists[i]; 
				var part = res.body.lists[i].name;
				self.itemList.push(selData);
			}


		})
	}
}
});

