;(function($,undefined){

	// 初始化指数数据
	(function(){
		var stock_list_data = localStorage.getItem('stock_list');
		$("#importexport_code").val(stock_list_data || '');
		if(!!stock_list_data){
			return;
		}
		var data = [
			{key: "sh000001", name: "上证指数", pinyin: "szzs", type: "ZS"},
			{key: "sz399006", name: "创业板指", pinyin: "cybz", type: "ZS"}
		];
		while(data.length){
			Stock.addStock(data.pop());
		}
	})();

	(function(){
		var renderIconHtml = function(){
			var confIcons = ['rabbit', 'panda', 'mouse', 'lips', 'bear', 'dog', 'angrybird', 'hellokitty', 'octopus', 'tiger', 'flower', 'crab'];
			// window.confIcons = confIcons;
			var html = [];
			while(confIcons.length){
				var icon = confIcons.shift();
				html.push('<a href="#" class="icon" data-id="' + icon + '"><img src="images/icons/' + icon + '.png"/></a>');
			}
			$('#setting .iconlist').html(html.join(""));			
		}
		var bindEvent = function(){
			$('.setting').on('click', function(e){
				$("#setting").toggle();
				$('.mask').toggle();
			});
			$('#setting').delegate('.icon', 'click', function(e){
				var name = $(this).attr('data-id');
				localStorage.setItem('stock_icon', name);
				$('.iconlist .icon').removeClass('cur');
				$(this).addClass('cur');

				chrome.browserAction.setIcon({path: 'images/icons/' + name + '.png'});
			}).delegate('.close', 'click', function(e){
				$('#setting').hide();
				$('.mask').hide();
			}).delegate('.default', 'click', function(e){
				localStorage.removeItem('stock_icon');
				chrome.browserAction.setIcon({path: 'images/logo48.png'});
			});

			$(".importexport").on('click', function(e){
				var stock_list_data = localStorage.getItem('stock_list');
				$("#importexport_code").val(stock_list_data || '');
				$("#importexport").show();
				$('.mask').toggle();
			});
			//超买
			$('.upper').on('click', function(e){
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

			});

			$('#setUpper').delegate('.close', 'click', function(e){
				$('#setUpper').hide();
				$('.mask').hide();
				//把text的值设置进 当前upper e
				// e.currentTarget.html("33");
			});

			$("#upper_text_confirm").click(function (e) {
				var textdata = $("#upper_text").val();
				console.log(textdata);
				//把text的值设置进 当前upper
				//todo 把值设置进缓存， 定时任务刷新即可
				var t = window.localStorage.getItem("upper_id");
				console.log("目标key："+t);

				var obj = {upper:textdata,key:t};
				LocalData.editUpper(obj)


				// var upper=document.getElementsByClassName(t)[0];
				// console.log(upper)
				// console.log("原始内容" + upper.innerHTML);
				// upper.innerHTML = textdata;
				// console.log("新内容" + upper.innerHTML);
				// e.currentTarget.html("33");
				$('#setUpper').hide();
				$('.mask').hide();

				//上传到云
				var url = "http://106.75.173.212/stockcache";
				var textdata = localStorage.getItem('stock_list');
				var tmp = JSON.parse(textdata);
				utils.ajax_update_json(url, textdata, "POST",function (data) {
					// alert("自动上传完成"+JSON.stringify(data));
					_showDataOnPage('上传到云');
				});
			});

			//超卖
			$('.lower').on('click', function(e){
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

			$('#setLower').delegate('.close', 'click', function(e){
				$('#setLower').hide();
				$('.mask').hide();
				//把text的值设置进 当前upper e
				// e.currentTarget.html("33");
			});
			$("#lower_text_confirm").click(function (e) {
				var textdata = $("#lower_text").val();
				console.log(textdata);
				//把text的值设置进 当前upper
				//todo 把值设置进缓存， 定时任务刷新即可
				var t = window.localStorage.getItem("lower_id");
				console.log("目标key："+t);

				var obj = {lower:textdata,key:t};
				LocalData.editLower(obj)
				// var upper=document.getElementsByClassName(t)[0];
				// console.log(upper)
				// console.log("原始内容" + upper.innerHTML);
				// upper.innerHTML = textdata;
				// console.log("新内容" + upper.innerHTML);
				// e.currentTarget.html("33");
				$('#setLower').hide();
				$('.mask').hide();
				//上传到云
				var url = "http://106.75.173.212/stockcache";
				var textdata = localStorage.getItem('stock_list');
				var tmp = JSON.parse(textdata);
				utils.ajax_update_json(url, textdata, "POST",function (data) {
					// alert("自动上传完成"+JSON.stringify(data));
					_showDataOnPage('上传到云');
				});

			});

			$(".mode1").on('click', function(e){

				// todo 添加数据
				var mode_choice=window.localStorage.getItem("mode_choice");
				// console.log("old mode_choice:" + mode_choice);
				if(mode_choice==null){
					window.localStorage.setItem("mode_choice", 1);
				}else if(mode_choice==1){
					window.localStorage.setItem("mode_choice", 2);
				}else if (mode_choice==2){
					window.localStorage.setItem("mode_choice", 3);
				}else if (mode_choice==3){
					window.localStorage.removeItem("mode_choice");
				}
				console.log("new mode_choice:" + window.localStorage.getItem("mode_choice"));
			});

			$(".mode2").on('click', function(e){
				window.localStorage.removeItem("mode_choice");
				console.log("new mode_choice:" + window.localStorage.getItem("mode_choice"));
				// 获取数据
				// console.log(window.localStorage.getItem("name")) // 张三
				// 清除某个数据
				// window.localStorage.removeItem("gender")
				// 清空所有数据
				// window.localStorage.clear()
			});
			$(".mode3").on('click', function(e){
				if (window.localStorage.getItem("myJavaShow")==1){
					window.localStorage.removeItem("myJavaShow")
				}else {
					window.localStorage.setItem("myJavaShow", 1);
				}
			});

			$("#importexport").delegate('.close', 'click', function(e){
				$('#importexport').hide();
				$('.mask').toggle();
			});

			$("#importexport_confirm").click(function (e) {
				var textdata = $("#importexport_code").val();
				try {
					var tmp = JSON.parse(textdata);
					console.log(tmp);

					if (typeof(tmp['value']) !== 'object') {
						alert('array error');
						return;
					};
				} catch (e) {
					alert(e);
					return;
				}

				localStorage.setItem('stock_list', textdata);
				window.close();
			});
			//上传数据到jsonbox
			$(".json_up").click(function (e) {
				var url = "http://106.75.173.212/stockcache";
				var textdata = localStorage.getItem('stock_list');
				var tmp = JSON.parse(textdata);
				utils.ajax_update_json(url, textdata, "POST",function (data) {
					alert("上传完成"+JSON.stringify(data));
				});
			});
			//下载数据到jsonbox
			$(".json_down").click(function (e) {
				var url = "http://106.75.173.212/stockcache";
				utils.ajax_update_json(url, null, "GET",function (data) {
					try {
						var tmp = data;
						console.log(tmp);
						if (typeof(tmp['value']) !== 'object') {
							alert('array error');
							return;
						};
					} catch (e) {
						alert(e);
						return;
					}
					localStorage.setItem('stock_list',JSON.stringify(tmp) );
					alert("下载完成");

				});
			});
		}
		renderIconHtml();
		bindEvent();

	})();


	var baseSugUrl = 'https://smartbox.gtimg.cn/s3/?t=all';
	var localBaseSugUrl = localStorage.getItem('stock_sugUrl');
	if(localBaseSugUrl && localBaseSugUrl != 'undefined'){
		baseSugUrl = localBaseSugUrl;
	}
	/* 搜索suggest */
	var sug = new Suggest({
		template : {
			item : '<div class="sug-item" data-pre="{0}" data-item="{0}{1}" data-type={4}>'+
						'<span class="key">{1}</span><span class="name">{2}</span><span class="pinyin">{3}</span>'+
						// '<span class="sug-plus"></span>'+
					'</div>'
		},
		requestUrl : baseSugUrl,
		requestQueryKey : 'q',
		requestCallbackKey : 'cb',
		localStorageKey : Stock.name,
		suggestMaxNum: 15,
		submitCallback : function(query){
			var arr = query.split("  ");
			var queryObj = {
				key : arr[0]+arr[1],
				name : arr[2],
				pinyin : arr[3],
				type : arr[4]
			}
			console.log(queryObj);
			Stock.addStock(queryObj);
		},
		isCache : false
	});
	window.TYPE = "financeQQ";

})(jQuery);

// https://github.com/boypt/stock-viewer 项目失效，再次基础上修改