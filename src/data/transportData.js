export const transportModes = ['Train', 'Flight', 'Bus']

export const ticketTypes = {
  Train: ['Normal', 'Tatkal / Emergency'],
  Flight: ['Normal', 'Emergency / Urgent'],
  Bus: ['Normal', 'Emergency / Urgent']
}

export const cabinOptions = {
  Train: [
    'General / Unreserved',
    'Second Sitting (2S)',
    'Sleeper (SL)',
    'AC Chair Car (CC)',
    'Executive Chair Car (EC)',
    'AC 3 Tier (3A)',
    'AC 3 Economy (3E)',
    'AC 2 Tier (2A)',
    'First Class AC (1A)',
    'Vistadome / Tourist Coach'
  ],
  Flight: [
    'Economy',
    'Premium Economy',
    'Business',
    'First Class where available'
  ],
  Bus: [
    'Ordinary / Local',
    'Express',
    'Super Fast',
    'Deluxe',
    'Semi Sleeper',
    'Seater',
    'AC Seater',
    'Non-AC Seater',
    'Sleeper',
    'AC Sleeper',
    'Volvo / Multi-axle',
    'Scania / Premium Coach'
  ]
}

export function getCabinOptions(mode = 'Train') {
  return cabinOptions[mode] || cabinOptions.Train
}

export function getRouteInputLabels(mode = 'Train') {
  if (mode === 'Flight') {
    return {
      from: 'From',
      to: 'To',
      fromPlaceholder: 'Enter city or airport code, e.g. RJA, HYD, DEL',
      toPlaceholder: 'Enter destination city or airport code'
    }
  }
  if (mode === 'Bus') {
    return {
      from: 'From',
      to: 'To',
      fromPlaceholder: 'Enter city or bus hub, e.g. Hyderabad, MGBS, ISBT',
      toPlaceholder: 'Enter destination city or bus hub'
    }
  }
  return {
    from: 'From railway station',
    to: 'To railway station',
    fromPlaceholder: 'Enter boarding railway station, e.g. RJY, SC, NDLS',
    toPlaceholder: 'Enter destination railway station'
  }
}

export const officialPortals = {
  Train: 'https://www.irctc.co.in/nget/train-search',
  Flight: 'https://www.google.com/travel/flights',
  Bus: 'https://www.redbus.in/'
}

const corePlaces = [
  ['Delhi', 28.6139, 77.209, 'New Delhi Railway Station (NDLS)', 'Delhi IGI Airport (DEL)', 'Kashmere Gate ISBT', ['New Delhi', 'NDLS', 'Nizamuddin', 'Delhi Cantt']],
  ['Mumbai', 19.076, 72.8777, 'Chhatrapati Shivaji Maharaj Terminus (CSMT)', 'Mumbai Airport (BOM)', 'Mumbai Central Bus Depot', ['BOM', 'Dadar', 'LTT']],
  ['Bengaluru', 12.9716, 77.5946, 'KSR Bengaluru City Junction (SBC)', 'Kempegowda Airport (BLR)', 'Kempegowda Bus Station', ['Bangalore', 'SBC', 'BLR']],
  ['Hyderabad', 17.385, 78.4867, 'Secunderabad Junction (SC)', 'Rajiv Gandhi Airport (HYD)', 'MGBS Hyderabad', ['Secunderabad', 'Kacheguda', 'HYD', 'SC']],
  ['Chennai', 13.0827, 80.2707, 'Chennai Central (MAS)', 'Chennai Airport (MAA)', 'CMBT Koyambedu', ['MAS', 'Tambaram', 'MAA']],
  ['Kolkata', 22.5726, 88.3639, 'Howrah Junction (HWH)', 'Netaji Subhas Chandra Bose Airport (CCU)', 'Esplanade Bus Terminus', ['Howrah', 'Sealdah', 'CCU']],
  ['Pune', 18.5204, 73.8567, 'Pune Junction (PUNE)', 'Pune Airport (PNQ)', 'Swargate Bus Station', ['PNQ', 'Shivajinagar']],
  ['Ahmedabad', 23.0225, 72.5714, 'Ahmedabad Junction (ADI)', 'Sardar Vallabhbhai Patel Airport (AMD)', 'Gita Mandir Bus Stand', ['ADI', 'AMD']],
  ['Jaipur', 26.9124, 75.7873, 'Jaipur Junction (JP)', 'Jaipur Airport (JAI)', 'Sindhi Camp Bus Stand', ['JP', 'JAI']],
  ['Lucknow', 26.8467, 80.9462, 'Lucknow Charbagh (LKO)', 'Chaudhary Charan Singh Airport (LKO)', 'Alambagh Bus Stand', ['LKO', 'Charbagh']],
  ['Kochi', 9.9312, 76.2673, 'Ernakulam Junction (ERS)', 'Cochin Airport (COK)', 'Vyttila Mobility Hub', ['Ernakulam', 'COK', 'ERS']],
  ['Goa', 15.2993, 74.124, 'Madgaon Junction (MAO)', 'Goa Dabolim Airport (GOI)', 'Panaji Bus Stand', ['Madgaon', 'MAO', 'Vasco', 'GOI']],
  ['Visakhapatnam', 17.6868, 83.2185, 'Visakhapatnam Junction (VSKP)', 'Visakhapatnam Airport (VTZ)', 'Dwaraka Bus Station', ['Vizag', 'VSKP', 'VTZ']],
  ['Vijayawada', 16.5062, 80.648, 'Vijayawada Junction (BZA)', 'Vijayawada Airport (VGA)', 'Pandit Nehru Bus Station', ['BZA', 'VGA']],
  ['Rajahmundry', 17.0005, 81.804, 'Rajahmundry / Rajamahendravaram Railway Station (RJY)', 'Rajahmundry Airport (RJA)', 'Rajamahendravaram APSRTC Bus Station', ['Rajamahendravaram', 'RJY', 'RJA', 'Rajamundry']],
  ['Karunagappalli', 9.0544, 76.5353, 'Karunagappalli Railway Station (KPY)', 'Nearest airports: Trivandrum (TRV) / Cochin (COK)', 'KSRTC Karunagappalli Bus Station', ['Karunagapalli', 'KPY', 'Karunagappally']],
  ['Kollam', 8.8932, 76.6141, 'Kollam Junction (QLN)', 'Nearest airport: Trivandrum Airport (TRV)', 'KSRTC Kollam Bus Station', ['Quilon', 'QLN']],
  ['Alappuzha', 9.4981, 76.3388, 'Alappuzha Railway Station (ALLP)', 'Nearest airport: Cochin Airport (COK)', 'KSRTC Alappuzha Bus Station', ['Alleppy', 'ALLP']],
  ['Kottayam', 9.5916, 76.5222, 'Kottayam Railway Station (KTYM)', 'Nearest airport: Cochin Airport (COK)', 'KSRTC Kottayam Bus Station', ['KTYM']],
  ['Thrissur', 10.5276, 76.2144, 'Thrissur Railway Station (TCR)', 'Nearest airport: Cochin Airport (COK)', 'KSRTC Thrissur Bus Station', ['Trichur', 'TCR']],
  ['Kozhikode', 11.2588, 75.7804, 'Kozhikode Railway Station (CLT)', 'Calicut Airport (CCJ)', 'KSRTC Kozhikode Bus Station', ['Calicut', 'CLT', 'CCJ']],
  ['Kannur', 11.8745, 75.3704, 'Kannur Railway Station (CAN)', 'Kannur Airport (CNN)', 'KSRTC Kannur Bus Station', ['CAN', 'CNN']],
  ['Thiruvananthapuram', 8.5241, 76.9366, 'Thiruvananthapuram Central (TVC)', 'Trivandrum Airport (TRV)', 'Thampanoor Bus Station', ['Trivandrum', 'TVC', 'TRV']],
  ['Bhubaneswar', 20.2961, 85.8245, 'Bhubaneswar Railway Station (BBS)', 'Biju Patnaik Airport (BBI)', 'Baramunda Bus Stand', ['BBS', 'BBI']],
  ['Patna', 25.5941, 85.1376, 'Patna Junction (PNBE)', 'Jay Prakash Narayan Airport (PAT)', 'Mithapur Bus Stand', ['PNBE', 'PAT']],
  ['Guwahati', 26.1445, 91.7362, 'Guwahati Railway Station (GHY)', 'Lokpriya Gopinath Bordoloi Airport (GAU)', 'ISBT Guwahati', ['GHY', 'GAU']],
  ['Chandigarh', 30.7333, 76.7794, 'Chandigarh Junction (CDG)', 'Chandigarh Airport (IXC)', 'ISBT Sector 43', ['CDG', 'IXC']],
  ['Indore', 22.7196, 75.8577, 'Indore Junction (INDB)', 'Devi Ahilya Bai Holkar Airport (IDR)', 'Sarwate Bus Stand', ['INDB', 'IDR']],
  ['Nagpur', 21.1458, 79.0882, 'Nagpur Junction (NGP)', 'Dr. Babasaheb Ambedkar Airport (NAG)', 'Ganeshpeth Bus Stand', ['NGP', 'NAG']],
  ['Coimbatore', 11.0168, 76.9558, 'Coimbatore Junction (CBE)', 'Coimbatore Airport (CJB)', 'Gandhipuram Bus Stand', ['CBE', 'CJB']],
  ['Madurai', 9.9252, 78.1198, 'Madurai Junction (MDU)', 'Madurai Airport (IXM)', 'Mattuthavani Bus Stand', ['MDU', 'IXM']],
  ['Mangaluru', 12.9141, 74.856, 'Mangaluru Central (MAQ)', 'Mangaluru Airport (IXE)', 'KSRTC Bejai Bus Stand', ['Mangalore', 'MAQ', 'IXE']],
  ['Raipur', 21.2514, 81.6296, 'Raipur Junction (R)', 'Swami Vivekananda Airport (RPR)', 'ISBT Raipur', ['RPR']],
  ['Ranchi', 23.3441, 85.3096, 'Ranchi Junction (RNC)', 'Birsa Munda Airport (IXR)', 'Khadgarha Bus Stand', ['RNC', 'IXR']],
  ['Varanasi', 25.3176, 82.9739, 'Varanasi Junction (BSB)', 'Lal Bahadur Shastri Airport (VNS)', 'Cantt Bus Station', ['BSB', 'VNS']],
  ['Dehradun', 30.3165, 78.0322, 'Dehradun Railway Station (DDN)', 'Jolly Grant Airport (DED)', 'ISBT Dehradun', ['DDN', 'DED']],
  ['Srinagar', 34.0837, 74.7973, 'Srinagar Railway Station (SINA)', 'Srinagar Airport (SXR)', 'TRC Bus Stand', ['SINA', 'SXR']],
  ['Agartala', 23.8315, 91.2868, 'Agartala Railway Station (AGTL)', 'Maharaja Bir Bikram Airport (IXA)', 'Nagerjala Bus Stand', ['AGTL', 'IXA']],
  ['Bhopal', 23.2599, 77.4126, 'Bhopal Junction (BPL)', 'Raja Bhoj Airport (BHO)', 'ISBT Bhopal', ['BPL', 'BHO']],
  ['Surat', 21.1702, 72.8311, 'Surat Railway Station (ST)', 'Surat Airport (STV)', 'Surat Central Bus Station', ['ST', 'STV']],
  ['Vadodara', 22.3072, 73.1812, 'Vadodara Junction (BRC)', 'Vadodara Airport (BDQ)', 'Central Bus Station Vadodara', ['Baroda', 'BRC', 'BDQ']],
  ['Jodhpur', 26.2389, 73.0243, 'Jodhpur Junction (JU)', 'Jodhpur Airport (JDH)', 'Rai Ka Bagh Bus Stand', ['JU', 'JDH']],
  ['Udaipur', 24.5854, 73.7125, 'Udaipur City Railway Station (UDZ)', 'Maharana Pratap Airport (UDR)', 'Udaipur Central Bus Stand', ['UDZ', 'UDR']],
  ['Amritsar', 31.634, 74.8723, 'Amritsar Junction (ASR)', 'Sri Guru Ram Dass Jee Airport (ATQ)', 'Amritsar Bus Stand', ['ASR', 'ATQ']],
  ['Jammu', 32.7266, 74.857, 'Jammu Tawi Railway Station (JAT)', 'Jammu Airport (IXJ)', 'Jammu Bus Stand', ['JAT', 'IXJ']],
  ['Mysuru', 12.2958, 76.6394, 'Mysuru Junction (MYS)', 'Mysuru Airport (MYQ)', 'Suburban Bus Stand Mysuru', ['Mysore', 'MYS', 'MYQ']],
  ['Hubballi', 15.3647, 75.124, 'SSS Hubballi Junction (UBL)', 'Hubballi Airport (HBX)', 'Hubballi Old Bus Stand', ['Hubli', 'UBL', 'HBX']],
  ['Belagavi', 15.8497, 74.4977, 'Belagavi Railway Station (BGM)', 'Belagavi Airport (IXG)', 'Belagavi Central Bus Stand', ['Belgaum', 'BGM', 'IXG']],
  ['Tirupati', 13.6288, 79.4192, 'Tirupati Railway Station (TPTY)', 'Tirupati Airport (TIR)', 'Tirupati Central Bus Station', ['TPTY', 'TIR']],
  ['Guntur', 16.3067, 80.4365, 'Guntur Junction (GNT)', 'Nearest airport: Vijayawada Airport (VGA)', 'NTR Bus Station Guntur', ['GNT']],
  ['Kurnool', 15.8281, 78.0373, 'Kurnool City Railway Station (KRNT)', 'Kurnool Airport (KJB)', 'Kurnool APSRTC Bus Station', ['KRNT', 'KJB']],
  ['Warangal', 17.9689, 79.5941, 'Warangal Railway Station (WL)', 'Nearest airport: Hyderabad Airport (HYD)', 'Warangal Bus Station', ['WL']],
  ['Nizamabad', 18.6725, 78.0941, 'Nizamabad Railway Station (NZB)', 'Nearest airport: Hyderabad Airport (HYD)', 'Nizamabad Bus Station', ['NZB']],
  ['Aurangabad', 19.8762, 75.3433, 'Aurangabad Railway Station (AWB)', 'Aurangabad Airport (IXU)', 'CIDCO Bus Stand', ['AWB', 'IXU']],
  ['Nashik', 19.9975, 73.7898, 'Nasik Road Railway Station (NK)', 'Nashik Airport (ISK)', 'CBS Nashik', ['Nasik', 'NK', 'ISK']],
  ['Solapur', 17.6599, 75.9064, 'Solapur Railway Station (SUR)', 'Nearest airport: Pune Airport (PNQ)', 'Solapur Central Bus Stand', ['SUR']],
  ['Kolhapur', 16.705, 74.2433, 'Kolhapur Railway Station (KOP)', 'Kolhapur Airport (KLH)', 'Central Bus Stand Kolhapur', ['KOP', 'KLH']],
  ['Jamshedpur', 22.8046, 86.2029, 'Tatanagar Junction (TATA)', 'Nearest airport: Ranchi Airport (IXR)', 'Mango Bus Stand', ['Tatanagar', 'TATA']],
  ['Dhanbad', 23.7957, 86.4304, 'Dhanbad Junction (DHN)', 'Nearest airport: Durgapur/Ranchi', 'Bartand Bus Stand', ['DHN']],
  ['Cuttack', 20.4625, 85.8828, 'Cuttack Railway Station (CTC)', 'Nearest airport: Bhubaneswar Airport (BBI)', 'Badambadi Bus Stand', ['CTC']],
  ['Rourkela', 22.2604, 84.8536, 'Rourkela Railway Station (ROU)', 'Rourkela Airport (RRK)', 'Rourkela Bus Stand', ['ROU', 'RRK']],
  ['Shillong', 25.5788, 91.8933, 'Nearest rail: Guwahati Railway Station (GHY)', 'Shillong Airport (SHL)', 'Police Bazaar Bus Stand', ['SHL']],
  ['Imphal', 24.817, 93.9368, 'Nearest rail: Dimapur/Jiribam', 'Imphal Airport (IMF)', 'ISBT Imphal', ['IMF']],
  ['Dimapur', 25.9091, 93.7266, 'Dimapur Railway Station (DMV)', 'Dimapur Airport (DMU)', 'Dimapur Bus Stand', ['DMV', 'DMU']],
  ['Aizawl', 23.7271, 92.7176, 'Nearest rail: Bairabi Railway Station', 'Lengpui Airport (AJL)', 'Aizawl Bus Stand', ['AJL']],
  ['Port Blair', 11.6234, 92.7265, 'No mainland rail station', 'Veer Savarkar Airport (IXZ)', 'Aberdeen Bus Terminus', ['IXZ']],
  ['Leh', 34.1526, 77.5771, 'No rail station', 'Kushok Bakula Rimpochee Airport (IXL)', 'Leh Bus Stand', ['IXL']],
  ['Jabalpur', 23.1815, 79.9864, 'Jabalpur Junction (JBP)', 'Jabalpur Airport (JLR)', 'ISBT Jabalpur', ['JBP', 'JLR']],
  ['Gwalior', 26.2183, 78.1828, 'Gwalior Junction (GWL)', 'Gwalior Airport (GWL)', 'Inter State Bus Terminal Gwalior', ['GWL']],
  ['Agra', 27.1767, 78.0081, 'Agra Cantt (AGC)', 'Agra Airport (AGR)', 'Idgah Bus Stand', ['AGC', 'AGR']],
  ['Kanpur', 26.4499, 80.3319, 'Kanpur Central (CNB)', 'Kanpur Airport (KNU)', 'Jhakarkati Bus Stand', ['CNB', 'KNU']],
  ['Prayagraj', 25.4358, 81.8463, 'Prayagraj Junction (PRYJ)', 'Prayagraj Airport (IXD)', 'Civil Lines Bus Stand', ['Allahabad', 'PRYJ', 'IXD']],
  ['Gorakhpur', 26.7606, 83.3732, 'Gorakhpur Junction (GKP)', 'Gorakhpur Airport (GOP)', 'Kachahari Bus Stand', ['GKP', 'GOP']],
  ['Durgapur', 23.5204, 87.3119, 'Durgapur Railway Station (DGR)', 'Kazi Nazrul Islam Airport (RDP)', 'City Centre Bus Terminus', ['DGR', 'RDP']],
  ['Siliguri', 26.7271, 88.3953, 'New Jalpaiguri Junction (NJP)', 'Bagdogra Airport (IXB)', 'Tenzing Norgay Bus Terminus', ['NJP', 'IXB', 'Bagdogra']],
  ['Itanagar', 27.0844, 93.6053, 'Naharlagun Railway Station (NHLN)', 'Donyi Polo Airport (HGI)', 'Naharlagun Bus Station', ['Naharlagun', 'NHLN', 'HGI']],
  ['Dibrugarh', 27.4728, 94.912, 'Dibrugarh Railway Station (DBRG)', 'Dibrugarh Airport (DIB)', 'ASTC Bus Stand Dibrugarh', ['DBRG', 'DIB']],
  ['Salem', 11.6643, 78.146, 'Salem Junction (SA)', 'Nearest airport: Salem Airport (SXV)', 'Salem Central Bus Stand', ['SA', 'SXV']],
  ['Erode', 11.341, 77.7172, 'Erode Junction (ED)', 'Nearest airport: Coimbatore Airport (CJB)', 'Erode Bus Stand', ['ED']],
  ['Tiruchirappalli', 10.7905, 78.7047, 'Tiruchirappalli Junction (TPJ)', 'Tiruchirappalli Airport (TRZ)', 'Central Bus Stand Trichy', ['Trichy', 'TPJ', 'TRZ']],
  ['Thoothukudi', 8.7642, 78.1348, 'Tuticorin Railway Station (TN)', 'Tuticorin Airport (TCR)', 'Thoothukudi Bus Stand', ['Tuticorin', 'TN', 'TCR']],
  ['Nellore', 14.4426, 79.9865, 'Nellore Railway Station (NLR)', 'Nearest airport: Tirupati Airport (TIR)', 'Nellore RTC Bus Station', ['NLR']]
]

export const transportPlaces = corePlaces.map(([city, lat, lng, train, airport, bus, aliases = []]) => ({ city, lat, lng, train, airport, bus, aliases }))

export const coverageNotice = 'Local transport dataset: important Indian rail, airport and bus hubs are included for route preparation. It is expandable with your uploaded datasets, but live seats, platforms, gates, fares and booking need official provider APIs.'

export function normalizePlace(value = '') {
  return String(value).trim().toLowerCase().replace(/[^a-z0-9]+/g, '')
}

export function findTransportPlace(value) {
  const needle = normalizePlace(value)
  if (!needle) return null
  return transportPlaces.find((place) => {
    const values = [place.city, place.train, place.airport, place.bus, ...(place.aliases || [])]
    return values.some((entry) => normalizePlace(entry) === needle)
  }) || null
}

export const routeCombos = [
  { label: 'Train only', sequence: ['Train'], speed: 65, cost: 88, reliability: 82, emergencyFit: 78, note: 'Best when budget matters and route is direct.' },
  { label: 'Flight only', sequence: ['Flight'], speed: 94, cost: 45, reliability: 76, emergencyFit: 86, note: 'Fastest for long distance, but baggage and ID rules matter.' },
  { label: 'Bus only', sequence: ['Bus'], speed: 48, cost: 82, reliability: 68, emergencyFit: 62, note: 'Good backup when train seats are full or nearby cities are connected.' },
  { label: 'Train + Flight', sequence: ['Train', 'Flight'], speed: 86, cost: 62, reliability: 79, emergencyFit: 88, note: 'Reach an airport hub by train, then fly long distance.' },
  { label: 'Flight + Train', sequence: ['Flight', 'Train'], speed: 88, cost: 60, reliability: 80, emergencyFit: 87, note: 'Fly to a major hub, then train to the final city.' },
  { label: 'Flight + Bus', sequence: ['Flight', 'Bus'], speed: 84, cost: 58, reliability: 73, emergencyFit: 82, note: 'Fly to the nearest airport, then bus for last-mile travel.' },
  { label: 'Bus + Train', sequence: ['Bus', 'Train'], speed: 61, cost: 85, reliability: 72, emergencyFit: 70, note: 'Bus to a rail hub, then take a longer train.' },
  { label: 'Train + Bus', sequence: ['Train', 'Bus'], speed: 63, cost: 86, reliability: 75, emergencyFit: 72, note: 'Train to the nearest junction, then bus for last-mile travel.' },
  { label: 'Train + Train connector', sequence: ['Train', 'Train'], speed: 58, cost: 90, reliability: 78, emergencyFit: 74, note: 'Use one long-distance train to a hub, then a short train connector for the last mile.' }
]

const directServiceFixtures = [
  {
    from: ['Rajahmundry', 'RJY', 'Rajamahendravaram'],
    to: ['Delhi', 'New Delhi', 'NDLS'],
    trains: [
      { service: 'AP EXPRESS (20805)', code: '20805', from: 'RAJAHMUNDRY (RJY)', to: 'NEW DELHI (NDLS)', depart: '00:45', arrive: '05:40 +1', duration: '28h 55m', fare: 925, availability: 'Refresh on official portal', classes: ['SL', '3A', '2A', '1A'], reliability: 78, status: 'Local timetable snapshot · check NTES before boarding', note: 'Matches the screenshot-style Rajahmundry → New Delhi long-distance option.' },
      { service: 'ANDHRA PRADESH AC SF EXP (22415)', code: '22415', from: 'VIJAYAWADA/BZA transfer', to: 'NEW DELHI (NDLS)', depart: '21:00', arrive: '05:30 +2', duration: '32h 30m', fare: 1850, availability: 'Backup via Vijayawada', classes: ['3A', '2A', '1A'], reliability: 74, status: 'Local backup snapshot', note: 'Backup if direct AP Express is unavailable.' }
    ],
    buses: [
      { service: 'APSRTC Rajahmundry → Vijayawada Connector', code: 'APSRTC-RJY-BZA', from: 'Rajahmundry Bus Station', to: 'Vijayawada PNBS', depart: '06:30', arrive: '10:30', duration: '4h', fare: 420, availability: 'Connector leg', classes: ['AC Seater', 'Non-AC'], reliability: 72, status: 'Local route snapshot', note: 'Use as first leg before a train/flight from Vijayawada.' }
    ],
    flights: [
      { service: '6E Rajahmundry → Delhi via Hyderabad', code: '6E-RJA-HYD-DEL', from: 'Rajahmundry Airport (RJA)', to: 'Delhi Airport (DEL)', depart: '09:15', arrive: '15:10', duration: '5h 55m', fare: 6900, availability: 'Check airline portal', classes: ['Economy'], reliability: 77, status: 'Local route snapshot', note: 'Fast backup; baggage and connection rules apply.' }
    ]
  },
  {
    from: ['Hyderabad', 'Secunderabad', 'HYD', 'SC'],
    to: ['Delhi', 'New Delhi', 'NDLS'],
    trains: [
      { service: 'TELANGANA EXPRESS (12723)', code: '12723', from: 'HYDERABAD DECAN/SECUNDERABAD', to: 'NEW DELHI (NDLS)', depart: '06:25', arrive: '07:40 +1', duration: '25h 15m', fare: 810, availability: 'Check IRCTC', classes: ['SL', '3A', '2A', '1A'], reliability: 82, status: 'Local route snapshot', note: 'Good budget route for Hyderabad → Delhi.' },
      { service: 'DAKSHIN EXPRESS (12721)', code: '12721', from: 'SECUNDERABAD (SC)', to: 'HAZRAT NIZAMUDDIN (NZM)', depart: '23:00', arrive: '04:00 +2', duration: '29h', fare: 760, availability: 'Check IRCTC', classes: ['SL', '3A', '2A'], reliability: 76, status: 'Local backup snapshot', note: 'Backup if first train is full.' }
    ],
    flights: [
      { service: 'Indigo 6E HYD → DEL', code: '6E-HYD-DEL', from: 'Hyderabad Airport (HYD)', to: 'Delhi Airport (DEL)', depart: '08:10', arrive: '10:30', duration: '2h 20m', fare: 5200, availability: 'Check airline portal', classes: ['Economy'], reliability: 85, status: 'Local route snapshot', note: 'Fastest normal option if budget permits.' },
      { service: 'Air India AI HYD → DEL', code: 'AI-HYD-DEL', from: 'Hyderabad Airport (HYD)', to: 'Delhi Airport (DEL)', depart: '17:40', arrive: '20:00', duration: '2h 20m', fare: 5900, availability: 'Check airline portal', classes: ['Economy', 'Business'], reliability: 81, status: 'Local backup snapshot', note: 'Backup flight option.' }
    ],
    buses: [
      { service: 'Long-distance bus not recommended', code: 'NO-DIRECT-BUS', from: 'Hyderabad', to: 'Delhi', depart: 'N/A', arrive: 'N/A', duration: '40h+', fare: 2500, availability: 'Use only as emergency fallback', classes: ['Sleeper Bus'], reliability: 42, status: 'Local caution note', note: 'Too long; use train/flight instead.' }
    ]
  },

  {
    from: ['Rajahmundry', 'RJY', 'Rajamahendravaram', 'RJA'],
    to: ['Ernakulam', 'Kochi', 'ERS', 'ERN', 'COK'],
    trains: [
      { service: 'Dhanbad–Alappuzha Express (13351)', code: '13351', from: 'RAJAHMUNDRY (RJY)', to: 'ERNAKULAM JN (ERS)', depart: '17:05', arrive: '20:20 +1', duration: '27h 15m', fare: 720, availability: 'Check IRCTC live', classes: ['SL', '3A', '2A'], reliability: 76, status: 'Curated snapshot · verify official timing', note: 'Budget-friendly long-distance train toward Kerala.' },
      { service: 'Tatanagar–Ernakulam Express (18189)', code: '18189', from: 'RAJAHMUNDRY (RJY)', to: 'ERNAKULAM JN (ERS)', depart: '23:10', arrive: '03:50 +2', duration: '28h 40m', fare: 760, availability: 'Check IRCTC live', classes: ['SL', '3A', '2A'], reliability: 72, status: 'Curated snapshot · verify official timing', note: 'Backup train when first route is unavailable.' },
      { service: 'Korba–Kochuveli SF Express connector', code: '22647/CONNECT', from: 'RAJAHMUNDRY (RJY)', to: 'ERNAKULAM / KOTTAYAM SIDE', depart: 'Morning window', arrive: 'Next day evening', duration: '26h–30h', fare: 840, availability: 'Check IRCTC live', classes: ['SL', '3A', '2A'], reliability: 69, status: 'Curated snapshot · verify official timing', note: 'Connector-style option; exact station pairing should be checked before demo claims.' }
    ],
    buses: [
      { service: 'APSRTC Rajahmundry → Vijayawada connector', code: 'APSRTC-RJY-BZA', from: 'Rajahmundry Bus Station', to: 'Vijayawada PNBS', depart: '06:30', arrive: '10:30', duration: '4h', fare: 420, availability: 'Connector leg', classes: ['AC Seater', 'Non-AC'], reliability: 72, status: 'Local route snapshot', note: 'Use as first leg to reach a stronger train/flight hub.' },
      { service: 'Private sleeper coach RJY → Bengaluru/Cochin connector', code: 'BUS-RJY-KERALA-CONNECT', from: 'Rajahmundry Bus Station', to: 'Kerala corridor connector', depart: '18:30', arrive: 'Next day', duration: '18h–24h', fare: 1600, availability: 'Check bus portal live', classes: ['Sleeper', 'AC Sleeper'], reliability: 58, status: 'Curated local snapshot', note: 'Long bus route; use only if rail options fail.' }
    ],
    flights: [
      { service: 'Indigo 6E Rajahmundry → Kochi via Hyderabad', code: '6E-RJA-HYD-COK', from: 'Rajahmundry Airport (RJA)', to: 'Cochin Airport (COK)', depart: '09:15', arrive: '14:40', duration: '5h 25m', fare: 6200, availability: 'Check airline live', classes: ['Economy'], reliability: 78, status: 'Curated local snapshot', note: 'Fast route to Kerala hub; baggage rules depend on airline/fare.' },
      { service: 'Air India Express RJA → COK via Bengaluru', code: 'IX-RJA-BLR-COK', from: 'Rajahmundry Airport (RJA)', to: 'Cochin Airport (COK)', depart: '13:20', arrive: '20:10', duration: '6h 50m', fare: 6800, availability: 'Check airline live', classes: ['Economy'], reliability: 72, status: 'Curated local snapshot', note: 'Backup flight if Hyderabad connection is not suitable.' }
    ]
  },
  {
    from: ['Ernakulam', 'Kochi', 'ERS', 'ERN', 'COK'],
    to: ['Karunagappalli', 'Karunagapalli', 'KPY', 'Karunagappally'],
    trains: [
      { service: 'Venad Express (16302)', code: '16302', from: 'ERNAKULAM JN (ERS)', to: 'KARUNAGAPPALLI (KPY)', depart: '05:25', arrive: '08:45', duration: '3h 20m', fare: 95, availability: 'Check IRCTC live', classes: ['2S', 'CC'], reliability: 82, status: 'Curated snapshot · verify official timing', note: 'Strong morning connector from Ernakulam side to Karunagappalli.' },
      { service: 'Parasuram Express (16650)', code: '16650', from: 'ERNAKULAM TOWN/JN', to: 'KARUNAGAPPALLI (KPY)', depart: '07:20', arrive: '10:35', duration: '3h 15m', fare: 105, availability: 'Check IRCTC live', classes: ['2S', 'CC'], reliability: 80, status: 'Curated snapshot · verify official timing', note: 'Useful daytime connector with many Kerala stops.' },
      { service: 'Intercity / MEMU Kerala corridor option', code: 'KRL-MEMU-CONNECT', from: 'ERNAKULAM', to: 'KARUNAGAPPALLI (KPY)', depart: '12:10', arrive: '15:50', duration: '3h 40m', fare: 70, availability: 'Check railway live', classes: ['General', '2S'], reliability: 74, status: 'Curated local snapshot', note: 'Low-cost fallback when express seats are unavailable.' },
      { service: 'Evening Kerala connector', code: 'KRL-EVE-CONNECT', from: 'ERNAKULAM', to: 'KARUNAGAPPALLI (KPY)', depart: '17:45', arrive: '21:05', duration: '3h 20m', fare: 110, availability: 'Check railway live', classes: ['2S', 'SL'], reliability: 70, status: 'Curated local snapshot', note: 'Backup if user reaches Ernakulam later in the day.' }
    ],
    buses: [
      { service: 'KSRTC Ernakulam/Vyttila → Karunagappalli', code: 'KSRTC-ERS-KPY-1', from: 'Vyttila Mobility Hub', to: 'KSRTC Karunagappalli', depart: '06:00', arrive: '10:30', duration: '4h 30m', fare: 230, availability: 'Check KSRTC/live portal', classes: ['Super Fast', 'Fast Passenger'], reliability: 76, status: 'Curated local snapshot', note: 'Useful last-mile backup if train timing does not match.' },
      { service: 'KSRTC Fast Passenger evening connector', code: 'KSRTC-ERS-KPY-2', from: 'Vyttila Mobility Hub', to: 'KSRTC Karunagappalli', depart: '18:15', arrive: '22:50', duration: '4h 35m', fare: 240, availability: 'Check KSRTC/live portal', classes: ['Fast Passenger'], reliability: 70, status: 'Curated local snapshot', note: 'Backup bus after a late flight or train arrival.' }
    ],
    flights: [
      { service: 'No practical flight for this short leg', code: 'NO-FLIGHT-ERS-KPY', from: 'Cochin Airport (COK)', to: 'Nearest: TRV/COK then surface', depart: 'N/A', arrive: 'N/A', duration: 'Surface connector recommended', fare: 0, availability: 'Use train/bus', classes: ['N/A'], reliability: 20, status: 'Not recommended', note: 'For Ernakulam → Karunagappalli, train/bus is the correct last-mile mode.' }
    ]
  },
  {
    from: ['Rajahmundry', 'RJY', 'Rajamahendravaram', 'RJA'],
    to: ['Karunagappalli', 'Karunagapalli', 'KPY', 'Karunagappally'],
    trains: [
      { service: 'RJY → ERS → KPY rail connection', code: '13351 + 16302', from: 'RAJAHMUNDRY (RJY)', to: 'KARUNAGAPPALLI (KPY)', depart: '17:05', arrive: '08:45 +2', duration: '39h 40m incl. transfer', fare: 815, availability: 'Check IRCTC live for both legs', classes: ['SL + 2S', '3A + CC'], reliability: 78, status: 'Connection snapshot · verify live', note: 'Best budget route when the user accepts a Kerala hub transfer.' },
      { service: 'RJY → ERS → KPY backup rail connection', code: '18189 + KRL-MEMU', from: 'RAJAHMUNDRY (RJY)', to: 'KARUNAGAPPALLI (KPY)', depart: '23:10', arrive: '15:50 +2', duration: '40h 40m incl. transfer', fare: 830, availability: 'Check IRCTC live for both legs', classes: ['SL + 2S'], reliability: 72, status: 'Local backup snapshot', note: 'Backup if the first train combination is unavailable.' }
    ],
    buses: [
      { service: 'RJY → Vijayawada → Kerala corridor bus backup', code: 'BUS-RJY-KPY-CONNECT', from: 'Rajahmundry Bus Station', to: 'Karunagappalli Bus Station', depart: '18:30', arrive: 'Next day / +2', duration: '24h+', fare: 1900, availability: 'Check live bus portals', classes: ['Sleeper', 'AC Sleeper'], reliability: 52, status: 'Local caution note', note: 'Long bus backup only; not the optimized recommendation.' }
    ],
    flights: [
      { service: 'RJA → COK flight + surface connector', code: '6E-RJA-HYD-COK + KSRTC', from: 'Rajahmundry Airport (RJA)', to: 'Cochin Airport / Karunagappalli', depart: '09:15', arrive: '19:10', duration: '9h 55m incl. bus/train', fare: 6430, availability: 'Check airline + KSRTC/rail live', classes: ['Economy + bus/train'], reliability: 76, status: 'Offline connection', note: 'Best emergency route if budget allows and rail time is too slow.' }
    ]
  },
  {
    from: ['Karunagappalli', 'Karunagapalli', 'KPY'],
    to: ['Delhi', 'New Delhi', 'NDLS'],
    trains: [
      { service: 'KERALA EXPRESS connector via Kollam/TVC', code: '12625/CONNECT', from: 'KARUNAGAPPALLI (KPY)', to: 'NEW DELHI (NDLS)', depart: 'Transfer window', arrive: 'Approx +2 days', duration: '45h+', fare: 1120, availability: 'Check IRCTC', classes: ['SL', '3A', '2A'], reliability: 70, status: 'Local route snapshot', note: 'Small station route; verify exact train/station pairing on IRCTC.' }
    ],
    buses: [
      { service: 'KSRTC Karunagappalli → Thiruvananthapuram', code: 'KSRTC-KPY-TRV', from: 'Karunagappalli Bus Station', to: 'Thampanoor Bus Station', depart: '05:30', arrive: '07:45', duration: '2h 15m', fare: 180, availability: 'Connector leg', classes: ['Fast Passenger', 'Super Fast'], reliability: 74, status: 'Local route snapshot', note: 'Useful first leg for flight via TRV.' }
    ],
    flights: [
      { service: 'TRV → DEL flight after bus connector', code: 'TRV-DEL-CONNECT', from: 'Trivandrum Airport (TRV)', to: 'Delhi Airport (DEL)', depart: '12:00', arrive: '15:20', duration: '3h 20m + connector', fare: 6500, availability: 'Check airline portal', classes: ['Economy'], reliability: 76, status: 'Local route snapshot', note: 'Best emergency option from Karunagappalli if train seats are not available.' }
    ]
  }
]

function routeMatches(route, from, to) {
  const fromNeedle = normalizePlace(from)
  const toNeedle = normalizePlace(to)
  if (!fromNeedle || !toNeedle) return false
  const fromHit = route.from.some((item) => normalizePlace(item) === fromNeedle)
  const toHit = route.to.some((item) => normalizePlace(item) === toNeedle)
  return fromHit && toHit
}

function estimateFallbackFare(mode, budget = 0) {
  const base = mode === 'Flight' ? 5200 : mode === 'Bus' ? 850 : 950
  if (!budget) return base
  return Math.max(mode === 'Flight' ? 3500 : 250, Math.min(base, Number(budget) + (mode === 'Flight' ? 2200 : 250)))
}


const broadTrainCatalogue = [
  ['Demo Godavari Express route candidate', 'DEMO-GODAVARI', 'High-priority rail corridor suggestion', 82, ['SL', '3A', '2A']],
  ['Demo Vande Bharat / Chair Car candidate', 'DEMO-VANDE', 'Fast timetable candidate from local dataset', 80, ['CC', '3A', '2A']],
  ['Demo Long Distance Express candidate', 'DEMO-LONG-EXP', 'Long-distance route candidate', 78, ['SL', '3A', '2A']],
  ['Demo Superfast Express candidate', 'DEMO-SF-EXP', 'Broad long-distance rail search', 76, ['SL', '3A', '2A']],
  ['Demo Intercity Express candidate', 'DEMO-INTERCITY', 'Short/medium distance rail search', 78, ['2S', 'CC']],
  ['Demo Passenger / MEMU connector', 'DEMO-MEMU', 'Low-cost short connector', 68, ['General', '2S']],
  ['Demo Nearby Junction backup train', 'DEMO-JUNCTION', 'Backup via major station', 70, ['SL', '3A']],
  ['Demo Night Express backup train', 'DEMO-NIGHT', 'Overnight backup route', 72, ['SL', '3A', '2A']]
]

const broadFlightCatalogue = [
  ['Indigo route search', '6E-CAT', 'High-frequency domestic carrier search', 82],
  ['Air India route search', 'AI-CAT', 'Full-service carrier search', 80],
  ['Akasa Air route search', 'QP-CAT', 'Domestic low-cost carrier search', 74],
  ['SpiceJet route search', 'SG-CAT', 'Domestic carrier backup search', 70],
  ['Air India Express route search', 'IX-CAT', 'Low-cost carrier / connector search', 72],
  ['Major hub flight backup', 'HUB-FLIGHT-CAT', 'Connect via DEL/BOM/HYD/BLR/COK', 68]
]

const broadBusCatalogue = [
  ['State RTC Super Fast / Express search', 'RTC-SF-CAT', 'Government bus route search', 76, ['Super Fast', 'Express']],
  ['State RTC Night service search', 'RTC-NIGHT-CAT', 'Government overnight bus route search', 72, ['Sleeper', 'Seater']],
  ['Private AC sleeper search', 'PRIVATE-AC-SLEEPER-CAT', 'Private operator sleeper route', 66, ['AC Sleeper']],
  ['Private non-AC seater search', 'PRIVATE-NONAC-CAT', 'Budget bus route', 64, ['Non-AC Seater']],
  ['Nearest hub bus connector search', 'BUS-HUB-CONNECT-CAT', 'First/last-mile connector', 74, ['Seater', 'Fast Passenger']],
  ['Emergency road backup search', 'ROAD-BACKUP-CAT', 'Backup when rail/flight fails', 60, ['AC Seater', 'Sleeper']]
]

function timedSlot(index, mode) {
  const slots = mode === 'Flight'
    ? [['06:20', '08:40'], ['09:15', '12:05'], ['13:30', '16:10'], ['17:45', '20:20'], ['21:10', '23:55'], ['Flexible', 'Same day']]
    : mode === 'Bus'
      ? [['05:30', '10:10'], ['08:00', '13:45'], ['13:15', '19:50'], ['18:30', 'Next morning'], ['21:45', 'Next morning'], ['Frequent', 'Varies']]
      : [['05:45', 'Next day'], ['09:30', 'Evening / +1'], ['13:10', 'Night / +1'], ['17:05', 'Morning / +2'], ['21:20', 'Next day'], ['Flexible', 'Check timetable'], ['Nearby hub', 'Connection'], ['Late night', 'Next day']]
  return slots[index % slots.length]
}

function fallbackServices(plan, fromPlace, toPlace) {
  const from = fromPlace?.city || plan.from || 'Origin'
  const to = toPlace?.city || plan.to || 'Destination'
  const budget = Number(plan.budget || 0)
  const fromTrain = fromPlace?.train || `${from} railway station / nearest junction`
  const toTrain = toPlace?.train || `${to} railway station / nearest junction`
  const fromAirport = fromPlace?.airport || `${from} nearest airport`
  const toAirport = toPlace?.airport || `${to} nearest airport`
  const fromBus = fromPlace?.bus || `${from} main bus stand`
  const toBus = toPlace?.bus || `${to} main bus stand`

  const trains = broadTrainCatalogue.map(([name, code, purpose, reliability, classes], index) => {
    const [depart, arrive] = timedSlot(index, 'Train')
    const fare = Math.max(60, Math.round(estimateFallbackFare('Train', budget) * (0.72 + index * 0.08)))
    return {
      service: `${from} → ${to} ${name}`,
      code: `${code}-${index + 1}`,
      from: fromTrain,
      to: toTrain,
      depart,
      arrive,
      duration: index < 2 ? 'Priority rail candidates first' : 'Varies by route and station',
      fare,
      availability: 'Verify live on IRCTC/NTES',
      classes,
      reliability,
      status: 'Local catalogue · provider verification required',
      note: `${purpose}. Exact train number, seat availability, platform and final fare must be verified from official railway sources.`
    }
  })

  const flights = broadFlightCatalogue.map(([name, code, purpose, reliability], index) => {
    const [depart, arrive] = timedSlot(index, 'Flight')
    const fare = Math.max(2200, Math.round(estimateFallbackFare('Flight', budget) * (0.85 + index * 0.08)))
    return {
      service: `${from} → ${to} ${name}`,
      code: `${code}-${index + 1}`,
      from: fromAirport,
      to: toAirport,
      depart,
      arrive,
      duration: 'Same-day if route exists; airport/reporting time extra',
      fare,
      availability: 'Verify live on airline/flight portal',
      classes: getCabinOptions('Flight'),
      reliability,
      status: 'Local catalogue · airline verification required',
      note: `${purpose}. Baggage kg, terminal, fare and cancellation rules depend on the live ticket and airline.`
    }
  })

  const buses = broadBusCatalogue.map(([name, code, purpose, reliability, classes], index) => {
    const [depart, arrive] = timedSlot(index, 'Bus')
    const fare = Math.max(120, Math.round(estimateFallbackFare('Bus', budget) * (0.65 + index * 0.12)))
    return {
      service: `${from} → ${to} ${name}`,
      code: `${code}-${index + 1}`,
      from: fromBus,
      to: toBus,
      depart,
      arrive,
      duration: index < 2 ? 'Short/medium route if available' : 'Varies by operator and road conditions',
      fare,
      availability: 'Verify live on RTC/private bus portal',
      classes,
      reliability,
      status: 'Local catalogue · bus-provider verification required',
      note: `${purpose}. Boarding point, live seat availability and final fare require official/provider confirmation.`
    }
  })

  return { trains, flights, buses }
}

export function getServiceOptions(plan = {}) {
  const fromPlace = findTransportPlace(plan.from)
  const toPlace = findTransportPlace(plan.to)
  const fixture = directServiceFixtures.find((route) => routeMatches(route, plan.from || fromPlace?.city, plan.to || toPlace?.city))
  const fallback = fallbackServices(plan, fromPlace, toPlace)
  return {
    trains: fixture?.trains || fallback.trains,
    flights: fixture?.flights || fallback.flights,
    buses: fixture?.buses || fallback.buses,
    fromPlace,
    toPlace,
    notice: fixture ? 'Curated local route match found. Verify live availability on official portal.' : coverageNotice
  }
}

export function servicesForMode(plan = {}, mode = plan.transportMode || 'Train') {
  const options = getServiceOptions(plan)
  if (mode === 'Flight') return options.flights
  if (mode === 'Bus') return options.buses
  return options.trains
}


function pickServiceForMode(options, mode, index = 0) {
  if (mode === 'Flight') return options.flights[index] || options.flights[0]
  if (mode === 'Bus') return options.buses[index] || options.buses[0]
  return options.trains[index] || options.trains[0]
}

function getLegOptions(from, to, mode, plan = {}) {
  const segment = getServiceOptions({ ...plan, from, to })
  if (mode === 'Flight') return segment.flights
  if (mode === 'Bus') return segment.buses
  return segment.trains
}

function isRoute(plan, fromAliases, toAliases) {
  const from = normalizePlace(plan.from)
  const to = normalizePlace(plan.to)
  return fromAliases.some((item) => normalizePlace(item).includes(from) || from.includes(normalizePlace(item)))
    && toAliases.some((item) => normalizePlace(item).includes(to) || to.includes(normalizePlace(item)))
}

function specialRajahmundryToKarunagappalliLegs(label, plan = {}) {
  if (!isRoute(plan, ['Rajahmundry', 'RJY', 'Rajamahendravaram', 'RJA'], ['Karunagappalli', 'Karunagapalli', 'KPY', 'Karunagappally'])) return null

  const rjyToErsTrain = getLegOptions('Rajahmundry', 'Ernakulam', 'Train', plan)
  const ersToKpyTrain = getLegOptions('Ernakulam', 'Karunagappalli', 'Train', plan)
  const rjyToErsFlight = getLegOptions('Rajahmundry', 'Ernakulam', 'Flight', plan)
  const ersToKpyBus = getLegOptions('Ernakulam', 'Karunagappalli', 'Bus', plan)
  const direct = getServiceOptions(plan)

  const map = {
    'Train only': [direct.trains[0]],
    'Flight only': [direct.flights[0]],
    'Bus only': [direct.buses[0]],
    'Train + Train connector': [rjyToErsTrain[0], ersToKpyTrain[0]],
    'Train + Bus': [rjyToErsTrain[0], ersToKpyBus[0]],
    'Flight + Train': [rjyToErsFlight[0], ersToKpyTrain[0]],
    'Flight + Bus': [rjyToErsFlight[0], ersToKpyBus[0]],
    'Train + Flight': [rjyToErsTrain[0], direct.flights[0]],
    'Bus + Train': [direct.buses[0], ersToKpyTrain[0]]
  }
  return map[label] || null
}

function toLeg(service, mode, leg, plan, fallbackNote = '') {
  return {
    mode,
    leg,
    service: service?.service || `${mode} option`,
    code: service?.code || `${mode}-DEMO`,
    from: service?.from || plan.from,
    to: service?.to || plan.to,
    depart: service?.depart || 'Check portal',
    arrive: service?.arrive || 'Check portal',
    duration: service?.duration || 'Check route',
    fare: service?.fare || 0,
    reliability: service?.reliability || 60,
    note: service?.note || fallbackNote,
    status: service?.status || 'Local route snapshot',
    classes: service?.classes || []
  }
}

export function buildComboLegs(comboOrLabel, plan = {}) {
  const combo = typeof comboOrLabel === 'string'
    ? routeCombos.find((item) => item.label === comboOrLabel)
    : comboOrLabel
  const selected = combo || routeCombos[0]
  const special = specialRajahmundryToKarunagappalliLegs(selected.label, plan)
  if (special) {
    return special.map((service, index) => toLeg(service, selected.sequence[index] || service?.mode || 'Train', index + 1, plan, selected.note))
  }

  const options = getServiceOptions(plan)
  return selected.sequence.map((mode, index) => toLeg(pickServiceForMode(options, mode, index), mode, index + 1, plan, selected.note))
}

export function buildComboLegAlternatives(comboOrLabel, plan = {}) {
  const combo = typeof comboOrLabel === 'string'
    ? routeCombos.find((item) => item.label === comboOrLabel)
    : comboOrLabel
  const selected = combo || routeCombos[0]

  if (isRoute(plan, ['Rajahmundry', 'RJY', 'Rajamahendravaram', 'RJA'], ['Karunagappalli', 'Karunagapalli', 'KPY', 'Karunagappally'])) {
    const specialPools = {
      'Train only': [getServiceOptions(plan).trains],
      'Flight only': [getServiceOptions(plan).flights],
      'Bus only': [getServiceOptions(plan).buses],
      'Train + Train connector': [getLegOptions('Rajahmundry', 'Ernakulam', 'Train', plan), getLegOptions('Ernakulam', 'Karunagappalli', 'Train', plan)],
      'Train + Bus': [getLegOptions('Rajahmundry', 'Ernakulam', 'Train', plan), getLegOptions('Ernakulam', 'Karunagappalli', 'Bus', plan)],
      'Flight + Train': [getLegOptions('Rajahmundry', 'Ernakulam', 'Flight', plan), getLegOptions('Ernakulam', 'Karunagappalli', 'Train', plan)],
      'Flight + Bus': [getLegOptions('Rajahmundry', 'Ernakulam', 'Flight', plan), getLegOptions('Ernakulam', 'Karunagappalli', 'Bus', plan)],
      'Train + Flight': [getLegOptions('Rajahmundry', 'Ernakulam', 'Train', plan), getServiceOptions(plan).flights],
      'Bus + Train': [getServiceOptions(plan).buses, getLegOptions('Ernakulam', 'Karunagappalli', 'Train', plan)]
    }
    const pools = specialPools[selected.label]
    if (pools) return pools.map((services, index) => ({ mode: selected.sequence[index] || 'Train', leg: index + 1, services }))
  }

  const options = getServiceOptions(plan)
  return selected.sequence.map((mode, index) => ({
    mode,
    leg: index + 1,
    services: mode === 'Flight' ? options.flights : mode === 'Bus' ? options.buses : options.trains
  }))
}



export function getTransportCatalogueStats() {
  const fixtureServices = directServiceFixtures.reduce((sum, route) => {
    return sum + (route.trains?.length || 0) + (route.flights?.length || 0) + (route.buses?.length || 0)
  }, 0)

  return {
    hubs: transportPlaces.length,
    fixtureServices,
    fallbackTrainTypes: broadTrainCatalogue.length,
    fallbackFlightTypes: broadFlightCatalogue.length,
    fallbackBusTypes: broadBusCatalogue.length,
    trainCabins: getCabinOptions('Train').length,
    flightCabins: getCabinOptions('Flight').length,
    busCabins: getCabinOptions('Bus').length
  }
}

export const airlineOptions = [
  { value: 'All', label: 'All airlines' },
  { value: 'Indigo', label: 'IndiGo' },
  { value: 'AirIndia', label: 'Air India' },
  { value: 'AirIndiaExpress', label: 'Air India Express' },
  { value: 'SpiceJet', label: 'SpiceJet' },
  { value: 'AkasaAir', label: 'Akasa Air' },
  { value: 'Other', label: 'Other / no airline filter' }
]

export const airlineRules = {
  All: {
    cabin: 'Cabin baggage varies by airline, fare and route. Confirm the allowance on the selected flight before payment.',
    checkIn: 'Check-in baggage is not standardized across all airlines. Read the exact fare rules for each result.',
    instructions: ['Compare departure time, stops, baggage and cancellation rules across airlines.', 'Verify the operating airline and terminal before travel.', 'Keep government ID and the final ticket available offline.', 'Complete payment only on an official airline or licensed booking portal.']
  },
  Indigo: {
    cabin: 'Usually 7 kg cabin baggage. Confirm on ticket before travel.',
    checkIn: 'Common domestic check-in allowance is often 15 kg, but fare type can change it.',
    instructions: ['Reach airport 2 hours early for domestic flights.', 'Keep government ID ready.', 'Web check-in and baggage tags may save time.', 'Liquids, sharp items and power banks have cabin restrictions.']
  },
  AirIndia: {
    cabin: 'Usually 7 kg cabin baggage. Confirm exact limit from ticket/fare rules.',
    checkIn: 'Check-in allowance depends on route and cabin class.',
    instructions: ['Verify terminal before leaving.', 'Keep ID and ticket PDF offline.', 'International routes need passport/visa/document checks.', 'Baggage allowance varies by sector.']
  },
  Vistara: {
    cabin: 'Usually 7 kg cabin baggage. Check fare rule.',
    checkIn: 'Allowance varies by economy/premium/business fare.',
    instructions: ['Check terminal and PNR status.', 'Carry ID matching ticket name.', 'Review cancellation/change rules.', 'Keep battery bank in cabin baggage only.']
  },
  AirIndiaExpress: {
    cabin: 'Cabin baggage allowance depends on the fare. Confirm the current limit on the ticket.',
    checkIn: 'Check-in baggage varies by route and fare bundle.',
    instructions: ['Verify the operating terminal.', 'Keep ID and e-ticket downloaded.', 'Review baggage and change rules before payment.', 'Track official airline alerts for schedule changes.']
  },
  SpiceJet: {
    cabin: 'Usually 7 kg cabin baggage. Confirm on booking page.',
    checkIn: 'Often 15 kg domestic check-in, but add-ons/fare rules can differ.',
    instructions: ['Complete web check-in.', 'Check airport reporting time.', 'Confirm baggage add-ons if carrying extra weight.', 'Keep emergency contact updated.']
  },
  AkasaAir: {
    cabin: 'Usually 7 kg cabin baggage. Confirm on ticket.',
    checkIn: 'Allowance depends on route/fare.',
    instructions: ['Check terminal and boarding gate early.', 'Keep ID and e-ticket downloaded.', 'Check baggage policy before leaving.', 'Track SMS/email updates.']
  },
  Other: {
    cabin: 'Cabin baggage varies by airline and fare. Confirm on official ticket.',
    checkIn: 'Check-in baggage varies by airline, route and fare type.',
    instructions: ['Do not assume baggage kg. Read ticket/fare rules.', 'Keep ID and ticket offline.', 'Reach airport early.', 'Use official airline app/SMS for live updates.']
  }
}

export const demoRunningStatus = {
  Train: [
    { service: 'AP EXPRESS (20805)', from: 'Rajahmundry', to: 'New Delhi', status: 'Catalogue: Refresh on NTES', platform: 'PF check required', updated: 'Local simulation' },
    { service: '12723 Telangana Express', from: 'Hyderabad', to: 'Delhi', status: 'Catalogue: On time', platform: 'PF 4', updated: 'Local simulation' },
    { service: '12627 Karnataka Express', from: 'Bengaluru', to: 'Delhi', status: 'Catalogue: 18 min late', platform: 'PF 2', updated: 'Local simulation' },
    { service: '12051 Jan Shatabdi Express', from: 'Mumbai', to: 'Madgaon', status: 'API test train · verify live', platform: 'PF check required', updated: 'Live API-ready' }
  ],
  Bus: [
    { service: 'KSRTC Karunagappalli → TVC', from: 'Karunagappalli', to: 'Thiruvananthapuram', status: 'Catalogue: Frequent service', platform: 'Bay check required', updated: 'Local simulation' },
    { service: 'TSRTC Hyderabad → Vijayawada', from: 'Hyderabad', to: 'Vijayawada', status: 'Catalogue: Boarding soon', platform: 'Bay 12', updated: 'Local simulation' },
    { service: 'KSRTC Bengaluru → Mysuru', from: 'Bengaluru', to: 'Mysuru', status: 'Catalogue: 10 min delay', platform: 'Bay 4', updated: 'Local simulation' },
    { service: 'MSRTC Mumbai → Pune', from: 'Mumbai', to: 'Pune', status: 'Catalogue: On time', platform: 'Bay 8', updated: 'Local simulation' }
  ],
  Flight: [
    { service: '6E 6E HYD → DEL', from: 'Hyderabad', to: 'Delhi', status: 'Catalogue: Check-in open', platform: 'Gate TBA', updated: 'Local simulation' },
    { service: '6E 6E RJA → DEL via HYD', from: 'Rajahmundry', to: 'Delhi', status: 'Catalogue: Connection route', platform: 'Gate TBA', updated: 'Local simulation' },
    { service: 'AI BOM → BLR', from: 'Mumbai', to: 'Bengaluru', status: 'Catalogue: Boarding in 45 min', platform: 'Gate 22', updated: 'Local simulation' }
  ]
}
