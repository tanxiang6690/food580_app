/**
 * Created by 15045 on 2018/2/1.
 */
var obj = {}
obj.init = function() {
	obj.wHeight();

}

$(document).ready(obj.init);

// 接口地址管理
var api = {
	// 开发环境
	//development: 'http://192.168.10.116:8080/muyuan/manage/app/',
	// 生产环境
	development: 'http://www.food580.cn:8888/manage/app/',
	imgUrl: 'http://www.food580.cn:8888'
}

//屏幕高度
obj.wHeight = function() {
	var height = $(window).height();
	$(".warpMain").css("height", height);
}
//核查项清单-分类子项目与检查项下拉效果
obj.lslSlideDownFunc = function(element, downCon, fn) {
	element.on('click', function() {
		var _this = $(this);
		if(_this.hasClass('hover')) {
			_this.removeClass('hover').siblings('.sub_list').hide();

		} else {
			_this.addClass('hover').siblings('.sub_list').show();
		}
		if(fn) {
			fn();
		}
	})
};
//长按事件
obj.pressEvent = function(element, clickFn, longPressFn) {
	var _this;
	element.unbind('touchstart touchmove touchend');
	element.on({
		touchstart: function(e) {
			_this = $(this);
			timeOutEvent = setTimeout(function() {
				timeOutEvent = 0;
				//"长按事件触发发;
				longPressFn(_this);
			}, 1000);
			e.preventDefault();
		},
		touchmove: function() {
			clearTimeout(timeOutEvent);
			timeOutEvent = 0;
		},
		touchend: function() {
			clearTimeout(timeOutEvent);
			if(timeOutEvent != 0) {
				//你这是点击，不是长按;
				clickFn(_this);
			}
			// return false;
		}
	});

}

//单选事件
obj.radioFunc = function(ele, fn) {
	ele.on('click', '.radio-nor', function() {
		var _this = $(this);
		if(!_this.hasClass('radio-press')) {
			_this.parents('.radioBox').find('.radio-nor').removeClass('radio-press');
			_this.addClass('radio-press');
			if(fn) {
				fn();
			}
		}
	})
}
//选项卡切换
obj.TabCon = function(tabTitle, tabCon, fn) {
	tabTitle.click(function() {
		$(this).addClass("hover").siblings().removeClass("hover");
		var _index = $(this).index();
		tabCon.hide().eq(_index).show();
		if(fn) {
			fn(_index);
		};
	});
}
//tab切换
obj.Tab = function(tabTitle, fn) {
	tabTitle.click(function() {
		$(this).addClass("hover").siblings().removeClass("hover");
		var _index = $(this).index();
		if(fn) {
			fn(_index);
		};
	});
}
//弹性滚动方法
obj.MyScroll = function(myScroll, Main, pullUpAction, pullDownAction, fn2) {
	//pullDownAction下拉刷新数据   pullUpAction翻页功能加载数据刷新
	//动画部分
	var pullDownEl = $('#pullDown');
	var pullDownOffset = pullDownEl.height();
	var pullUpEl = $('#pullUp');
	var pullUpOffset = parseInt(pullUpEl.css('height'));
	myScroll = new iScroll(Main, {
		//useTransition: true,
		//topOffset: pullDownOffset,
		onScrollStart: function() {
			startY = myScroll.y;
		},
		onRefresh: function() {
			//这里执行刷新操作
			if(pullDownEl.hasClass('loading')) {
				pullDownEl.removeAttr('class');
				pullDownEl.find('.pullDownLabel').html('下拉刷新');
			} else if(pullUpEl.hasClass('loading')) {
				pullUpEl.removeAttr('class');
				pullUpEl.find('.pullUpLabel').html('上拉加载更多');
			}
		},

		onScrollMove: function() {
			//上拉刷新下拉加载,pullUp翻页功能刷新，pullDown下拉刷新
			if(pullUpAction) {
				if(this.y > 5 && !pullDownEl.hasClass('flip')) {
					pullDownEl.attr('class', 'flip');
					pullDownEl.find('.pullDownLabel').html('释放刷新');
					this.minScrollY = 0;
				} else if(this.y < 5 && pullDownEl.hasClass('flip')) {
					pullDownEl.removeAttr('class');
					pullDownEl.find('.pullDownLabel').html('下拉刷新...');
					// this.minScrollY = -pullDownOffset;
				} else if(this.y < (this.maxScrollY - 5) && !pullUpEl.hasClass('flip') && this.maxScrollY < 0) {
					pullUpEl.attr('class', 'flip');
					pullUpEl.find('.pullUpLabel').html('释放刷新');
					this.maxScrollY = this.maxScrollY;
				} else if(this.y > (this.maxScrollY + 5) && pullUpEl.hasClass('flip')) {
					pullUpEl.removeAttr('class');
					pullUpEl.find('.pullUpLabel').html('上拉加载更多...');
					//this.maxScrollY = pullUpOffset;
				}
			};
			if(fn2) {
				fn2(startY);
			};
		},
		onZoom: function() {
			console.log(22)
		},
		onScrollEnd: function() {
			if(pullUpAction) {
				if(pullDownEl.hasClass('flip')) {
					pullDownEl.attr('class', 'loading');
					pullDownEl.find('.pullDownLabel').html('加载中');
					//下拉刷新
					if(pullDownAction) {
						pullDownAction();
					} else {
						setTimeout(function() {
							myScroll.refresh();
						}, 500)
					};
				} else if(pullUpEl.hasClass('flip')) {
					pullUpEl.attr('class', 'loading');
					//上拉加载
					pullUpEl.find('.pullUpLabel').html('加载中');
					pullUpAction();
				}
				//myScroll.refresh();
			}
			//this.refresh();
			if(fn2) {
				fn2(startY);
			};
		}
	}); //,scrollbars:true
	document.addEventListener('touchmove', function(event) {
		// 判断默认行为是否可以被禁用
		if(event.cancelable) {
			// 判断默认行为是否已经被禁用
			if(!event.defaultPrevented) {
				event.preventDefault();
			}
		}
	}, false);
	return myScroll;
};

obj.onFocus = function(url, focusObjectId, focusType) { //关注
	$.ajax({
		type: "post",
		url: url,
		data: {
			focusObjectId: focusObjectId,
			focusType: focusType
		},
		async: false,
		success: function(data) {
			if(data == -1) {
				layer.open({
					className: 'tipMask',
					content: '关注失败,用户未登录',
					shade: false, //关闭遮罩层
					time: 1 //2秒后自动关闭
				});
				focusFlag = false;
			} else if(data == 0) {
				layer.open({
					className: 'tipMask',
					content: '关注失败',
					shade: false, //关闭遮罩层
					time: 1 //2秒后自动关闭
				});
				focusFlag = false;
			} else {
				focusFlag = true;
			}
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			console.log(XMLHttpRequest.status);
			console.log(XMLHttpRequest.readyState);
			console.log(textStatus);
			obj.tip("网络繁忙，请稍后重试");
		}
	});
	return focusFlag;
};

// 获取地址栏参数:name==想要获取的参数，传入字符串
function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
	var r = window.location.search.substr(1).match(reg); //匹配目标参数
	if(r != null) return unescape(r[2]);
	return null; //返回参数值
}

//设置缓存：key:string
function setCache(key, value) {
	if(key == ''){
		return false
	};
	localStorage.setItem(key, value);
}

//读取缓存：key：string
function getCache(key) {
	return localStorage.getItem(key);
}