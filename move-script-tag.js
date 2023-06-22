const fs = require('fs');
const cheerio = require('cheerio');

// Read the HTML file
const html = fs.readFileSync('./build/index.html', 'utf-8');

// Parse the HTML
const $ = cheerio.load(html);

// Get the script element
const scriptElement = $('script[src*="./static/js/main."]').clone();

// Remove the original script element
$('script[src*="./static/js/main."]').remove();

// Append the script element to the end of the body
$('body').append(scriptElement);

// Write the updated HTML back to the file
fs.writeFileSync('./build/index.html', $.html());
