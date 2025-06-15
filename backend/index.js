const express = require('express');
const cors = require('cors');
const matchProducts = require('./utils/compareProducts');
const scrapeBlinkit = require('./scrapers/blinkit'); 
const fetchZeptoPrices = require('./scrapers/zepto');
const swiggyScrape= require('./scrapers/instamart');

const app = express();
app.use(cors());   // listen to every / port
app.use(express.json());
app.post('/search/swiggy',async(req,res)=>{
  const query=req.body.query;
  const results=await swiggyScrape(query);
  res.json(results);
})

app.post('/search/blinkit', async (req, res) => {
  const { query, pincode } = req.body;
  if (!query || !pincode) {
    return res.status(400).json({ error: 'Query and pincode required.' });
  }

  try {
    const results = await scrapeBlinkit(query, pincode);
    res.json(results);
  } catch (error) {
    console.error('Error scraping Blinkit:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

app.post('/search/zepto', async (req, res) => {
  const { query, pincode } = req.body;
  const results = await fetchZeptoPrices(query, pincode);
  res.json(results);
});

app.post('/search/compare', async (req, res) => {
  const { query, pincode } = req.body;
  if (!query || !pincode) {
    return res.status(400).json({ error: 'Query and pincode required.' });
  }

  try {
    const [blinkitData, zeptoData] = await Promise.all([
      scrapeBlinkit(query, pincode),
      fetchZeptoPrices(query, pincode),
    ]);

    const comparison = matchProducts(blinkitData, zeptoData);
    res.json(comparison);
  } catch (error) {
    console.error('Comparison error:', error);
    res.status(500).json({ error: 'Comparison failed.' });
  }
});


const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
