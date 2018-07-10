// Require modules
const fs = require('fs'); // For file system interactions
const Crawler = require('crawler');

// Create `data` folder, if not already existing
function createDataFolder() {
	const dataFolder = './data';
	if (!fs.existsSync(dataFolder)) {
		fs.mkdir(dataFolder);
		console.log('Created the `data` folder...');
	} else {
		console.log('The `data` folder already exists...');
	}
}
createDataFolder();

// Craw homepage for product links
const homepage = 'http://shirts4mike.com/shirts.php';
let productLinks = [];

// Declare array of objects (to-be attrs: Title, Price, ImageURL, URL, Time)
let scrapedData = [];

	// Callback for getting product links
function getProductLinks(error, res, done) {
	if(error) {
		console.error(error);
	} else {
		let $ = res.$;
		$('a').each(function(i, elem) {
			let link = $(this).attr('href');
			if (link.startsWith('shirt.php?')) {
				// Make link the absolute address, not relative
				link = `http://shirts4mike.com/${link}`;
				// Add link to productLinks array
				productLinks.push(link);
			}
		});
	}
	done();
	console.log('productLinks: ', productLinks);
}

let crawlHomepage = new Crawler({
	maxConnections : 10,
	callback : getProductLinks
});

crawlHomepage.queue(homepage);

// Log to the console that the script was run
console.log("✅ scraper.js was run!");