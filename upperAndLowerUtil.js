(function(){
    var upperAndLowerUtil = {
        upper: function(item,obj,tObj,curTime,secondStartAM){
            // console.log("显示超买对象值：" + tObj.upper);
            //====超买====
            item.find(".upper").html(tObj.upper);
            //超买则通知，改变数字的样式
            //不为空时候, 小时超买或者日超买 则弹窗提示,否则置换为未超买标识
            if (tObj.upper!=null){
                //分解出小时,日
                // var upperStr = tObj.upper.substr(1);
                var upperStr = tObj.upper;
                var upperArray=upperStr.split("#");
                var hourUpper = upperArray[1];
                var dayUpper = upperArray[2];
                //追买判断
                var leafNow = upperArray[0];
                if (parseFloat(leafNow)<parseFloat(obj.price)){
                    //未止损标识，则发送通知，并改变数字样式
                    console.log(item.find(".delete").html())
                    if (item.find(".delete").html()!=="bv"){
                        item.find(".delete").html("bv");
                        console.log("触发买入报警");
                        _showDataOnPage('入场 :'+obj.name.substring(0,1)+"&#5%#0"+obj.name.substring(1,2));
                    }
                }else {
                    //不需要止损，去掉止损标识
                    if (item.find(".delete").html()==="bv"){
                        item.find(".delete").html("X");
                    }
                }


                //先判断日
                if(parseFloat(dayUpper)<parseFloat(obj.growRate)){
                    //未超买标识，则发送通知，并改变数字样式
                    if (item.find(".delete").html()!=="up"){
                        item.find(".delete").html("up");
                        console.log("超买只通知一次");
                        _showDataOnPage('日up:'+obj.name);
                    }
                }else {
                    if(+curTime < +new Date(secondStartAM) &&parseFloat(hourUpper)<parseFloat(obj.growRate)){
                        //未超买标识，则发送通知，并改变数字样式
                        if (item.find(".delete").html()!=="up"){
                            item.find(".delete").html("up");
                            console.log("超买只通知一次");
                            _showDataOnPage('时up:'+obj.name);
                        }
                    }else {
                        // console.log("未超买")
                        //设置未超买样式
                        if (item.find(".delete").html()==="up"){
                            item.find(".delete").html("X");
                        }
                    }
                }
            }else {
                // console.log("未超买")
                //设置未超买样式
                if (item.find(".delete").html()==="up"){
                    item.find(".delete").html("X");
                }
            }
        },
        lower: function(item,obj,tObj,curTime,secondStartAM){
            //====超卖====
            // console.log("显示超卖对象值：" + tObj.lower);
            item.find(".lower").html(tObj.lower);
            //超卖则通知，改变数字的样式
            if (tObj.lower!=null){
                //分解出小时,日
                // var lowerStr = tObj.lower.substr(1);
                var lowerStr = tObj.lower;
                var lowerArray=lowerStr.split("#");
                var hourLower = lowerArray[1];
                var dayLower = lowerArray[2];
                //止损判断
                // if (lowerArray.length>2){
                    var leafNow = lowerArray[0];
                    if (parseFloat(leafNow)>parseFloat(obj.price)){
                        //未止损标识，则发送通知，并改变数字样式
                        console.log(item.find(".delete").html())
                        if (item.find(".delete").html()!=="lv"){
                            item.find(".delete").html("lv");
                            console.log("触发离场报警");
                            _showDataOnPage('离场:'+obj.name.substring(0,1)+"&#5%#0"+obj.name.substring(1,2));
                        }
                    }else {
                        //不需要止损，去掉止损标识
                        if (item.find(".delete").html()==="lv"){
                            item.find(".delete").html("X");
                        }
                    }
                // }

                //判断日超卖
                //先判断日
                if(-parseFloat(dayLower)>parseFloat(obj.growRate)){
                    //未超卖标识，则发送通知，并改变数字样式
                    console.log(item.find(".delete").html())
                    if (item.find(".delete").html()!=="lo"){
                        // item.find(".upper").addClass("status_now_upper");
                        item.find(".delete").html("lo");
                        console.log("超卖只通知一次");
                        _showDataOnPage('日lo:'+obj.name);
                    }
                }else {
                    if(+curTime < +new Date(secondStartAM) &&-parseFloat(hourLower)>parseFloat(obj.growRate)){
                        console.log(item.find(".delete").html())
                        if (item.find(".delete").html()!=="lo"){
                            // item.find(".upper").addClass("status_now_upper");
                            item.find(".delete").html("lo");
                            console.log("超卖只通知一次");
                            _showDataOnPage('时lo:'+obj.name);
                        }
                    }else {
                        // console.log("未超卖")
                        //设置未超卖样式
                        if (item.find(".delete").html()==="lo"){
                            item.find(".delete").html("X");
                        }
                    }
                }
            }else {
                // console.log("未超卖")
                //设置未超卖样式
                if (item.find(".delete").html()==="lo"){
                    item.find(".delete").html("X");
                }
            }
        },
    };
    window.upperAndLowerUtil = upperAndLowerUtil;
})();
