const express = require('express');
const cors = require('cors');
const matchProducts = require('./utils/compareProducts');
const scrapeBlinkit = require('./scrapers/blinkit'); 
const fetchZeptoPrices = require('./scrapers/zepto');
const swiggyScrape= require('./scrapers/instamart');
const fetchLocation=require('./api')

const app = express();
app.use(cors());  
app.use(express.json());
app.post('/search/swiggy',async(req,res)=>{
  const {query,pincode}=req.body;
  const location=await fetchLocation(pincode)

  if (!query || !pincode) {
    return res.status(400).json({ error: 'Query and pincode required.' });
  }
  if(!location.latitude){
    return res.status(400).json({error:"Try searching with a more specific locality name "})
  }
  try {
    const results = await swiggyScrape(query, location);
    res.json(results);
  } catch (error) {
    console.error('Error scraping Blinkit:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
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
  const location=await fetchLocation(pincode);
  if (!query || !pincode) {
    return res.status(400).json({ error: 'Query and pincode required.' });
  }
  if(!location.latitude){
    return res.status(400).json({error:"Try searching with a more specific locality name "})
  }
  const results = await fetchZeptoPrices(query, location);
  res.json(results);
});

app.post('/search/compare', async (req, res) => {
  const { query, pincode } = req.body;
  const location=await fetchLocation(pincode)

  if (!query || !pincode) {
    return res.status(400).json({ error: 'Query and pincode required.' });
  }
  if(!location.latitude){
    return res.status(400).json({error:"Try searching with a more specific locality name "})
  }

  try {
    /* run all three scrapers in parallel */
    const [blinkitData, zeptoData, swiggyData] = await Promise.all([
      scrapeBlinkit(query, pincode),             // Blinkit takes pin directly
      fetchZeptoPrices(query, location),          // Zepto takes pin directly
      swiggyScrape(query, location)               // Instamart uses the pin as location text
    ]);

    /* merge them – matchProducts now accepts three arrays */
    const comparison = matchProducts(blinkitData, zeptoData, swiggyData);

    res.json(comparison);
  } catch (err) {
    console.error('Comparison error:', err);
    res.status(500).json({ error: 'Comparison failed.' });
  }
});


const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
