//window 7
chrome.contextMenus.create({
    title: "win7窗口打开", contexts: ["browser_action"], onclick: function () {
        //如果win7
        var sUserAgent = navigator.userAgent;
        chrome.windows.create({
            url: chrome.runtime.getURL("index.html"),
            width: 520,
            height: 600,
            top: 200,
            left: 200,
            type: "popup"
        }, (function (t) {
            chrome.windows.update(t.id, {focused: !0})
        }))


    }

});



chrome.contextMenus.create({
    title: "以独立窗口模式打开", contexts: ["browser_action"], onclick: function () {
        //如果win7
        var sUserAgent = navigator.userAgent;
        if (sUserAgent.indexOf("Windows NT 6.1") > -1 || sUserAgent.indexOf("Windows 7") > -1) {
            //window 7
            chrome.windows.create({
                url: chrome.runtime.getURL("index.html"),
                width: 520,
                height: 450,
                top: 200,
                left: 200,
                type: "popup"
            }, (function (t) {
                chrome.windows.update(t.id, {focused: !0})
            }))
        } else {
            //window 10
            chrome.windows.create({
                url: chrome.runtime.getURL("index.html"),
                width: 300,
                height: 450,
                top: 685,
                left: 1750,
                // top: 980,
                // left:2150,
                type: "popup"
            }, (function (t) {
                chrome.windows.update(t.id, {focused: !0})
            }))
        }


    }

});

chrome.contextMenus.create({
    title: "微信读书", contexts: ["browser_action"], onclick: function () {
        //如果win7
        var sUserAgent = navigator.userAgent;
        if (sUserAgent.indexOf("Windows NT 6.1") > -1 || sUserAgent.indexOf("Windows 7") > -1) {
            chrome.windows.create({
                url: chrome.runtime.getURL("index.html"),
                width: 520,
                height: 450,
                top: 200,
                left: 200,
                type: "popup"
            }, (function (t) {
                chrome.windows.update(t.id, {focused: !0})
            }))
        } else {
            chrome.windows.create({
                url: "https://weread.qq.com/web/shelf",
                width: 1000,
                // height: 450,
                // top: 685,
                // left: 1600,
                // top: 980,
                // left:2150,
                type: "popup"
            }, (function (t) {
                chrome.windows.update(t.id, {focused: !0})
            }))
        }


    }

});
