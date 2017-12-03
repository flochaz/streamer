require('dotenv').config();

var assert = require('assert');
var fs = require('fs');
var parseString = require('xml2js').parseString;

var bonEntendeurToRSS = require('../lib/bonEntendeurToRSS');


describe('bonEntendeurToRSS', function() {
    describe('#convert', function() {
        this.timeout(10000);
        var start = new Date().getTime();

        it("Convert", function(done) {
            fs.readFile('test/bonentendeur.com.html', function(error, data) {
                bonEntendeurToRSS.convert(data,
                        function (rss) {
                            console.log(rss)
                            console.log("TIME: " + (new Date().getTime() - start));
                            parseString(rss, function (err, result) {
                                assert.equal(result['rss']['channel'][0]['title'], 'BonEntendeur');
                            });
                            done();
                        }
                    );
            })
        });
    });
});


