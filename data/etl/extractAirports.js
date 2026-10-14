// ETL Step 4: Extract Major Commercial Civil Airports
// Source: OurAirports Open Database (ourairports.com/data/) & Directorate General of Civil Aviation (DGCA)
// License: Public Domain (Creative Commons Zero / CC0)
// Freshness: October 2026

export const RAW_AIRPORTS = [
  { iata: 'DEL', name: 'Indira Gandhi International Airport', city: 'Delhi', lat: 28.5562, lng: 77.1000 },
  { iata: 'BOM', name: 'Chhatrapati Shivaji Maharaj International Airport', city: 'Mumbai', lat: 19.0896, lng: 72.8656 },
  { iata: 'BLR', name: 'Kempegowda International Airport', city: 'Bengaluru', lat: 13.1986, lng: 77.7066 },
  { iata: 'MAA', name: 'Chennai International Airport', city: 'Chennai', lat: 12.9941, lng: 80.1709 },
  { iata: 'CCU', name: 'Netaji Subhash Chandra Bose International Airport', city: 'Kolkata', lat: 22.6547, lng: 88.4467 },
  { iata: 'HYD', name: 'Rajiv Gandhi International Airport', city: 'Hyderabad', lat: 17.2403, lng: 78.4294 },
  { iata: 'AMD', name: 'Sardar Vallabhbhai Patel International Airport', city: 'Ahmedabad', lat: 23.0734, lng: 72.6347 },
  { iata: 'PNQ', name: 'Pune Airport (Lohegaon)', city: 'Pune', lat: 18.5822, lng: 73.9197 },
  { iata: 'JAI', name: 'Jaipur International Airport', city: 'Jaipur', lat: 26.8242, lng: 75.8122 },
  { iata: 'LKO', name: 'Chaudhary Charan Singh International Airport', city: 'Lucknow', lat: 26.7606, lng: 80.8893 },
  { iata: 'PAT', name: 'Jay Prakash Narayan Airport', city: 'Patna', lat: 25.5913, lng: 85.0880 },
  { iata: 'VNS', name: 'Lal Bahadur Shastri International Airport', city: 'Varanasi', lat: 25.4524, lng: 82.8593 },
  { iata: 'BHO', name: 'Raja Bhoj Airport', city: 'Bhopal', lat: 23.2875, lng: 77.3378 },
  { iata: 'NAG', name: 'Dr. Babasaheb Ambedkar International Airport', city: 'Nagpur', lat: 21.0922, lng: 79.0472 },
  { iata: 'VGA', name: 'Vijayawada International Airport', city: 'Vijayawada', lat: 16.5304, lng: 80.7968 },
  { iata: 'VTZ', name: 'Visakhapatnam International Airport', city: 'Visakhapatnam', lat: 17.7212, lng: 83.2245 },
  { iata: 'GWL', name: 'Rajmata Vijaya Raje Scindia Airport', city: 'Gwalior', lat: 26.2933, lng: 78.2278 }
];

export function extractAirports() {
  const metadata = {
    source: 'OurAirports Open Database / DGCA India',
    license: 'Creative Commons Zero (CC0) / Public Domain',
    retrievedAt: '2026-10-01',
    provenance: 'TIMETABLE',
    count: RAW_AIRPORTS.length
  };

  const airports = RAW_AIRPORTS.map((a) => ({
    iataCode: a.iata,
    name: a.name,
    city: a.city,
    latitude: a.lat,
    longitude: a.lng,
    source: metadata.source,
    license: metadata.license,
    provenance: metadata.provenance
  }));

  return { metadata, airports };
}
