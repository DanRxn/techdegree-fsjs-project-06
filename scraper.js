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

// Log to the console that the script was run
console.log("✅ scraper.js was run!");