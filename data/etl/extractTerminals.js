// ETL Step 3: Extract Inter-State Bus Terminals (ISBT & Central Bus Stations)
// Source: OpenStreetMap (OSM transit nodes under amenity=bus_station) / State RTC Portals
// License: Open Database License (ODbL) 1.0
// Freshness: October 2026

export const RAW_TERMINALS = [
  { id: 'term_delhi_isbt_kg', name: 'Maharana Pratap ISBT Kashmere Gate', city: 'Delhi', type: 'ISBT', lat: 28.6675, lng: 77.2285 },
  { id: 'term_delhi_isbt_skk', name: 'Sarai Kale Khan ISBT (Near Nizamuddin)', city: 'Delhi', type: 'ISBT', lat: 28.5878, lng: 77.2558 },
  { id: 'term_delhi_isbt_av', name: 'Anand Vihar ISBT', city: 'Delhi', type: 'ISBT', lat: 28.6480, lng: 77.3150 },
  { id: 'term_kanpur_jhakarkati', name: 'Jhakarkati Central Bus Station', city: 'Kanpur', type: 'State Roadways', lat: 26.4499, lng: 80.3319 },
  { id: 'term_patna_bairiya', name: 'Patiliputra ISBT Bairiya', city: 'Patna', type: 'ISBT', lat: 25.5652, lng: 85.1824 },
  { id: 'term_kolkata_esplanade', name: 'Esplanade Bus Terminus', city: 'Kolkata', type: 'State Roadways', lat: 22.5647, lng: 88.3518 },
  { id: 'term_jaipur_sindhicamp', name: 'Sindhi Camp Central Bus Stand', city: 'Jaipur', type: 'RSRTC Terminal', lat: 26.9238, lng: 75.8016 },
  { id: 'term_ahmedabad_geetamandir', name: 'Geeta Mandir Central Bus Terminus', city: 'Ahmedabad', type: 'GSRTC Terminal', lat: 23.0135, lng: 72.5898 },
  { id: 'term_bhopal_isbt', name: 'Kushabhau Thakre ISBT', city: 'Bhopal', type: 'ISBT', lat: 23.2312, lng: 77.4450 },
  { id: 'term_nagpur_ganeshpeth', name: 'Ganeshpeth Central Bus Station', city: 'Nagpur', type: 'MSRTC Terminal', lat: 21.1442, lng: 79.0965 },
  { id: 'term_prayagraj_civillines', name: 'Civil Lines Bus Stand', city: 'Prayagraj', type: 'UPSRTC Terminal', lat: 25.4528, lng: 81.8340 },
  { id: 'term_varanasi_cantt', name: 'Varanasi Cantt Roadways Bus Stand', city: 'Varanasi', type: 'UPSRTC Terminal', lat: 25.3282, lng: 82.9840 },
  { id: 'term_gorakhpur_kachahari', name: 'Gorakhpur Railway Bus Stand', city: 'Gorakhpur', type: 'UPSRTC Terminal', lat: 26.7592, lng: 83.3835 },
  { id: 'term_vijayawada_pnbs', name: 'Pandit Nehru Bus Station (PNBS)', city: 'Vijayawada', type: 'APSRTC Terminal', lat: 16.5098, lng: 80.6186 },
  { id: 'term_visakhapatnam_rtc', name: 'Dwaraka Bus Station (RTC Complex)', city: 'Visakhapatnam', type: 'APSRTC Terminal', lat: 17.7289, lng: 83.3082 },
  { id: 'term_hyderabad_mgbs', name: 'Mahatma Gandhi Bus Station (MGBS)', city: 'Hyderabad', type: 'TSRTC Terminal', lat: 17.3789, lng: 78.4812 },
  { id: 'term_hyderabad_jbs', name: 'Jubilee Bus Station (JBS Secunderabad)', city: 'Hyderabad', type: 'TSRTC Terminal', lat: 17.4475, lng: 78.5028 },
  { id: 'term_bengaluru_majestic', name: 'Kempegowda Bus Station (Majestic)', city: 'Bengaluru', type: 'KSRTC / BMTC Terminal', lat: 12.9772, lng: 77.5714 },
  { id: 'term_chennai_cmbt', name: 'Chennai Mofussil Bus Terminus (CMBT)', city: 'Chennai', type: 'SETC / MTC Terminal', lat: 13.0674, lng: 80.2059 },
  { id: 'term_pune_swargate', name: 'Swargate Bus Station', city: 'Pune', type: 'MSRTC Terminal', lat: 18.5018, lng: 73.8586 },
  { id: 'term_pune_shivajinagar', name: 'Shivajinagar Bus Station', city: 'Pune', type: 'MSRTC Terminal', lat: 18.5314, lng: 73.8523 },
  { id: 'term_mumbai_central_bus', name: 'Mumbai Central MSRTC Stand', city: 'Mumbai', type: 'MSRTC Terminal', lat: 18.9712, lng: 72.8188 }
];

export function extractTerminals() {
  const metadata = {
    source: 'OpenStreetMap (OSM) / State Road Transport Corporations',
    license: 'Open Database License (ODbL) 1.0',
    retrievedAt: '2026-10-01',
    provenance: 'TIMETABLE',
    count: RAW_TERMINALS.length
  };

  const terminals = RAW_TERMINALS.map((t) => ({
    id: t.id,
    name: t.name,
    city: t.city,
    type: t.type,
    latitude: t.lat,
    longitude: t.lng,
    source: metadata.source,
    license: metadata.license,
    provenance: metadata.provenance
  }));

  return { metadata, terminals };
}
