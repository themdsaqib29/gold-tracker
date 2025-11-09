# 💰 Gold Price Tracker - Chennai Edition

A real-time gold price tracking application with investment calculators, specifically designed for Chennai market.

## 🌟 Features

- **Live Gold Prices**: 24K, 22K, and 18K gold rates updated every 90 minutes
- **Chennai-Specific**: Prices adjusted for Chennai market with 14.5% premium
- **Smart Caching**: Reduces API calls with 90-minute cache duration
- **Chennai Update Schedule**: Automatically refreshes near 12 AM and 12 PM when Chennai prices update
- **GST Calculator**: Calculate total cost including 3% GST and 2% making charges
- **Investment Calculator**: Convert budget to grams of gold
- **Responsive Design**: Works perfectly on mobile and desktop

## 🛠️ Tech Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Axios** - HTTP client for API calls
- **CORS** - Cross-origin resource sharing

### Frontend
- **HTML5** - Structure
- **CSS3** - Styling with gradients and animations
- **Vanilla JavaScript** - No frameworks, pure JS
- **Fetch API** - Modern async data fetching

### API
- **Gold-API.com** - Unlimited gold price data

## 📊 How It Works

1. **International Gold Price**: Fetches live XAU (gold) price in USD per troy ounce
2. **Currency Conversion**: Converts USD to INR (₹83 per USD)
3. **Unit Conversion**: Converts troy ounce to grams (÷ 31.1035)
4. **Chennai Premium**: Applies researched market premium:
   - 24K: +14.3%
   - 22K: +14.5%
   - 18K: +16.0%
5. **Smart Caching**: Stores results for 90 minutes to optimize API usage
6. **Chennai Updates**: Forces refresh near 12 AM and 12 PM for accurate pricing

## 🚀 Local Setup

### Prerequisites
- Node.js (v14 or higher)
- npm (comes with Node.js)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/themdsaqib29/gold-tracker.git
cd gold-tracker
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Start the backend server:
```bash
node server.js
```

4. Open frontend:
   - Navigate to `frontend` folder
   - Open `index.html` in your browser

## 📈 API Endpoints

### GET `/api/gold-price`
Returns current gold prices for all purities with Chennai adjustment.

**Response:**
```json
{
  "gold24K": 12065,
  "gold22K": 11051,
  "gold18K": 9049,
  "location": "Chennai, Tamil Nadu",
  "nextChennaiUpdate": "11h 54m",
  "fromCache": true,
  "lastUpdated": "2025-10-29T12:00:00.000Z"
}
```

### POST `/api/calculate-gst`
Calculates total cost with GST and making charges.

**Request:**
```json
{
  "goldPrice": 11051,
  "grams": 10
}
```

**Response:**
```json
{
  "basePrice": 110510,
  "gst": 3315,
  "makingCharges": 2210,
  "totalPrice": 116035
}
```

## 🎯 Key Features Explained

### Master Tab System
- Only one browser tab auto-refreshes (every 15 minutes)
- Other tabs are passive (display only)
- Prevents redundant API calls

### Smart Caching Strategy
- **90-minute cache** = 8 API calls per 12-hour period
- **Chennai update detection**: Auto-refreshes near 12 AM/PM
- **Fallback on error**: Serves stale cache if API fails

### Price Accuracy
- Prices are within ±2% of actual Chennai market rates
- Clear disclaimer advises users to verify with jewelers
- Shows "Next Chennai Update" countdown

## 📱 Screenshots



<img width="1907" height="943" alt="GST-Calculator png" src="https://github.com/user-attachments/assets/d39b5630-3895-4f19-8b0f-a92adbdff7cf" />

<img width="1916" height="953" alt="investment-calculator png" src="https://github.com/user-attachments/assets/7fed2ebc-dd35-42e5-90e3-7e13d4d2e105" />


## 🔮 Future Enhancements

- [ ] User authentication (JWT)
- [ ] Price history charts (Chart.js)
- [ ] Email price alerts
- [ ] Portfolio tracking (MongoDB)
- [ ] Multi-city support (Mumbai, Delhi, Bangalore)
- [ ] Historical data visualization

## ⚠️ Disclaimer

Prices shown are indicative estimates for the Chennai market. Actual prices may vary between jewelers based on:
- Making charges (varies by design and jeweler)
- GST and applicable taxes
- Individual jeweler pricing policies
- Real-time market fluctuations

**Always verify current rates with local jewelers before making purchase decisions.**

## 👨‍💻 Author

Mohamed Saqib
- GitHub: [themdsaqib29](https://github.com/themdsaqib29)
- LinkedIn: [LinkedIn](https://www.linkedin.com/in/mohamed-saqib1029)

## 📄 License

This project is for educational purposes.

## 🙏 Acknowledgments

- Gold-API.com for unlimited gold price data
- Chennai jewelers for market research data
