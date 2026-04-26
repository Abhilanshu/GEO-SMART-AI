/**
 * Predictive AI Service (Simulated)
 * In a real-world scenario, this would integrate with IMD (India Meteorological Department)
 * or NDMA (National Disaster Management Authority) APIs.
 */

const generateEarlyWarnings = () => {
  const highRiskZones = [
    { region: "Coastal Odisha", risk: "High", hazard: "Cyclone", probability: 0.85, eta: "48 hours" },
    { region: "North Uttarakhand", risk: "Medium", hazard: "Landslide", probability: 0.62, eta: "24 hours" },
    { region: "Assam Valley", risk: "Critical", hazard: "Flood", probability: 0.92, eta: "12 hours" },
    { region: "South Kerala", risk: "Low", hazard: "Heavy Rainfall", probability: 0.45, eta: "72 hours" }
  ];

  return highRiskZones;
};

const assessNeedVerification = (existingReports, newReport) => {
  // Logic: If multiple reports from different numbers in the same GPS radius (approx 500m)
  // mark as verified.
  const radius = 0.005; // approx 500m in lat/lng
  const matchingReports = existingReports.filter(r => {
    const latDiff = Math.abs(r.location.coordinates.lat - newReport.location.coordinates.lat);
    const lngDiff = Math.abs(r.location.coordinates.lng - newReport.location.coordinates.lng);
    return latDiff < radius && lngDiff < radius && r.category === newReport.category;
  });

  return {
    verified: matchingReports.length >= 2, // 3 total reports including new one
    matchCount: matchingReports.length + 1
  };
};

module.exports = { generateEarlyWarnings, assessNeedVerification };
