// Global variables
let currentPrices = {};
let refreshInterval = null;

// Configuration
const REFRESH_INTERVAL = 15 * 60 * 1000; // 15 minutes
const API_BASE_URL = 'http://localhost:5000';

// Master tab system
let isMasterTab = false;

window.addEventListener('load', () => {
    if (!localStorage.getItem('goldTrackerActiveTab')) {
        isMasterTab = true;
        localStorage.setItem('goldTrackerActiveTab', Date.now().toString());
        console.log('🎯 MASTER tab - will auto-refresh');
    } else {
        console.log('⏸️ PASSIVE tab - display only');
    }
    
    fetchGoldPrices();
    
    if (isMasterTab) {
        refreshInterval = setInterval(fetchGoldPrices, REFRESH_INTERVAL);
        console.log(`⏰ Auto-refresh: every ${REFRESH_INTERVAL / 60000} minutes`);
    }
});

window.addEventListener('beforeunload', () => {
    if (isMasterTab) {
        localStorage.removeItem('goldTrackerActiveTab');
    }
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }
});

document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        console.log('👀 Tab visible - fetching fresh data');
        fetchGoldPrices();
    }
});

async function fetchGoldPrices() {
    try {
        console.log('📡 Fetching gold prices...');
        const response = await fetch(`${API_BASE_URL}/api/gold-price`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        currentPrices = data;
        
        // Update prices
        document.getElementById('gold24k').textContent = `₹${data.gold24K.toLocaleString()}`;
        document.getElementById('gold22k').textContent = `₹${data.gold22K.toLocaleString()}`;
        document.getElementById('gold18k').textContent = `₹${data.gold18K.toLocaleString()}`;
        
        // Update timestamp
        const date = new Date(data.lastUpdated);
        const cacheInfo = data.fromCache ? ' 💾 (cached)' : ' 🔴 (live)';
        document.getElementById('lastUpdated').textContent = 
            `Last updated: ${date.toLocaleString('en-IN')}${cacheInfo}`;
        
        // Update next Chennai update time (if element exists)
        if (document.getElementById('nextUpdate') && data.nextChennaiUpdate) {
            document.getElementById('nextUpdate').textContent = 
                `⏰ Next Chennai price update in: ${data.nextChennaiUpdate}`;
        }
        
        console.log(`✅ Updated | Cache: ${data.fromCache || false}`);
            
    } catch (error) {
        console.error('❌ Error:', error);
        document.getElementById('gold24k').textContent = '₹---';
        document.getElementById('gold22k').textContent = '₹---';
        document.getElementById('gold18k').textContent = '₹---';
        document.getElementById('lastUpdated').textContent = 
            'Failed to load. Please refresh.';
    }
}

async function calculateGST() {
    const goldPrice = parseFloat(document.getElementById('goldPrice').value);
    const grams = parseFloat(document.getElementById('grams').value);
    
    if (isNaN(goldPrice) || isNaN(grams) || goldPrice <= 0 || grams <= 0) {
        alert('Please enter valid positive numbers');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/calculate-gst`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ goldPrice, grams })
        });
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        
        document.getElementById('gstResult').style.display = 'block';
        document.getElementById('basePrice').textContent = `₹${data.basePrice.toLocaleString()}`;
        document.getElementById('gst').textContent = `₹${data.gst.toLocaleString()}`;
        document.getElementById('makingCharges').textContent = `₹${data.makingCharges.toLocaleString()}`;
        document.getElementById('totalPrice').textContent = `₹${data.totalPrice.toLocaleString()}`;
        
    } catch (error) {
        console.error('❌ Error:', error);
        alert('Calculation failed. Try again.');
    }
}

function calculateInvestment() {
    const budget = parseFloat(document.getElementById('budget').value);
    const purity = document.getElementById('purity').value;
    
    if (isNaN(budget) || budget <= 0) {
        alert('Enter valid budget');
        return;
    }
    
    if (!currentPrices.gold24K) {
        alert('Wait for prices to load');
        return;
    }
    
    let pricePerGram;
    switch(purity) {
        case '24k': pricePerGram = currentPrices.gold24K; break;
        case '22k': pricePerGram = currentPrices.gold22K; break;
        case '18k': pricePerGram = currentPrices.gold18K; break;
        default: pricePerGram = currentPrices.gold22K;
    }
    
    const grams = (budget / pricePerGram).toFixed(2);
    
    document.getElementById('investmentResult').style.display = 'block';
    document.getElementById('goldAmount').textContent = `${grams} grams`;
}