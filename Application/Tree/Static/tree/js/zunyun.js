//Head 头像点击退出
$('.user>span').mouseover(function(){
    $(this).addClass('active');
    $('.user_fea').show();
});
$('.user').mouseleave(function() {
    $('.user>span').removeClass('active');
    $('.user_fea').hide();
})

// ajax返回数据提示姓名
function build_tips(data) {
	var li = '';
	for(var i in data){
		li += '<li><a href="#">'+data[i]+'</a></li>';
	}
	return '<ul class="fname_tips_li">'+li+'</li>';
}

// 搜索
function search() {
	location.href = "./search.html?keyword="+$('#search_text').val();
}