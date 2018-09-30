var imgs = "";

function showActionSheet() {
	var actionbuttons = [{
		title: "拍照"
	}, {
		title: "相册选取"
	}];
	var actionstyle = {
		title: "选择照片",
		cancel: "取消",
		buttons: actionbuttons
	};
	plus.nativeUI.actionSheet(actionstyle, function(e) {
		if(e.index == 1) {
			getImage();
		} else if(e.index == 2) {
			appendByGallery();
		}
	});
}

function getImage() {
	var cmr = plus.camera.getCamera();
	cmr.captureImage(function(p) {
		plus.io.resolveLocalFileSystemURL(p, function(entry) {
			var localurl = entry.toLocalURL(); //把拍照的目录路径，变成本地url路径，例如file:///........之类的。
			appendFile(localurl);
			console.log("返回路径：" + localurl)
			//                      }
		});
	}, function(error) {

	});
}

// 从相册添加文件 
function appendByGallery() {
	plus.gallery.pick(function(path) {
		appendFile(path); //处理图片的地方
	});
}

// 添加文件
function appendFile(path) {
	var img = new Image();
	img.src = path; // 传过来的图片路径在这里用。
	img.onload = function() {
		var that = this;
		//生成比例 
		var w = that.width,
			h = that.height,
			scale = w / h;
		w = 480 || w; //480  你想压缩到多大，改这里
		h = w / scale;

		//生成canvas
		var canvas = document.createElement('canvas');
		var ctx = canvas.getContext('2d');
		$(canvas).attr({
			width: w,
			height: h
		});
		ctx.drawImage(that, 0, 0, w, h);
		var base64 = canvas.toDataURL('image/jpeg', 1 || 0.8); //1最清晰，越低越模糊。    

		var imgPath = TransferString(base64);
		console.log(imgPath)
		upload(imgPath)
	}
}

function TransferString(content) {
	var string = content;
	try {
		string = string.replace(/\r\n/g, "<br>")
		string = string.replace(/\n/g, "<br>");
	} catch(e) {
		alert(e.message);
	}
	return string;
}

function upload(imgPath) {
	$.ajax({
		type: "post",
		url: imgServerUrl + imgUpload,
		data: {
			base64Data: imgPath,
			dataType: ".jpg"
		},
		success: function(data) {
			console.log("返回路径：" + JSON.stringify(data));
			imgs = '<img src="' + data + '" alt=""/>';
			$('#imgFile').append(imgs);
		},
		error: function(err) {
			console.log("错误：" + JSON.stringify(err))
		}
	});
}

// 照片上传开始；
function upLoadImg(_this) {
	var input = document.getElementById('file');
	var path = input.files[0];
	photoCompress(path, 640, function(base) {
		upload(base);
	});

}

function upload(file) {
	var name = "检查打分拍照记录";
	var tr = '';
	$.ajax({
		url: api.development + "uploadFile",
		type: "post",
		data: {
			file: file,
			name: name,
			type: 2,
			pid: taskItemId
		},
		dataType: "json",
		async: false,
		success: function(res) {
			res.forEach(function(i) {
				tr +=
					'<div class="imgbox">' +
					'<img src="' + api.imgUrl + i.url + '" data-id="' + i.id + '">' +
					'</div>';
			})
			$('.imgboxList').html(tr);
		}
	})
}

function photoCompress(file, w, objDiv) {
	var ready = new FileReader();
	ready.readAsDataURL(file);
	ready.onload = function() {
		var re = this.result;
		canvasDataURL(re, w, objDiv)
	}
}

function canvasDataURL(re, w, objDiv) {
	var newImg = new Image();
	newImg.src = re;
	var imgWidth, imgHeight, offsetX = 0,
		offsetY = 0;
	newImg.onload = function() {
		var img = document.createElement("img");
		img.src = newImg.src;
		imgWidth = img.width;
		imgHeight = img.height;
		var canvas = document.createElement("canvas");
		var ctx = canvas.getContext("2d");
		ctx.clearRect(0, 0, w, w);
		if(imgWidth > imgHeight) {
			imgWidth = w * imgWidth / imgHeight;
			imgHeight = w;
		} else {
			imgHeight = w * imgHeight / imgWidth;
			imgWidth = w;
		}
		canvas.width = imgWidth;
		canvas.height = imgHeight;
		ctx.drawImage(img, offsetX, offsetY, imgWidth, imgHeight);
		var base64 = canvas.toDataURL("image/jpeg", 0.7);
		if(typeof objDiv == "object") {
			objDiv.appendChild(canvas);
		} else if(typeof objDiv == "function") {
			objDiv(base64);
		}
	}
}
//图片上传结束；

//图片点击事件
$('.imgList').on('click', '.imgbox', function() {
	var imageId = $(this).find("img").attr("data-id")
	imgView($(this), imageId)
})

var bigImgBox = $('.bigImgBox');
var bigImgs = $('.bigImgs');

function imgView(_this, imageId) {
	//执行预览
	var _index = _this.index('.imgbox');
	bigImgs.attr('data-index', _index);
	var imgSrc = new Array();

	$('.imgList .imgbox').each(function(i) {
		imgSrc[i] = $(this).find('img').attr('src');
	});
	for(var i = 0; i < imgSrc.length; i++) {
		var html =
			'<div class="Img">' +
			'<img src="' + imgSrc[i] + '" data-id="' + imageId + '">' +
			'<p>图片名称</p>' +
			'</div>';
		bigImgs.append(html);
	};
	bigImgs.find('img').each(function() {
		var w = this.width;
		var h = this.height;
		var par = $(this).parent();
		par.css({
			'position': 'relative',
			'top': '50%'
		});
		if(w / h > 1.2) {
			this.style.width = '100%';
		} else {
			this.style.height = '80%';
		}
	});
	bigImgBox.fadeIn();
	var curImg = bigImgs.find('.Img').eq(_index)
	curImg.show().css({
		'margin-top': -0.5 * curImg.height() + 'px'
	});
	bigImgs.find('.Img').on('swipeleft', function() {
		var _this = $(this);
		var _index = _this.index();
		if(_index == (imgSrc.length - 1)) {
			layer.open({
				className: 'tipMask',
				content: '当前为最后一张，已无更多',
				shade: false, //关闭遮罩层
				time: 1 //1秒后自动关闭
			});
		} else {
			_this.animate({
				'margin-left': -(this.width)
			}, 300, function() {
				var nextImg = _this.next()
				nextImg.fadeIn().css({
					'margin-top': -0.5 * nextImg.height() + 'px'
				});
				_this.css({
					'margin-left': 0,
					'display': 'none'
				})
			});
			bigImgs.attr('data-index', _index + 1);
		}
	}).on('swiperight', function() {
		var _this = $(this);
		var _index = _this.index();
		if(_index == 0) {
			layer.open({
				className: 'tipMask',
				content: '当前为第一张，已无更多',
				shade: false, //关闭遮罩层
				time: 1 //1秒后自动关闭
			});
		} else {
			_this.animate({
				'margin-left': this.width
			}, 300, function() {
				var prevImg = _this.prev()
				prevImg.fadeIn().css({
					'margin-top': -0.5 * prevImg.height() + 'px'
				});
				_this.css({
					'margin-left': 0,
					'display': 'none'
				})
			});
			bigImgs.attr('data-index', _index - 1);
		}
	});
}

//旋转图片事件
var n = 0;
$('.rotateImg').on('click', function(e) {
	var _index = bigImgs.attr('data-index');
	n++;
	bigImgs.find('.Img').eq(_index).find('img').css({
		'-webkit-transform': 'rotate(' + 90 * n + 'deg)',
		'transform': 'rotate(' + 90 * n + 'deg)'
	});
	e.stopPropagation();
})

//删除图片事件
$('.delImg').on('click', function(e) {
	var comment = $('#comment').val();
	$.ajax({
		url: api.development + "saveScore.json",
		type: "post",
		data: {
			checkListItem: id,
			rank: rank,
			comment: comment,
			taskId: taskId
		},
		dataType: "json",
		success: function(po) {
			console.log(po)
		}
	});
	layer.open({
		className: 'exitMask',
		content: '你确定要删除此照片吗？删除后将无法恢复!',
		btn: ['确定', '取消'],
		yes: function(index) {
			var _index = bigImgs.attr('data-index');
			var _this = bigImgs.find('img').eq(_index);
			$.ajax({
				url: api.development + "delImage.json",
				type: "post",
				data: {
					imageId: _this.attr("data-id")
				},
				dataType: "json",
				async: false,
				success: function(po) {
					layer.closeAll();
					window.location.reload();
				}
			})
		}
	});
	e.stopPropagation();
})

//关闭弹出
bigImgBox.on('click', function() {
	bigImgs.html('')
	bigImgBox.fadeOut();
})