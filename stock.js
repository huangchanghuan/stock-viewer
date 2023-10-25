var mode1=true;
var mode2=true;

//将data数据以桌面通知的方式显示给用户
function _showDataOnPage(data){

	//显示一个桌面通知
	if(window.webkitNotifications){
		var notification = window.webkitNotifications.createNotification(
			'images/icon.png',  // icon url - can be relative
			'广告',  // notification title
			data  // notification body text
		);
		notification.show();
		// 设置3秒后，将桌面通知dismiss
		setTimeout(function(){notification.cancel();}, 3000);

	}else if(chrome.notifications){
		var opt = {
			type: 'basic',
			title: '广告',
			message: data,
			iconUrl: 'images/icon.png',
		}
		chrome.notifications.create('', opt, function(id){
			// setTimeout(function(){
			// 	chrome.notifications.clear(id, function(){});
			// }, 3000);
		});

	}else{
		console.log('亲，你的浏览器不支持啊！');
	}

}
// 操作本地数据
;(function($,undefined){
	var data = {
		map : {},
		order : []
	}
	window.data = data;
	var localName = "stock_list";
	var sync2Local = function(){
		var data2Local = [];
		for(var i = 0,len = data.order.length; i < len; i++){
			var item = data.map[data.order[i]];
			//todo item.remove("name");
			data2Local.push(item);
		}
		var obj = {
			value : data2Local,
			lastUpdate : +new Date()
		};
		localStorage.setItem(localName, JSON.stringify(obj));
	}
	var saveItem = function(obj){
		data.order.unshift(obj.key); // 将元素加在数组开头，后添加的排在最前
		data.map[obj.key] = obj;
		sync2Local();
	}
	var editItem = function(obj){
		data.map[obj.key]['remark'] = obj.remark;
		sync2Local();
	}
	var editItemUpper = function(obj){
		data.map[obj.key]['upper'] = obj.upper;
		sync2Local();
	}
	var editItemLower = function(obj){
		data.map[obj.key]['lower'] = obj.lower;
		sync2Local();
	}
	var removeItem = function(key){
		var position = $.inArray(key, data.order);
		if(position != -1){
			delete data.map[key];
			data.order.splice(position, 1);
		}
		sync2Local();
	}
	/* 排序 */ 
	var sortItem = function(queue){
		if($.isArray(queue)){
			if(queue.join("") == data.order.join("")){
				return false;
			}
			data.order = queue;
			sync2Local();

			return true;
		}
		return false;
	}
	function getLocalData(){
		var data = localStorage.getItem(localName);
		var arrData = [];
		if(data){
			try{
				var obj = JSON.parse(data);
				arrData = obj && obj.value;
			}catch(e){

			}
		}
		return arrData;
	}
	// 初始化数据
	(function(){
		var arr = getLocalData();
		arr.forEach(function(item,index){
			data.order.push(item.key);
			data.map[item.key] = item;
		});
	})();
	var LocalData = {
		name : "stock_list",
		add : function(obj, cb){
			if(obj){
				saveItem(obj);
				cb && cb();
			}
		},
		remove : function(key, cb){
			if(key){
				removeItem(key);
				cb && cb();
			}
		},
		edit : function(obj,cb){
			if(obj.key && obj.remark != undefined){
				editItem(obj);
			}
			cb && cb();			
		},
		editUpper : function(obj,cb){
			if(obj.key && obj.upper != undefined){
				editItemUpper(obj);
			}
			cb && cb();
		},
		editLower : function(obj,cb){
			if(obj.key && obj.lower != undefined){
				editItemLower(obj);
			}
			cb && cb();
		},
		getAll : function(cb){
			var res = [];
			data.order.forEach(function(item,index){
				var obj = data.map[item];
				//过滤持仓
				// console.log(obj)
				res.push(obj);


			});
			if(cb){
				cb(res);
				return;
			}
			return res;
		},
		getOneByKey : function(key){
			var res ;
			data.order.forEach(function(item,index){
				var obj = data.map[item];
				if (obj['key']===key){
					res = obj;
				}
			});
			return res;
		},
		getKeys : function(){
			return data.order;
		},
		num : function(){
			return data.order.length;
		},
		isExist : function(key){
			if($.inArray(key, data.order) != -1){
				return true;
			}
			return false;
		},
		sort : function(queue,cb){
			var sort = sortItem(queue);
			
			if(sort){
				cb && cb();
			}
		}
	}

	window.LocalData = LocalData;
})(jQuery);

// 根据不同类型的代码，生成不同的url style="display: none"
function getLinkUrl(obj){
	var linkUrl = '', imgUrl = '';
        linkUrl = 'http://gu.qq.com/' + obj.key;
	// imgUrl = 'http://imgnode.gtimg.cn/hq_img?code='+obj.key+'&type=minute&size=3&proj=news';
	// imgUrl = 'http://image.sinajs.cn/newchart/min/n/sh600519.gif'+obj.key+'&type=minute&size=3&proj=news';
	imgUrl = 'http://image.sinajs.cn/newchart/'+obj.stockShowType+'/n/'+obj.key+'.gif?';
	return {
		linkUrl : linkUrl,
		imgUrl : imgUrl
	};
}

;(function($,undefined){
	var sTplList = ['<li id="{key}" data-type="{type}"">',
						'<span class="top" title="置顶" >T</span>',
						'<span class="down" title="底部" >D</span>',
						'<span class="code"><a target="_blank" href="#">{code}</a></span>',
						'<span class="name"><a target="_blank" href="{url}">{name}()</a></span>',
						'<span class="price"><a target="_blank" href="#">--</a></span>',
						'<span class="grow"><a target="_blank" href="#">--</a></span>',
						'<span  style="width: 80px" class="{key} upper">--</span>',
						'<span  style="width: 80px" class="{key} lower">--</span>',
						'<a href="#" class="delete" data-key="{key}">X</a>',
						// '<span class="hands">--</span>',
						// '<span class="remark {remarkFlag}" title="{remark}">R</span>',
					'</li>'].join("");	
	var Stock = {
		name : LocalData.name,
		timerSort : null,
		_renderStockStruct : function(obj){
			var self = this;
			var dataList = obj ? [].concat(obj) : LocalData.getAll();

			var sHtml = '';
			dataList.forEach(function(item){
				var itemObj = $.extend({},item);
				itemObj.code = item.key.slice(2);
				itemObj.remarkFlag = item.remark ? "remarked" : "";
				itemObj.url = getLinkUrl(itemObj).linkUrl;
				sHtml += utils.tmpl(sTplList,itemObj);
			});
			return sHtml;
		},
		// 请求数据
		_loadStockData : function(key,callback){
			var baseDataUrl = 'http://sqt.gtimg.cn/utf8/';
			var localDataUrl = localStorage.getItem('stock_dataUrl');

			if(localDataUrl && localDataUrl != 'undefined'){
				baseDataUrl = localStorage.getItem('stock_dataUrl')
			}
			var url = baseDataUrl + 'q=' + key + '&_t=' + (+new Date());

			utils.ajax(url,function(res){
				// var ret = new Function('return ' + res)();
				var arrRet = res.trim().split(";");
				var obj = {};
				arrRet.forEach(function(item, index){ 
					var arr = item.trim().split("="); // trim是要把回车干掉
					if(arr.length > 1){
						obj[arr[0]] = arr[1].replace('"','');
					}
				})	
				
				var data = {};
				for(var key in obj){
					var arr = obj[key].split("~");
					var temp = {
						key : key,
						name : arr[1],
						code : arr[2],
						price : arr[3],
						growRate : arr[32] + '',
						hands : (arr[38] ? arr[38] : '0.00') + '%',
						className : ''
					}
					if(arr[3] == '0.00'){
						temp.price = "停牌";
						temp.growRate = '--';
						temp.hands = '--';
					} 
					if(parseFloat(temp.growRate) > 0){
						temp.className = 'increase';
					}else if(parseFloat(temp.growRate) < 0){
						temp.className = 'reduce';
					}
					data[key] = temp;
				}

				callback(data);
			})
		},
		addStock : function(queryObj){
			var self = this;
			if(LocalData.isExist(queryObj.key)){
				$warning = $('#warning');
				self.scrollTo(queryObj.key);
				$('#' + queryObj.key).addClass('fade');
				$warning.show().css('opacity', 1).html('您要添加的股票已经在自选股中!');
				
				$warning.animate({
					opacity:0
				}, 3000, function(){
					$warning.hide();
				});
				return;
			}
			if(LocalData.num() >= 200){
				$warning = $('#warning');
				$warning.show().css('opacity', 1).html('您的自选股中已经达到200个的上限，请删除一些再添加!');
				$warning.animate({
					opacity:0
				}, 3000, function(){
					$warning.hide();
				});
				return;
			}
			var obj = $.extend({}, queryObj);

			this.addStockData(obj);

			LocalData.add(obj);

			this.updateStockData();
		},
		scrollTo: function(key){
			var $listWrap = $('.zxg-bd');
			var $el = $('#' + key);
			var offsetTop = $el.offset().top - $('.zxg-list').offset().top;
			console.log(offsetTop)
			if(offsetTop> 0){
				$listWrap.scrollTop(offsetTop - 30+30);
			}

		},
		sortStock : function(cb){
			var self = this;
			var queue = [];
			$('.zxg-list li').each(function(index,item){
				if(!item.id){
					return;
				}
				queue.push(item.id);
			})
			
			LocalData.sort(queue,function(){
				$(".tipStock").show();
				clearTimeout(self.timerSort);
				self.timerSort = setTimeout(function(){
					$(".tipStock").hide();
				},1000);

				cb && cb();
			});
		},
		addStockData : function(obj){
			if(!obj.key){
				return;
			}
			var item = $.extend({}, obj);
			item.code = item.key.slice(2);
			item.url = getLinkUrl(item).linkUrl;
			var sHtml = utils.tmpl(sTplList,item);

			$('#zxg .zxg-list').prepend(sHtml);
		},
		updateStockData : function(cb){
			var keys = LocalData.getKeys();
			var NUM = 30;	// 每30个一组发请求，分组后异步并行ajax处理的

			if(keys.length == 0){
				$("#zxg .loading").hide();
				return;
			}
			
			for(var i = 0,len = Math.ceil(keys.length/NUM); i < len; i++){
				var arr = keys.slice(i*NUM, (i+1)*NUM);

				this._loadStockData(arr.join(","),function(res){
					//li每个遍历改变数据
					var $els = $("#zxg .zxg-list li");
					
					$els.each(function(index,item){
						var key = item.id;
						var obj = res['v_' + key];
						if(!obj){
							return;
						}
						var item = $(item);
						if(!item.attr("id")){
							return;
						}
						if(item == undefined || item.find(".price") == undefined){
							console.log(item)
						}
						// item.find(".name a").html(obj.name + '('+ obj.code +')');
						//隐藏上半部分
						if (window.localStorage.getItem("myJavaShow")==1){
							$('#myjava').hide();
						}else {
							$('#myjava').show();
						}
						//对etf进行高亮处理
						if (obj.name.indexOf("ETF")!=-1){
							item.addClass('stocketf')
						}
						if (obj.name.indexOf("一心堂")!=-1){
							item.addClass('stocketf')
						}
						if (obj.name.indexOf("大金重工")!=-1){
							item.addClass('stocketf')
						}
						if (obj.name.indexOf("长城汽车")!=-1){
							item.addClass('stocketf')
						}
						if (obj.name.indexOf("上能电气")!=-1){
							item.addClass('stocketf')
						}
						if (obj.key.indexOf("sz300568")!=-1){
							item.addClass('stocketf')
						}
						if (obj.key.indexOf("sh600884")!=-1){
							item.addClass('stocketf')
						}
						if (obj.key.indexOf("sz300073")!=-1){
							item.addClass('stocketf')
						}
						if (obj.key.indexOf("sz300890")!=-1){
							item.addClass('stocketf')
						}
						if (obj.key.indexOf("sz002709")!=-1){
							item.addClass('stocketf')
						}
						if (obj.key.indexOf("sh000001")!=-1){
							item.addClass('stocketf')
						}
						//数组处理颜色分类
						var classArray = new Array();
						classArray.push("sz300655");
						classArray.push("sz002371");
						classArray.push("sz000400");
						classArray.push("sz300343");
						classArray.push("sh601778");
						classArray.push("sz000821");
						classArray.push("sz002101");
						classArray.push("sz300308");
						classArray.push("sz300347");

						if (classArray.includes(obj.key.substr(2))){
							item.addClass('stocketf')
							// console.log(obj.key.substr(2))
						}


						//todo 隐藏处理
						var mode_choice=window.localStorage.getItem("mode_choice");
						if (mode_choice==1){
							//显示所有中文
							item.find(".code a").html(obj.key.substring(4,7) );
							item.find(".name a").html(obj.name);
						}else if(mode_choice==2){
							//显示2个中文
							item.find(".code a").html(obj.key.substring(4,7) );
							item.find(".name a").html(obj.name.substring(0,1)+"&#5%#0"+obj.name.substring(1,2));
						}else if(mode_choice==3){
							//显示2个中文
							item.find(".code a").html(obj.key.substring(4,7) );
							item.find(".name a").html(obj.name.substring(0,1)+"&#5%#0"+pinyin.getCamelChars(obj.name.substring(1,2)));
						}  else{
							//拼音模式
							item.find(".code a").html(obj.key.substring(4,7) );
							item.find(".name a").html(pinyin.getFullChars(obj.name));
						}
						var sUserAgent = navigator.userAgent;
						console.log(sUserAgent.indexOf("Windows NT 6.1"));
						console.log(sUserAgent.indexOf("Windows 7"));
						console.log(sUserAgent);

						item.find(".price a").html(obj.price).removeClass('increase','reduce').addClass('increase');
						item.find(".grow a").html(obj.growRate).removeClass('increase','reduce').addClass('increase');
						item.find(".hands").html(obj.hands);

						//超买显示,根据key获取缓存upper
						var tObj=LocalData.getOneByKey(obj.key.substring(2));
						// console.log("key"+obj.key.substring(2));
						// console.log("tObj"+tObj);

						//第一个小时超卖, 在10点半之前
						var curTime = new Date();
						var base = curTime.getFullYear() + '/' + (curTime.getMonth() + 1) + '/' + curTime.getDate() + ' ';
						var secondStartAM = base + '10:30:00'; // 第二个小时开始
						//超买超卖提示
						upperAndLowerUtil.upper(item, obj,tObj, curTime,secondStartAM);
						upperAndLowerUtil.lower(item, obj,tObj, curTime,secondStartAM);
					});

					cb && cb();
				});
			}
		},

		getfirefoxJson:function(){
			console.log("获取firefox json");
			var totelGroup = [];
			var morenGroup = [];
			var stockGroup = [];
			// var jsonobject = {};
			// jsonobject.name = "美的集团";
			// jsonobject.code = "000333";
			// jsonobject.market = 0;
			// stockGroup.push(jsonobject);
			// console.log(stockGroup);
			//当前分组

			var groudnew = {};

			var tagnow=null;
			//获取

			var keys = LocalData.getKeys();
			var NUM = 200;	// 每30个一组发请求，分组后异步并行ajax处理的

			if(keys.length == 0){
				// $("#zxg .loading").hide();
				return;
			}
			var groupname = '上证';
			for(var i = 0,len = Math.ceil(keys.length/NUM); i < len; i++){
				var arr = keys.slice(i*NUM, (i+1)*NUM);

				this._loadStockData(arr.join(","),function(res) {
					for (i in res) {
						// console.log(i + "=" + res[i]);
						var obj = res[i];

						if (obj.key.indexOf("sh000001")!=-1){
							stockGroup = [];
							groupname = obj.name;
						}
						if (obj.name.indexOf("ETF")!=-1){
							//console.log(JSON.stringify(stockGroup));
							//创建对象
							var jsonobject1 = {};
							jsonobject1.name =groupname;
							jsonobject1.data =stockGroup;
							totelGroup.push(jsonobject1)
							// console.log(JSON.stringify(totelGroup));

							stockGroup = [];
							groupname = obj.name;
							// console.log(JSON.stringify(totelGroup));


						}
						if (obj.name.indexOf("一心堂")!=-1){
							//console.log(JSON.stringify(stockGroup));
							//创建对象
							var jsonobject1 = {};
							jsonobject1.name =groupname;
							jsonobject1.data =stockGroup;
							totelGroup.push(jsonobject1)
							stockGroup = [];
							groupname = obj.name;
						}
						if (obj.name.indexOf("大金重工")!=-1){
							//console.log(JSON.stringify(stockGroup));
							//创建对象
							var jsonobject1 = {};
							jsonobject1.name =groupname;
							jsonobject1.data =stockGroup;
							totelGroup.push(jsonobject1)
							stockGroup = [];
							groupname = obj.name;
						}
						if (obj.name.indexOf("长城汽车")!=-1){
							//console.log(JSON.stringify(stockGroup));
							//创建对象
							var jsonobject1 = {};
							jsonobject1.name =groupname;
							jsonobject1.data =stockGroup;
							totelGroup.push(jsonobject1)
							stockGroup = [];
							groupname = obj.name;
						}
						if (obj.name.indexOf("上能电气")!=-1){
							//console.log(JSON.stringify(stockGroup));
							//创建对象
							var jsonobject1 = {};
							jsonobject1.name =groupname;
							jsonobject1.data =stockGroup;
							totelGroup.push(jsonobject1)
							stockGroup = [];
							groupname = obj.name;
						}
						if (obj.key.indexOf("sz300568")!=-1){
							//console.log(JSON.stringify(stockGroup));
							//创建对象
							var jsonobject1 = {};
							jsonobject1.name =groupname;
							jsonobject1.data =stockGroup;
							totelGroup.push(jsonobject1)
							stockGroup = [];
							groupname = obj.name;
						}
						if (obj.key.indexOf("sh600884")!=-1){
							//console.log(JSON.stringify(stockGroup));

							//创建对象
							var jsonobject1 = {};
							jsonobject1.name =groupname;
							jsonobject1.data =stockGroup;
							totelGroup.push(jsonobject1)
							stockGroup = [];
							groupname = obj.name;
						}
						if (obj.key.indexOf("sz300073")!=-1){
							//console.log(JSON.stringify(stockGroup));
							//创建对象
							var jsonobject1 = {};
							jsonobject1.name =groupname;
							jsonobject1.data =stockGroup;
							totelGroup.push(jsonobject1)
							stockGroup = [];
							groupname = obj.name;
						}
						if (obj.key.indexOf("sz300890")!=-1){
							//console.log(JSON.stringify(stockGroup));
							//创建对象
							var jsonobject1 = {};
							jsonobject1.name =groupname;
							jsonobject1.data =stockGroup;
							totelGroup.push(jsonobject1)
							stockGroup = [];
							groupname = obj.name;
						}
						if (obj.key.indexOf("sz002709")!=-1){
							//console.log(JSON.stringify(stockGroup));
							//创建对象
							var jsonobject1 = {};
							jsonobject1.name =groupname;
							jsonobject1.data =stockGroup;
							totelGroup.push(jsonobject1)
							stockGroup = [];
							groupname = obj.name;
						}

						//创建对象,添加进入数组
						var jsonobject = {};
						jsonobject.name = obj.name;
						jsonobject.code = obj.key.substring(4,10);
						if (obj.key.startsWith("v_sh")){
							jsonobject.market = 1;
						}else {
							jsonobject.market = 0;
							jsonobject.StockType = "深A";
						}
						stockGroup.push(jsonobject);
						morenGroup.push(jsonobject);

					}
//最后
					//console.log(JSON.stringify(stockGroup));
					//创建对象
					var jsonobject1 = {};
					jsonobject1.name =groupname;
					jsonobject1.data =stockGroup;
					totelGroup.push(jsonobject1)
					console.log(JSON.stringify(totelGroup));
					console.log(JSON.stringify(morenGroup));
					//整体
					var str = "{\"version\":\"3.2.5\",\"stockGroup\":[{\"name\":\"默认分组\",\"data\":[]}],\"fundGroup\":[{\"name\":\"默认分组\",\"data\":[]}],\"indexItemList\":[{\"code\":\"000001\",\"name\":\"上证指数\",\"market\":\"1\"},{\"code\":\"000300\",\"name\":\"沪深300\",\"market\":\"1\"},{\"code\":\"399001\",\"name\":\"深证指数\",\"market\":\"0\"},{\"code\":\"399006\",\"name\":\"创业板指数\",\"market\":\"0\"},{\"code\":\"000933\",\"name\":\"中证医药\",\"market\":\"1\"},{\"code\":\"399986\",\"name\":\"中证银行\",\"market\":\"0\"},{\"code\":\"399997\",\"name\":\"中证白酒\",\"market\":\"0\"},{\"code\":\"000820\",\"name\":\"煤炭指数\",\"market\":\"1\"},{\"code\":\"399975\",\"name\":\"证券公司\",\"market\":\"0\"}],\"stockCurGroupIndex\":1,\"config\":{\"isDark\":false,\"fontSize\":\"mini\",\"badgeModel\":\"0\",\"is_show_fund\":false,\"popup_opacity\":100,\"fundColumnShow\":{\"jj_gz\":true,\"jj_ccj\":false,\"jj_ccs\":false,\"jj_zdf\":true,\"jj_zsy\":false,\"jj_ccje\":false,\"jj_dtsy\":false,\"jj_zsyl\":false},\"isShowHeadIndex\":false,\"popup_grayscale\":47,\"stockColumnShow\":{\"gp_sj\":true,\"gp_ccj\":false,\"gp_ccs\":false,\"gp_hsl\":true,\"gp_zdf\":true,\"gp_zsy\":false,\"gp_ccje\":false,\"gp_dtsy\":false,\"gp_zsyl\":false,\"gp_zdfje\":true},\"replenishmentNotice\":true},\"data_center_last_updata\":\"2021-06-28\",\"stockItemList\":[],\"fundListM\":[],\"notify\":[]}";
					var firefoxresult = JSON.parse(str);
					firefoxresult.stockGroup = totelGroup;
					firefoxresult.stockItemList = morenGroup;
					console.log(JSON.stringify(firefoxresult));
				});

				
			}






		},
		initDom : function(){
			var sHtml = this._renderStockStruct();
			$('#zxg .zxg-list').html(sHtml);
			
			this.updateStockData(function(){
				$("#zxg .loading").hide();
			});
		},
		/* 备注 */
		remark : function(info,cb){
			LocalData.edit(info,cb);
		},
		_bindEvent : function(){
			var self = this;
			$("#zxg").delegate(".delete","click",function(e){
				e.preventDefault();
				var $el = $(this);
				var key = $el.attr("data-key");
				LocalData.remove(key, function(){
					$el.closest("li").remove();
					console.log("success");
				});
			}).delegate(".remark","click",function(e){
				// 添加备注
				var key = $(this).parents("li").attr("id");
				var name = $(this).prevAll(".name").html();
				var price = $(this).prevAll(".price").html();
				var $formRemark = $(".remark-form");
				$formRemark.show().find("#remark-key").val(key)
					.end().find(".name").html(name)
					.end().find(".price").html(price)
					.end().find("#remark").html($(this).attr("title"));				
				$(".mask").show();
			});
			$(".remark-form").delegate(".close","click",function(e){
				$(e.delegateTarget).hide();
				$(".mask").hide();
			}).delegate(".btn","click",function(e){
				var key = $("#remark-key").val().trim();
				var remark = $("#remark").val().trim();

				self.remark({key:key,remark:remark},function(){
					$(".mask").hide();
					$(e.delegateTarget).hide();

					var $remark = $("#"+key).find(".remark");
					if(remark == ""){
						$remark.removeClass("remarked");
					}else{
						$remark.addClass("remarked").attr("title",remark);
					}
				});
			});
			/* 分时走势图 */
			var timerTrend = null;
			$(".zxg-list").delegate("li .code","mouseenter",function(e){
				$el = $(this);
				var $parent = $el.parents("li");
				
				var key = $parent.attr("id");
				var code = key.slice(2);
				var type = $parent.attr("data-type");
				var imgUrl = getLinkUrl({code:code, key:key, type:type,stockShowType:"min"}).imgUrl;
				if(imgUrl == ""){
					return;
				}
				timerTrend = setTimeout(function(){
					var style = '';
					if($parent.height()+$parent.position().top+130>$(".zxg-bd").height()){
						style = ' style="top:-120px;left:0px;"';
					}else {
						style = ' style="left:0px;"';
					}
					var str = '<div class="trendImg"' + style + '><img src="'+imgUrl+new Date().getTime()+'" alt="" style="width: 380px"/></div>';
					$el.append(str);					
				},500);
			}).delegate("li .code","mouseleave",function(e){
				clearTimeout(timerTrend);
				$(this).find(".trendImg").remove();
			});
			/* 日势图 */
			var timerDayTrend = null;
			$(".zxg-list").delegate("li .name","mouseenter",function(e){
				$el = $(this);
				var $parent = $el.parents("li");

				var key = $parent.attr("id");
				var code = key.slice(2);
				var type = $parent.attr("data-type");
				var imgUrl = getLinkUrl({code:code, key:key, type:type,stockShowType:"daily"}).imgUrl;
				if(imgUrl == ""){
					return;
				}
				timerDayTrend = setTimeout(function(){
					var style = '';
					if($parent.height()+$parent.position().top+130>$(".zxg-bd").height()){
						style = ' style="top:-120px"';
					}
					var str = '<div class="trendImg"' + style + '><img src="'+imgUrl+new Date().getTime()+'" alt="" style="width: 470px"/></div>';
					$el.append(str);
				},500);
			}).delegate("li .name","mouseleave",function(e){
				clearTimeout(timerDayTrend);
				$(this).find(".trendImg").remove();
			});
			/* 周势图 */
			var timerWeeklyTrend = null;
			$(".zxg-list").delegate("li .price","mouseenter",function(e){
				$el = $(this);
				var $parent = $el.parents("li");

				var key = $parent.attr("id");
				var code = key.slice(2);
				var type = $parent.attr("data-type");
				var imgUrl = getLinkUrl({code:code, key:key, type:type,stockShowType:"weekly"}).imgUrl;
				if(imgUrl == ""){
					return;
				}
				timerWeeklyTrend = setTimeout(function(){
					var style = '';
					if($parent.height()+$parent.position().top+130>$(".zxg-bd").height()){
						style = ' style="top:-120px"';
					}
					var str = '<div class="trendImg"' + style + '><img src="'+imgUrl+new Date().getTime()+'" alt="" style="width: 400px"/></div>';
					$el.append(str);
				},500);
			}).delegate("li .price","mouseleave",function(e){
				clearTimeout(timerWeeklyTrend);
				$(this).find(".trendImg").remove();
			});
			/* 月势图 */
			var timerMonthlyTrend = null;
			$(".zxg-list").delegate("li .grow","mouseenter",function(e){
				$el = $(this);
				var $parent = $el.parents("li");

				var key = $parent.attr("id");
				var code = key.slice(2);
				var type = $parent.attr("data-type");
				var imgUrl = getLinkUrl({code:code, key:key, type:type,stockShowType:"monthly"}).imgUrl;
				if(imgUrl == ""){
					return;
				}
				timerMonthlyTrend = setTimeout(function(){
					var style = '';
					if($parent.height()+$parent.position().top+130>$(".zxg-bd").height()){
						style = ' style="top:-120px"';
					}
					var str = '<div class="trendImg"' + style + '><img src="'+imgUrl+new Date().getTime()+'" alt="" style="width: 400px"/></div>';
					$el.append(str);
				},500);
			}).delegate("li .grow","mouseleave",function(e){
				clearTimeout(timerMonthlyTrend);
				$(this).find(".trendImg").remove();
			});
			$(".zxg-list").delegate("li","mouseenter",function(e){
				$(this).addClass('hover');
			}).delegate("li",'mouseleave',function(e){
				$(this).removeClass('hover');
			}).delegate(".top","click",function(e){
				$(this).parents("li").prependTo(e.delegateTarget);
				self.sortStock();
			}).delegate('li', 'animationend', function(e){
				$(this).removeClass('fade');
			}).delegate(".down","click",function(e){
				console.log($(this).parents("li"))
				console.log(e.delegateTarget)
				$(this).parents("li").appendTo(e.delegateTarget);
				self.sortStock();
			}).delegate(".upper","click",function(e){
				//超买
				$("#setUpper").toggle();

				$('.mask').toggle();
				//获取当前upper，并设置进text
				console.log(e.currentTarget)
				console.log("现在的内容：" + e.currentTarget.innerHTML);
				$("#upper_text").val(e.currentTarget.innerHTML);
				//获取当前upper，记录当前upper的class
				console.log(e.currentTarget.className.split(" ")[0])
				$("#upper_id").html(e.currentTarget.className.split(" ")[0]);
				window.localStorage.setItem("upper_id", e.currentTarget.className.split(" ")[0]);


			}).delegate(".lower","click",function(e){
					$("#setLower").toggle();
					$('.mask').toggle();
					//获取当前lower，并设置进text
					console.log(e.currentTarget)
					console.log("现在的内容：" + e.currentTarget.innerHTML);
					$("#lower_text").val(e.currentTarget.innerHTML);
					//获取当前upper，记录当前upper的class
					console.log(e.currentTarget.className.split(" ")[0])
					$("#lower_id").html(e.currentTarget.className.split(" ")[0]);
					window.localStorage.setItem("lower_id", e.currentTarget.className.split(" ")[0]);
			});

			/* 拖拽排序 */
			$( ".zxg-list" ).sortable({
				placeholder: "ui-state-highlight",
				activate : function(event,ui){
					ui.item.removeClass('hover');
				},
				deactivate : function(event,ui){      	
					self.sortStock();
				}
			});
			$( ".zxg-list" ).disableSelection();
		},
		init : function(){
			this.initDom();
			this._bindEvent();
		}
	};

	Stock.init();

	var timer = null;
	function startRender(){
		clearInterval(timer);
		timer = setInterval(function(){
			Stock.updateStockData();
		},1000);		
	}
	startRender();

	// 一个简单的检测是否开盘时间，否则停止更新数据
	(function(){
		var curTime = new Date();
		var base = curTime.getFullYear() + '/' + (curTime.getMonth() + 1) + '/' + curTime.getDate() + ' ';
		var startAM = base + '09:00:00'; // 早盘开盘时间
		var endAM = base + '11:30:00';	// 早盘开盘时间
		var startPM = base + '13:00:00';	// 午盘开盘时间
		var endPM = base + '15:00:00';	// 午盘闭盘时间
		var SecondstartAM = base + '10:30:00'; // 第二个小时开始
		if(+curTime < +new Date(startAM) || ( +new Date(endAM) < +curTime && +curTime < +new Date(startPM) ) || +curTime > +new Date(endPM) ){
			//todo 检查开启时间
			// clearInterval(timer);
		}
	})();

	window.LocalData = LocalData;
	window.Stock = Stock;
})(jQuery)
