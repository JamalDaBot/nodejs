
const http = require('http');
const PORT = 3000;

const checker = require('ikea-availability-checker');
const https = require('request');

var lastStockChange = null;
var lastProbabilityChange = null;
var lastRestockChange = null;
var stockInterval = null;
var lastCheckedAt = null;
var runOnce = false;

async function checkStock() {
    
    const result = await checker.availability('004', '79017837');
    
    if (lastStockChange === null) lastStockChange = result.stock;
    if (lastProbabilityChange === null) lastProbabilityChange = result.probability;
    if (lastRestockChange === null) lastRestockChange = result.restockDate;
    lastCheckedAt = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });
    
    if (result.stock !== lastStockChange || result.probability !== lastProbabilityChange) {
      let daMessage = `stock chang from ${lastStockChange} to ${result.stock}, probability change from ${lastProbabilityChange} to ${result.probability}, restock from ${lastRestockChange} to ${result.restockDate}`;
      lastStockChange = result.stock;
      lastProbabilityChange = result.probability;
        lastRestockChange = result.restockDate;
      sendDaMessage(daMessage);
      console.log(daMessage);
      if (runOnce) clearInterval(stockInterval);
      return;
    }
    console.log(result.stock, result.probability, result.restockDate);
    //console.log('RESULT', result);
    //setTimeout(checkStock, 1000*10);
}

function sendDaMessage(daChanges) {
    https.post(
        'https://discord.com/api/webhooks/1151708354650054708/ugxYceuJrLyZTBF5MkXrxhy1DDdRKKWAW9khdTJaw-_kVDo7Q8ory3s-Ccl4-4_sy6GR',
            { json: { content: 'somethin in da stock change  <@&878330216156631071> : ' + daChanges, username: 'hyper x furniture' } },
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    console.log(body);
                }
            }
        );
}

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end(`stock: ${lastStockChange} probability: ${lastProbabilityChange} restock: ${lastRestockChange}, as of ${lastCheckedAt}`);
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});

sendDaMessage("YO WATUP, I B WATCHIN");

stockInterval = setInterval(checkStock, 1000*30);
