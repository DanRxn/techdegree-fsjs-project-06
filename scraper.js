// Require modules
const fs = require('fs'); // For file system interactions
const Crawler = require('crawler'); // For the Crawler npm module
const Json2csvParser = require('json2csv').Parser; // For the json2csv npm module

// Delcare vars to crawl homepage for product links
const entryPage = 'http://shirts4mike.com/shirts.php';
let productLinks = [];

// Declare array of objects to hold scraped product data
let scrapedData = [];

// Create `data` folder, if not already existing
function createDataFolder() {
	const dataFolder = './data';
	if (!fs.existsSync(dataFolder)) {
		fs.mkdir(dataFolder, (err) => {
			if(err) {
				appendToErrorLog(err);
				return console.log(err);
			}
		});
		console.log('Writing scraped data to the `data` folder...');
	} else {
		console.log('Writing scraped data to a new file in the existing `data` folder...');
	}
}
createDataFolder();

	// Helper functions
	// ---------------
// Make relative path into absolute URL
function getAbsoluteUrl(relativeUrl) {
	return `http://shirts4mike.com/${relativeUrl}`;
}

// Print human-readable errors
function printConnectionError(error) {
	appendToErrorLog(error);
	console.error(`\n \n Sorry, cannot connect to ${entryPage}. Please check your Internet connection and try again. \n (${error}) \n \n`);
}

// Save CSV file
function saveCsvFile(csv) {
	const date = (new Date()).toISOString().split('T')[0];
	fs.writeFile(`./data/${date}.csv`, csv, function(err) {
		if(err) {
			appendToErrorLog(err);
			return console.log(err);
		}
	});
	if (productLinks.length === scrapedData.length) {
		console.log("\n✅ The scraped product data was saved! ✅\n");
	} 
}

// Append error to log file
function appendToErrorLog(error) {
	const logLine = `[${new Date().toString()}] ${error} \n`;
	fs.appendFileSync('scraper-error.log', logLine);
}

// Write data to CSV
function writeProductsCsv(products) {
	// Convert scrapedData to csv
	const fields = ['Title', 'Price', 'ImageURL', 'URL', 'Time'];
	const productsParser = new Json2csvParser({fields});
	const csv = productsParser.parse(products);
	// Save file to disk
	saveCsvFile(csv);
}

	// Scraper callback functions
	// ------------------------

// Callback for getting product links
function getProductLinks(error, res, done) {
	if(error) {
		printConnectionError(error);
	} else {
		let $ = res.$;
		$('a').each(function(i, elem) {
			let link = $(this).attr('href');
			if (link.startsWith('shirt.php?')) {
				// Add link to productLinks array
				productLinks.push(getAbsoluteUrl(link));
			}
		});
		// Crawl all product pages, from productLinks array
		crawlProductPage.queue(productLinks);
	}
	done();
}

// Callback for getting product links
function getProductData(error, res, done) {
	if(error) {
		printConnectionError(error);
	} else {
		let $ = res.$;
		// Select relavant page $elements (Title, Price, ImageURL, URL, Time)
		const title = $('title').text();
		const price = $('.price').text();
		const imageUrl = getAbsoluteUrl($('.shirt-picture > span > img').attr('src'));
		const url = res.options.uri;
		const time = new Date().toUTCString();
		// Construct object for given product
		const product = {
			Title : title,
			Price : price,
			ImageURL : imageUrl,
			URL : url,
			Time : time
		};
		// Add object to scrapedData array
		scrapedData.push(product);
		writeProductsCsv(scrapedData);
	}
	done();
}

// Instantiating Crawler for homepage
const crawlEntryPage = new Crawler({
	maxConnections : 10,
	callback : getProductLinks
});

// Instantiating Crawler for product pages
const crawlProductPage = new Crawler({
	maxConnections : 10,
	callback : getProductData
})

// Queuing entry page URL for crawling
crawlEntryPage.queue(entryPage);