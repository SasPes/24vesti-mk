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

var page = location.search.split('page=')[1];

var i = 0;
var e = 8;

if (parseInt(page) === 2) {
    i = 8;
    e = 16;
}

if (parseInt(page) === 3) {
    i = 16;
    e = 24;
}

var newArticles = "";

function initialize() {
    httpGet("http://24vesti.mk/rss.xml", initializeXml);
}

function initializeXml(feed) {
    var xmlData = feed;
    var domParser = new DOMParser();
    var parsedXML = domParser.parseFromString(xmlData, 'text/xml');
    var json = window.rss2json(parsedXML);

    var container = document.getElementById("feed");
    var html = "";

    for (i; i < e; i++) {
        var entry = json.items[i];

        var dateP = new Date(Date.parse(entry.pubDate));

        var dateDen = dateP.getDate() + "." + (dateP.getMonth() + 1) + "." + dateP.getFullYear();

        var hNula = false;
        if (dateP.getHours().toString().length === 1) {
            hNula = true;
        }

        var mNula = false;
        if (dateP.getMinutes().toString().length === 1) {
            mNula = true;
        }

        var dateVremeHours = dateP.getHours();
        var dateVremeMinutes = dateP.getMinutes();
        if (hNula) {
            dateVremeHours = "0" + dateVremeHours;
        }
        if (mNula) {
            dateVremeMinutes = "0" + dateVremeMinutes;
        }

        var dateVreme = dateVremeHours + ":" + dateVremeMinutes;

        var today = new Date();
        var todayDen = today.getDate() + "." + (today.getMonth() + 1) + "." + today.getFullYear();

        if (todayDen === dateDen) {
            dateDen = "";
        } else {
            dateDen = dateDen + " ";
        }

        dateP = dateDen + dateVreme;

        // img
        var content = entry.description;
        var regex = /src=\".+\.jpg\"/;
        var src = regex.exec(content);

        if (src === null) {
            src = "src='imgs/icon24.jpg'";
        } else {
            src = src[0];
        }

        if (newArticles > i) {
            html = "<table>" +
                    "  <tr>" +
                    "    <td style='vertical-align:middle; padding-right:10px' width='24'>" +
                    "      <div style='width: 24px; height: 24px; overflow: hidden;'>" +
                    "        <img " + src + " style='height: 100%;'/>" +
                    "      </div>" +
                    "    </td>" +
                    "    <td style='vertical-align:middle;'>" +
                    "      <h6>" +
                    "        " + dateP + " " +
                    "        <a href='" + entry.link + "'>" + entry.title + "</a>" +
                    "        (" + entry.category + ") " +
                    "        <img align='right' src='imgs/novo.png'>" +
                    "      </h6>" +
                    "    </td>" +
                    "  </tr>" +
                    "</table>";
        } else {
            html = "<table>" +
                    "  <tr>" +
                    "    <td style='vertical-align:middle; padding-right:10px' width='24'>" +
                    "      <div style='width: 24px; height: 24px; overflow: hidden;'>" +
                    "        <img " + src + " style='height: 100%;'/>" +
                    "      </div>" +
                    "    </td>" +
                    "    <td style='vertical-align:middle;'>" +
                    "      <h6>" +
                    "        " + dateP + " " +
                    "        <a href='" + entry.link + "' target=_blank>" + entry.title + "</a>" +
                    "        (" + entry.category + ")" +
                    "      </h6>" +
                    "    </td>" +
                    "  </tr>" +
                    "</table>";
        }

        var div = document.createElement("div");
        div.innerHTML = html;
        container.appendChild(div);
    }

    var lastArtical = new Date(Date.parse(json.items[0].pubDate));
    localStorage["lastPublishedDate"] = lastArtical;

//    showWindowSize();
}

var frm;
var frmAction;

function scriptonload() {
    if (page === null) {
        page = 1;
    }
    if (page === 1) {
        document.getElementById("1").style["border"] = "1px solid red";
    }
    if (page === 2) {
        document.getElementById("2").style["border"] = "1px solid red";
    }
    if (page === 3) {
        document.getElementById("3").style["border"] = "1px solid red";
    }

    frm = document.getElementById('search-form');
    frmAction = frm.action;
}

function clickHandler(e) {
    var search = document.getElementById('search').value;
    frm.action = frmAction + search;
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById("baraj").addEventListener('click', clickHandler);
    scriptonload();
//    weather();
    newArticles = localStorage["newArticles"];
    localStorage["newArticles"] = '';
    if (chrome.browserAction !== undefined) {
        chrome.browserAction.setBadgeText({text: localStorage["newArticles"]});
    }

    initialize();
});

function weather() {
    var feed = new google.feeds.Feed("http://wxdata.weather.com/wxdata/weather/rss/local/MKXX0001?unit=m");
    feed.setNumEntries(1);

    feed.load(function (result) {
        if (!result.error) {
            var entry = result.feed.entries[0];

            // "Mostly Cloudy, and 12 &deg; C. For more details?"
            var contentSnippet = entry.contentSnippet;
            var condition = contentSnippet.split(" &deg; C.")[0];
            var start = condition.lastIndexOf(" ");
            var weather = condition.substring(start);
            weather = weather + " \u00b0" + "C";

            var content = entry.content;
            var end = content.indexOf(">");
            var src = content.substring(0, end + 1);

            src = src.replace('alt=""', 'style="vertical-align:middle;"');
            src = src.replace('.gif', '.png');

            // bad url: http://image.weather.com/web/common/wxicons/31/33.png?12122006
            // good url: http://fcgi.weather.com/web/common/wxicons/31/33.png?12122006
            src = src.replace('image.weather.com', 'fcgi.weather.com');

            var weatherP = document.getElementById('weather');
            weatherP.innerHTML = "<b>\u0421\u043A\u043E\u043F\u0458\u0435 " + src + weather + "</b>";
            //weatherP.innerHTML = src;

        }
    });
}

function showWindowSize() {
    var page = document.getElementById("page");
    //get width size of the body
    var clientHei = window.document.body.clientHeight;
    page.innerHTML = clientHei;
}
