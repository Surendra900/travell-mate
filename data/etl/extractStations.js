// ETL Step 1: Extract Indian Railways Stations
// License: Government Open Data License (GODL-India) / Open Railway Data Commons
// Freshness: October 2026

export const RAW_STATIONS = [
  // Northern Trunk Hubs
  { code: 'NDLS', name: 'New Delhi Railway Station', city: 'Delhi', state: 'Delhi', lat: 28.6429, lng: 77.2195, junctionHub: true },
  { code: 'DLI', name: 'Old Delhi Junction', city: 'Delhi', state: 'Delhi', lat: 28.6619, lng: 77.2280, junctionHub: true },
  { code: 'NZM', name: 'Hazrat Nizamuddin', city: 'Delhi', state: 'Delhi', lat: 28.5892, lng: 77.2530, junctionHub: true },
  { code: 'ANVT', name: 'Anand Vihar Terminal', city: 'Delhi', state: 'Delhi', lat: 28.6469, lng: 77.3160, junctionHub: false },
  { code: 'AGC', name: 'Agra Cantt', city: 'Agra', state: 'Uttar Pradesh', lat: 27.1580, lng: 78.0098, junctionHub: true },
  { code: 'GWL', name: 'Gwalior Junction', city: 'Gwalior', state: 'Madhya Pradesh', lat: 26.2183, lng: 78.1828, junctionHub: true },
  { code: 'VGLJ', name: 'Virangana Lakshmibai Jhansi', city: 'Jhansi', state: 'Uttar Pradesh', lat: 25.4484, lng: 78.5685, junctionHub: true },
  { code: 'BPL', name: 'Bhopal Junction', city: 'Bhopal', state: 'Madhya Pradesh', lat: 23.2676, lng: 77.4126, junctionHub: true },
  { code: 'RKMP', name: 'Rani Kamlapati', city: 'Bhopal', state: 'Madhya Pradesh', lat: 23.2045, lng: 77.4410, junctionHub: true },
  { code: 'ET', name: 'Itarsi Junction', city: 'Itarsi', state: 'Madhya Pradesh', lat: 22.6125, lng: 77.7656, junctionHub: true },
  { code: 'NGP', name: 'Nagpur Junction', city: 'Nagpur', state: 'Maharashtra', lat: 21.1524, lng: 79.0888, junctionHub: true },

  // Eastern Trunk & Grand Chord
  { code: 'CNB', name: 'Kanpur Central', city: 'Kanpur', state: 'Uttar Pradesh', lat: 26.4547, lng: 80.3507, junctionHub: true },
  { code: 'LKO', name: 'Lucknow Charbagh', city: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8322, lng: 80.9206, junctionHub: true },
  { code: 'PRYJ', name: 'Prayagraj Junction', city: 'Prayagraj', state: 'Uttar Pradesh', lat: 25.4452, lng: 81.8296, junctionHub: true },
  { code: 'BSB', name: 'Varanasi Junction', city: 'Varanasi', state: 'Uttar Pradesh', lat: 25.3268, lng: 82.9863, junctionHub: true },
  { code: 'DDU', name: 'Pt. Deen Dayal Upadhyaya Junction', city: 'Mughalsarai', state: 'Uttar Pradesh', lat: 25.2818, lng: 83.1189, junctionHub: true },
  { code: 'GKP', name: 'Gorakhpur Junction', city: 'Gorakhpur', state: 'Uttar Pradesh', lat: 26.7588, lng: 83.3820, junctionHub: true },
  { code: 'PNBE', name: 'Patna Junction', city: 'Patna', state: 'Bihar', lat: 25.6023, lng: 85.1376, junctionHub: true },
  { code: 'GAYA', name: 'Gaya Junction', city: 'Gaya', state: 'Bihar', lat: 24.7964, lng: 85.0076, junctionHub: true },
  { code: 'DHN', name: 'Dhanbad Junction', city: 'Dhanbad', state: 'Jharkhand', lat: 23.7957, lng: 86.4304, junctionHub: true },
  { code: 'ASN', name: 'Asansol Junction', city: 'Asansol', state: 'West Bengal', lat: 23.6889, lng: 86.9661, junctionHub: true },
  { code: 'HWH', name: 'Howrah Junction', city: 'Kolkata', state: 'West Bengal', lat: 22.5850, lng: 88.3426, junctionHub: true },
  { code: 'SDAH', name: 'Sealdah', city: 'Kolkata', state: 'West Bengal', lat: 22.5697, lng: 88.3711, junctionHub: true },
  { code: 'KGP', name: 'Kharagpur Junction', city: 'Kharagpur', state: 'West Bengal', lat: 22.3392, lng: 87.3247, junctionHub: true },

  // Western Corridor
  { code: 'JP', name: 'Jaipur Junction', city: 'Jaipur', state: 'Rajasthan', lat: 26.9196, lng: 75.7878, junctionHub: true },
  { code: 'KOTA', name: 'Kota Junction', city: 'Kota', state: 'Rajasthan', lat: 25.2138, lng: 75.8648, junctionHub: true },
  { code: 'RTM', name: 'Ratlam Junction', city: 'Ratlam', state: 'Madhya Pradesh', lat: 23.3441, lng: 75.0552, junctionHub: true },
  { code: 'BRC', name: 'Vadodara Junction', city: 'Vadodara', state: 'Gujarat', lat: 22.3106, lng: 73.1812, junctionHub: true },
  { code: 'ADI', name: 'Ahmedabad Junction', city: 'Ahmedabad', state: 'Gujarat', lat: 23.0238, lng: 72.6012, junctionHub: true },
  { code: 'ST', name: 'Surat', city: 'Surat', state: 'Gujarat', lat: 21.2049, lng: 72.8406, junctionHub: false },
  { code: 'BSR', name: 'Vasai Road', city: 'Mumbai', state: 'Maharashtra', lat: 19.3828, lng: 72.8322, junctionHub: true },
  { code: 'MMCT', name: 'Mumbai Central', city: 'Mumbai', state: 'Maharashtra', lat: 18.9696, lng: 72.8194, junctionHub: true },
  { code: 'CSMT', name: 'Chhatrapati Shivaji Maharaj Terminus', city: 'Mumbai', state: 'Maharashtra', lat: 18.9402, lng: 72.8358, junctionHub: true },
  { code: 'LTT', name: 'Lokmanya Tilak Terminus', city: 'Mumbai', state: 'Maharashtra', lat: 19.0697, lng: 72.8913, junctionHub: false },
  { code: 'PUNE', name: 'Pune Junction', city: 'Pune', state: 'Maharashtra', lat: 18.5284, lng: 73.8744, junctionHub: true },

  // Southern Corridor
  { code: 'BZA', name: 'Vijayawada Junction', city: 'Vijayawada', state: 'Andhra Pradesh', lat: 16.5186, lng: 80.6200, junctionHub: true },
  { code: 'VSKP', name: 'Visakhapatnam Junction', city: 'Visakhapatnam', state: 'Andhra Pradesh', lat: 17.7215, lng: 83.2878, junctionHub: true },
  { code: 'SC', name: 'Secunderabad Junction', city: 'Hyderabad', state: 'Telangana', lat: 17.4344, lng: 78.5013, junctionHub: true },
  { code: 'HYB', name: 'Hyderabad Deccan Nampally', city: 'Hyderabad', state: 'Telangana', lat: 17.3924, lng: 78.4695, junctionHub: true },
  { code: 'GTL', name: 'Guntakal Junction', city: 'Guntakal', state: 'Andhra Pradesh', lat: 15.1667, lng: 77.3667, junctionHub: true },
  { code: 'SBC', name: 'KSR Bengaluru City', city: 'Bengaluru', state: 'Karnataka', lat: 12.9781, lng: 77.5695, junctionHub: true },
  { code: 'YPR', name: 'Yesvantpur Junction', city: 'Bengaluru', state: 'Karnataka', lat: 13.0238, lng: 77.5503, junctionHub: true },
  { code: 'KPD', name: 'Katpadi Junction', city: 'Vellore', state: 'Tamil Nadu', lat: 12.9796, lng: 79.1362, junctionHub: true },
  { code: 'MAS', name: 'MGR Chennai Central', city: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707, junctionHub: true },
  { code: 'MS', name: 'Chennai Egmore', city: 'Chennai', state: 'Tamil Nadu', lat: 13.0782, lng: 80.2616, junctionHub: true },
  { code: 'CBE', name: 'Coimbatore Junction', city: 'Coimbatore', state: 'Tamil Nadu', lat: 11.0016, lng: 76.9628, junctionHub: true },
  { code: 'ERS', name: 'Ernakulam Junction (South)', city: 'Kochi', state: 'Kerala', lat: 9.9678, lng: 76.2917, junctionHub: true }
];

export function extractStations() {
  const metadata = {
    source: 'data.gov.in / Indian Railways Station Master',
    license: 'Government Open Data License (GODL-India)',
    retrievedAt: '2026-10-01',
    provenance: 'TIMETABLE',
    count: RAW_STATIONS.length
  };

  const stations = RAW_STATIONS.map((s) => ({
    code: s.code,
    name: s.name,
    city: s.city,
    state: s.state,
    latitude: s.lat,
    longitude: s.lng,
    isJunction: s.junctionHub,
    source: metadata.source,
    license: metadata.license,
    provenance: metadata.provenance
  }));

  return { metadata, stations };
}
