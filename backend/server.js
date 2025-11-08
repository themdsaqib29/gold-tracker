const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// ===== CONFIGURATION =====
const API_KEY = '336e68461c6341f970f239189aa407ff61d167a8dbffc4762375415e51c92760';
const USD_TO_INR = 83;

// CHENNAI PREMIUM FACTORS (Fine-tuned for accuracy)
const CHENNAI_PREMIUM_24K = 1.143; // 14.3%
const CHENNAI_PREMIUM_22K = 1.145; // 14.5%
const CHENNAI_PREMIUM_18K = 1.16;  // 16%

// ===== CACHING SYSTEM =====
let priceCache = {
  data: null,
  lastFetched: null
};

// Check if near Chennai price update time (12 AM or 12 PM)
function isNearPriceUpdateTime() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  
  const nearMidnight = (hours === 23 && minutes >= 55) || (hours === 0 && minutes <= 5);
  const nearNoon = (hours === 11 && minutes >= 55) || (hours === 12 && minutes <= 5);
  
  return nearMidnight || nearNoon;
}

// Calculate time until next Chennai update
function getTimeUntilNextUpdate() {
  const now = new Date();
  const currentHours = now.getHours();
  
  let nextUpdate;
  if (currentHours < 12) {
    nextUpdate = new Date(now);
    nextUpdate.setHours(12, 0, 0, 0);
  } else {
    nextUpdate = new Date(now);
    nextUpdate.setDate(nextUpdate.getDate() + 1);
    nextUpdate.setHours(0, 0, 0, 0);
  }
  
  const msUntilUpdate = nextUpdate - now;
  const hoursUntil = Math.floor(msUntilUpdate / (1000 * 60 * 60));
  const minutesUntil = Math.floor((msUntilUpdate % (1000 * 60 * 60)) / (1000 * 60));
  
  return {
    ms: msUntilUpdate,
    display: `${hoursUntil}h ${minutesUntil}m`
  };
}

// Smart cache validation
function isCacheValid() {
  if (!priceCache.data || !priceCache.lastFetched) {
    return false;
  }
  
  const now = Date.now();
  const cacheAge = now - priceCache.lastFetched;
  const CACHE_DURATION = 90 * 60 * 1000; // 90 minutes
  
  if (isNearPriceUpdateTime()) {
    console.log('⏰ Near Chennai update time - forcing refresh');
    return false;
  }
  
  return cacheAge < CACHE_DURATION;
}

// Fetch fresh gold prices
async function fetchFreshGoldPrices() {
  const url = 'https://api.gold-api.com/price/XAU';
  
  console.log('🔄 Fetching from Gold-API.com...');
  
  const response = await axios.get(url, {
    headers: {
      'x-access-token': API_KEY,
      'Content-Type': 'application/json'
    }
  });
  
  const pricePerOunceUSD = response.data.price;
  const pricePerGramUSD = pricePerOunceUSD / 31.1035;
  const pricePerGramINR = pricePerGramUSD * USD_TO_INR;
  
  // Apply DIFFERENT Chennai premiums for accuracy
  const prices = {
    gold24K: Math.round(pricePerGramINR * CHENNAI_PREMIUM_24K),
    gold22K: Math.round(pricePerGramINR * 0.916 * CHENNAI_PREMIUM_22K),
    gold18K: Math.round(pricePerGramINR * 0.75 * CHENNAI_PREMIUM_18K),
    location: "Chennai, Tamil Nadu",
    source: "Gold-API.com with Chennai market adjustment",
    disclaimer: "Chennai gold prices update at 12:00 AM and 12:00 PM daily. These are indicative rates - verify with local jewelers.",
    internationalPriceUSD: Math.round(pricePerOunceUSD * 100) / 100,
    nextChennaiUpdate: getTimeUntilNextUpdate().display,
    lastUpdated: response.data.updatedAt || new Date().toISOString(),
    cachedAt: new Date().toISOString()
  };
  
  priceCache.data = prices;
  priceCache.lastFetched = Date.now();
  
  const nextUpdate = getTimeUntilNextUpdate();
  console.log(`✅ Updated! Next Chennai update: ${nextUpdate.display}`);
  console.log(`📊 24K: ₹${prices.gold24K} | 22K: ₹${prices.gold22K} | 18K: ₹${prices.gold18K}`);
  
  return prices;
}

// ===== ROUTES =====

app.get('/', (req, res) => {
  const nextUpdate = getTimeUntilNextUpdate();
  res.json({ 
    message: 'Gold Tracker API - Chennai Edition 🚀',
    status: 'Active',
    cacheStatus: isCacheValid() ? 'Valid' : 'Expired',
    nextChennaiUpdate: nextUpdate.display,
    location: 'Chennai, Tamil Nadu',
    updateSchedule: '12:00 AM & 12:00 PM daily'
  });
});

app.get('/api/gold-price', async (req, res) => {
  try {
    if (isCacheValid()) {
      console.log('⚡ Serving from cache');
      const cacheAgeMin = Math.round((Date.now() - priceCache.lastFetched) / 60000);
      return res.json({
        ...priceCache.data,
        fromCache: true,
        cacheAge: `${cacheAgeMin} minutes`
      });
    }
    
    const prices = await fetchFreshGoldPrices();
    res.json({
      ...prices,
      fromCache: false
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (priceCache.data) {
      console.log('⚠️ Serving stale cache');
      const cacheAgeMin = Math.round((Date.now() - priceCache.lastFetched) / 60000);
      return res.json({
        ...priceCache.data,
        fromCache: true,
        warning: 'Using cached data (API error)',
        cacheAge: `${cacheAgeMin} minutes`
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to fetch prices',
      message: 'Please try again'
    });
  }
});

app.post('/api/calculate-gst', (req, res) => {
  const { goldPrice, grams } = req.body;
  
  if (isNaN(goldPrice) || isNaN(grams) || goldPrice <= 0 || grams <= 0) {
    return res.status(400).json({ 
      error: 'Invalid input',
      message: 'Enter valid positive numbers'
    });
  }
  
  const basePrice = goldPrice * grams;
  const gst = basePrice * 0.03;
  const makingCharges = basePrice * 0.02;
  const totalPrice = basePrice + gst + makingCharges;
  
  res.json({
    basePrice: Math.round(basePrice),
    gst: Math.round(gst),
    makingCharges: Math.round(makingCharges),
    totalPrice: Math.round(totalPrice)
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  const nextUpdate = getTimeUntilNextUpdate();
  console.log('='.repeat(60));
  console.log('🚀 Gold Tracker API - Chennai Edition');
  console.log('='.repeat(60));
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`🏙️  Chennai (24K: 14.3% | 22K: 14.5% | 18K: 16% premium)`);
  console.log(`⏰ Cache: 90 min (8 calls/12hrs)`);
  console.log(`🔄 Chennai updates: 12 AM & 12 PM`);
  console.log(`⏳ Next update: ${nextUpdate.display}`);
  console.log('='.repeat(60));
});