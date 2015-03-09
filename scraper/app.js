var request = require('request');
var cheerio = require('cheerio');
var Q = require('q');

var url = "http://www.grandprix.com/gpe/races.html";
var base_url = "http://www.grandprix.com/";
var years = [];


function getYearsUrls() {
    var defer = Q.defer();

    request(url, function (error, response, html) {

        if (error) {
            console.error(error);
            return;
        }
        var $ = cheerio.load(html);
        $("br").remove();
        var year_urls = cheerio.load($(".wsw-raceyeartitle").html());
        var links = year_urls("a");
        for (var i = 0; i < links.length; i++) {
            years.push(links[i].attribs.href);
            console.log(links[i].attribs.href);
        }
        defer.resolve(true);

        return defer.promise;
    });
}

getYearsUrls().then(function(){
    console.log("every url printed");
})