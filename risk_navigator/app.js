// Initialize Map centered on Kitakyushu
const map = L.map('map').setView([33.8835, 130.8752], 12);

// Initialize Map centered on Kitakyushu
const map = L.map('map').setView([33.8835, 130.8752], 12);

// Base Layer: Dark Matter
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
	maxZoom: 20
}).addTo(map);

// GSI Hazard Layers (Japan Geospatial Information Authority)
// Flood (L2 - Largest Scale)
const floodLayer = L.tileLayer('https://disaportal.gsi.go.jp/maps/layers/01_flood_l2_shinsuishin_data/{z}/{x}/{y}.png', {
    opacity: 0.6,
    attribution: 'Includes GSI Disaportal Data'
});

// Landslide (Steep Slope Warning Area)
const landslideLayer = L.tileLayer('https://disaportal.gsi.go.jp/maps/layers/05_dosekiryukeikai/{z}/{x}/{y}.png', {
    opacity: 0.6,
    attribution: 'Includes GSI Disaportal Data'
});

// Layer Toggles
document.getElementById('layer-flood').addEventListener('change', (e) => {
    if (e.target.checked) {
        map.addLayer(floodLayer);
    } else {
        map.removeLayer(floodLayer);
    }
});

document.getElementById('layer-landslide').addEventListener('change', (e) => {
    if (e.target.checked) {
        map.addLayer(landslideLayer);
    } else {
        map.removeLayer(landslideLayer);
    }
});

// State Variables
let currentRainfall = 0; // mm/h
let geoJsonLayer = null;

// Icons
const createIcon = (color) => {
    return L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color:${color}; width:16px; height:16px; border-radius:50%; border:2px solid white; box-shadow: 0 0 10px ${color};"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    });
};

// Risk Calculation Logic
function calculateRiskScore(props, rain) {
    const currentYear = new Date().getFullYear();
    const age = currentYear - props.installYear;
    
    // Normalize Age Risk (0-1) - Assume 60 years is high risk
    const ageRisk = Math.min(age / 60, 1.0);
    
    // Realtime Weather Impact
    // If rain > 20mm, impact increases drastically
    const weatherImpact = Math.min(rain / 50, 1.0); // 50mm/h is max impact

    // Formula: (Age * Hazard) + (Rain * Impact)
    // Weighting: Static factors 40%, Dynamic 60% in heavy rain
    const staticScore = ageRisk * props.hazardLevel;
    const dynamicScore = weatherImpact * 1.5; // Amplify weather impact

    let totalScore = staticScore + dynamicScore;
    
    return Math.min(totalScore, 2.0); // Cap at 2.0
}

function getRiskLevel(score) {
    if (score > 1.2) return { level: 'High', color: '#ef4444' }; // Red
    if (score > 0.6) return { level: 'Mid', color: '#eab308' };  // Yellow
    return { level: 'Low', color: '#22c55e' };                  // Green
}

// Render Markers
function renderMarkers() {
    if (geoJsonLayer) {
        map.removeLayer(geoJsonLayer);
    }

    geoJsonLayer = L.geoJSON(infrastructureData, {
        pointToLayer: function (feature, latlng) {
            const riskScore = calculateRiskScore(feature.properties, currentRainfall);
            const riskInfo = getRiskLevel(riskScore);
            
            return L.marker(latlng, {
                icon: createIcon(riskInfo.color)
            });
        },
        onEachFeature: function (feature, layer) {
            const riskScore = calculateRiskScore(feature.properties, currentRainfall);
            const riskInfo = getRiskLevel(riskScore);
            
            const popupContent = `
                <div class="popup-content">
                    <h3>${feature.properties.name}</h3>
                    <div class="popup-row"><span>Type:</span> <span>${feature.properties.type}</span></div>
                    <div class="popup-row"><span>Built:</span> <span>${feature.properties.installYear}</span></div>
                    <div class="popup-row"><span>Hazard Level:</span> <span>${feature.properties.hazardLevel}</span></div>
                    <div class="popup-row"><span>Current Rain:</span> <span>${currentRainfall} mm/h</span></div>
                    <hr style="margin: 5px 0; opacity: 0.3;">
                    <div class="popup-row risk-score">
                        <span>Risk Score:</span> 
                        <span class="risk-${riskInfo.level.toLowerCase()}">${riskInfo.level} (${riskScore.toFixed(2)})</span>
                    </div>
                    <button class="report-btn" onclick="generateReport('${feature.properties.id}')">
                        <i class="fa-solid fa-file-pen"></i> Generate Draft
                    </button>
                </div>
            `;
            layer.bindPopup(popupContent);
        }
    }).addTo(map);
}

// Initial Render
renderMarkers();

// UI Interactions
const weatherEl = document.getElementById('current-weather');
const simulateBtn = document.getElementById('simulate-rain-btn');
const resetBtn = document.getElementById('reset-btn');

simulateBtn.addEventListener('click', () => {
    // Simulate a storm
    currentRainfall = 35 + Math.floor(Math.random() * 20); // 35-55 mm/h
    weatherEl.textContent = `Storm: ${currentRainfall} mm/h`;
    renderMarkers(); // Re-render with new colors
});

resetBtn.addEventListener('click', () => {
    currentRainfall = 0;
    weatherEl.textContent = `Clear: 0 mm/h`;
    renderMarkers();
});

// Mock Report Generation Function
window.generateReport = function(id) {
    const feature = infrastructureData.features.find(f => f.properties.id === id);
    if (!feature) return;

    const reportText = `
    [DRAFT INSPECTION ORDER]
    ID: ${feature.properties.id}
    Location: ${feature.properties.name}
    Priority: URGENT
    
    Detected Trigger:
    - High Rainfall (${currentRainfall}mm/h)
    - Structural Age (${2025 - feature.properties.installYear} years)
    - Hazard Zone Rating: ${feature.properties.hazardLevel}
    
    Action Required:
    Immediate visual inspection of slope/foundation stability required within 24 hours.
    `;
    
    alert(reportText);
    console.log(reportText);
}

// Initial Status
weatherEl.textContent = `Clear: 0 mm/h`;
