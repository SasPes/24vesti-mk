function httpGet(theUrl, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState === 4 && xmlHttp.status === 200)
            callback(xmlHttp.responseText);
    };
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
    xmlHttp.send();
}

function initialize() {
    httpGet("http://24vesti.mk/rss.xml", initializeXml);
}


function initializeXml(feed) {
    var newArticles = 0;
    var lastPublishedDate = new Date(Date.parse(localStorage["lastPublishedDate"]));
    if (typeof (lastPublishedDate) == 'undefined' || lastPublishedDate == null || lastPublishedDate == 'Invalid Date') {
        lastPublishedDate = new Date();
        localStorage["lastPublishedDate"] = lastPublishedDate;
    }

    var xmlData = feed;
    var domParser = new DOMParser();
    var parsedXML = domParser.parseFromString(xmlData, 'text/xml');
    var json = window.rss2json(parsedXML);

    for (var i = 0; i < 24; i++) {
        var entry = json.items[i];

        var publishedDate = new Date(Date.parse(entry.pubDate));

        if (publishedDate.getTime() > lastPublishedDate.getTime()) {
            newArticles = newArticles + 1;
        }
    }

    if (newArticles != 0) {
        localStorage["newArticles"] = newArticles;
    } else {
        localStorage["newArticles"] = "";
    }
    chrome.browserAction.setBadgeText({text: localStorage["newArticles"]});
}

initialize();

window.setInterval(function () {
    initialize();
}, 1000 * 60 * 15); // 15 min
