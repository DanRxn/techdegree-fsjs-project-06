// Require modules
const fs = require('fs'); // For file system interactions
const Crawler = require('crawler');
const Json2csvParser = require('json2csv').Parser;

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

// Crawl homepage for product links
const homepage = 'http://shirts4mike.com/shirts.php';
let productLinks = [];

	// Helper functions
// Make relative path into absolute URL
function absoluteUrl(relativeUrl) {
	return `http://shirts4mike.com/${relativeUrl}`;
}

// Print human-readable errors
function printError(error) {
	appendToErrorLog(error);
	console.error(`\n \n Sorry, cannot connect to ${homepage}. Please check your Internet connection and try again. \n (${error}) \n \n`);
}

// Save CSV file
function saveCsvFile(csv) {
	const date = (new Date()).toISOString().split('T')[0];
	fs.writeFile(`./data/${date}.csv`, csv, function(err) {
		if(err) {
				return console.log(err);
		}
		console.log("\n ✅ \n The scraped product data was saved!\n");
	}); 
}

// Append error to log file
function appendToErrorLog(error) {
	const logFile = 'scraper-error.log';
	const timeStamp = new Date().toString();
	const logLine = `[${timeStamp}] ${error} \n`;
	fs.appendFileSync(logFile, logLine);
}


// Declare array of objects (to-be attrs: Title, Price, ImageURL, URL, Time)
let scrapedData = [];

	// Callback for getting product links
function getProductLinks(error, res, done) {
	if(error) {
		printError(error);
	} else {
		let $ = res.$;
		$('a').each(function(i, elem) {
			let link = $(this).attr('href');
			if (link.startsWith('shirt.php?')) {
				// Make link the absolute address, not relative
				link = link;
				// Add link to productLinks array
				productLinks.push(absoluteUrl(link));
			}
		});
		crawlProductPage.queue(productLinks);
	}
	done();
	// ⚠️ Fix this timeout hack (not sure how yet)
	setTimeout(() => {
		writeProductsCsv(scrapedData)
	}, 2000);
}

	// Callback for getting product links
function getProductData(error, res, done) {
	if(error) {
		printError(error);
	} else {
		let $ = res.$;
		// Select relavant page $elements (Title, Price, ImageURL, URL, Time)
		const date = new Date();

		const title = $('title').text();
		const price = $('.price').text();
		const imageUrl = absoluteUrl($('.shirt-picture > span > img').attr('src'));
		const url = res.options.uri;
		const time = `${date.getUTCHours()}:${date.getUTCMinutes()}:${date.getUTCSeconds()}`
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
	}
	done();
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

const crawlHomepage = new Crawler({
	maxConnections : 10,
	callback : getProductLinks
});

const crawlProductPage = new Crawler({
	maxConnections : 10,
	callback : getProductData
})

crawlHomepage.queue(homepage);