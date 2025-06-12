const express = require('express');
const cors = require('cors');
const scrapeBlinkit = require('./scrapers/blinkit'); 
const fetchZeptoPrices = require('./scrapers/zepto');

const app = express();
app.use(cors());
app.use(express.json());

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

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
