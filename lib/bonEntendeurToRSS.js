let cheerio = require('cheerio')
var RSS = require('rss');


var bonEntendeurToRSS = {

    convert: function(html, callback) {
        let $ = cheerio.load(html)
        let tmpItems = []
        var itemList = [];
        
        // <section id="musicSearch"
        // <ul id="music" class="list">
        // <li  data-slug="le-culot" data-title="Le Culot" data-celeb="Coluche"  data-thumbnail="http://bonentendeur.com/wp-content/uploads/2017/11/36-coluche-180x180.jpg" data-background="http://bonentendeur.com/wp-content/uploads/2017/11/36-coluche.jpg" data-url="http://bonentendeurmedia.com/mixtape/36_autumn_2017_coluche.mp3" class="last current">
        
        var feed = new RSS({
            title: 'BonEntendeur',
            description: 'Bon Entendeur, c’est avant tout un trio d’amis fédérés par une même passion de la musique et de son esthétique, et qui utilise celle-ci pour sublimer la culture française et les personnalités qui l’incarnent.',
            feed_url: 'http://example.com/rss.xml',
            site_url: 'http://bonentendeur.com',
            image_url: 'http://bonentendeur.com//wp-content/themes/bonentendeur/assets/img/about.jpg',
            docs: 'http://bonentendeur.com/rss/docs.html',
            managingEditor: 'TODO',
            webMaster: 'TODO',
            copyright: 'TODO',
            language: 'fr',
            categories: ['Music'],
            pubDate: 'May 20, 2012 04:00:00 GMT',
            ttl: '60',
            custom_namespaces: {
              'itunes': 'NA'
            },
        });

        htmlItems = $('#musicSearch').find('li')
        htmlItems.each(function(index, element){
            let splittedURL = $(element).attr('data-thumbnail').split("/");
            let extractedDate = splittedURL[5] + '/' + splittedURL[6] + '/01'
            feed.item({
                title:  $(element).attr('data-title'),
                description: $(element).attr('data-title') + ' feat ' + $(element).attr('data-celeb'),
                url: 'http://bonentendeur.com/#' + $(element).attr('data-slug'), // link to the item
                summary: {url: 'https://s3-us-west-1.amazonaws.com/floz-rss-feed-reader/' + $(element).attr('data-slug') + '-summary.mp3'},
                guid: $(element).attr('data-slug'), // optional - defaults to url
                author: 'Bon Entendeur', // optional - defaults to feed author property
                date: extractedDate, // any format that js Date can parse.
                enclosure: { type: 'audio/mpeg', url: $(element).attr('data-url').replace(/^http:\/\//i, 'https://')}, // optional enclosure
            });
        })
        /* loop over data and add to feed */
        
        
        // cache the xml to send to clients
        var rss = feed.xml();
          
         callback(rss);
    },
}

module.exports = bonEntendeurToRSS;