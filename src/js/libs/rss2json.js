/*
 * Example Usage: 
 * 
 *   $.get('http://cors.io/sprunge.us/ILRc', function(data) {
 *     window.xmlData = data;
 *     window.domParser = new DOMParser();
 *     window.parsedXML = domParser.parseFromString(window.xmlData, 'text/xml');
 *     window.jsonFeed = rss2json(parsedXML);
 *   });
 * 
 */

window.rss2json = function (feed) {
    String.prototype.c = function () {
        var newStr = this.replace("<![CDATA[", "").replace("]]>", "");
        return newStr;
    };
    var json = {
        title: feed.querySelector('title').innerHTML.c(),
        description: feed.querySelector('description').innerHTML.c(),
        link: feed.querySelector('link').innerHTML.c(),
//      image: {
//          url: feed.querySelector('image url').innerHTML.c(),
//          title: feed.querySelector('image title').innerHTML.c(),
//          link: feed.querySelector('image link').innerHTML.c()
//      },
//      author: feed.querySelector('author').innerHTML.c(),
        items: []
    };
    for (var j = 0; j < feed.querySelectorAll('item').length; j++) {
        itm = feed.querySelectorAll('item')[j];
        json.items[j] = {
            title: itm.querySelector('title').innerHTML.c(),
            description: itm.querySelector('description').innerHTML.c(),
            link: itm.querySelector('link').innerHTML.c(),
            pubDate: itm.querySelector('pubDate').innerHTML.c(),
            category: itm.querySelector('category').innerHTML.c()
        };
    }
    return json;
};