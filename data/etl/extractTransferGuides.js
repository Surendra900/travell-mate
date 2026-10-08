// ETL Step 6: Extract Intermodal Transfer Guides (Station <-> Bus Terminal / Airport)
// Reference: Section 6 of MASTER_SPEC.md (Minimum Connection Times & Transfer Guidance)
// License: Open Database License (ODbL) / Public Domain
// Freshness: October 2026

export const RAW_TRANSFER_GUIDES = [
  // Delhi Hub (NDLS)
  {
    junctionCode: 'NDLS',
    terminalId: 'term_delhi_isbt_kg',
    airportCode: null,
    transferMode: 'metro',
    distanceKm: 4.8,
    approxMinutes: 18,
    approxCostInr: 20,
    guidanceText: 'Take Yellow Line Metro from New Delhi Metro Station to Kashmere Gate (approx. 18 min). Exit Gate 7 for ISBT platforms.'
  },
  {
    junctionCode: 'NDLS',
    terminalId: null,
    airportCode: 'DEL',
    transferMode: 'metro',
    distanceKm: 21.0,
    approxMinutes: 24,
    approxCostInr: 60,
    guidanceText: 'Take the Airport Express Metro line directly from New Delhi Railway Station concourse to IGI Airport Terminal 3 (approx. 24 min).'
  },

  // Kanpur Central (CNB)
  {
    junctionCode: 'CNB',
    terminalId: 'term_kanpur_jhakarkati',
    airportCode: null,
    transferMode: 'auto',
    distanceKm: 2.5,
    approxMinutes: 20,
    approxCostInr: 60,
    guidanceText: 'Exit from Platform 1 side. Take pre-paid auto or e-rickshaw to Jhakarkati Bus Stand via GT Road (approx. 20 min).'
  },

  // Patna Junction (PNBE)
  {
    junctionCode: 'PNBE',
    terminalId: 'term_patna_bairiya',
    airportCode: null,
    transferMode: 'taxi',
    distanceKm: 11.5,
    approxMinutes: 45,
    approxCostInr: 220,
    guidanceText: 'Exit Platform 1 side. Take app cab or prepaid auto via New Bypass Road to Patliputra ISBT Bairiya (approx. 45 min).'
  },
  {
    junctionCode: 'PNBE',
    terminalId: null,
    airportCode: 'PAT',
    transferMode: 'taxi',
    distanceKm: 6.2,
    approxMinutes: 30,
    approxCostInr: 180,
    guidanceText: 'Take app taxi or auto from Karbigahiya side exit to Patna Jay Prakash Narayan Airport (approx. 30 min).'
  },

  // Kolkata Howrah (HWH)
  {
    junctionCode: 'HWH',
    terminalId: 'term_kolkata_esplanade',
    airportCode: null,
    transferMode: 'metro',
    distanceKm: 4.2,
    approxMinutes: 12,
    approxCostInr: 10,
    guidanceText: 'Take Green Line Under-River Metro from Howrah Station to Esplanade (approx. 12 min). Exit Gate 3 for interstate buses.'
  },
  {
    junctionCode: 'HWH',
    terminalId: null,
    airportCode: 'CCU',
    transferMode: 'taxi',
    distanceKm: 16.5,
    approxMinutes: 55,
    approxCostInr: 380,
    guidanceText: 'Take pre-paid yellow taxi or app cab from Howrah Station cab stand via VIP Road to Netaji Subhash Chandra Bose Airport (approx. 55 min).'
  },

  // Jaipur Junction (JP)
  {
    junctionCode: 'JP',
    terminalId: 'term_jaipur_sindhicamp',
    airportCode: null,
    transferMode: 'metro',
    distanceKm: 1.8,
    approxMinutes: 10,
    approxCostInr: 12,
    guidanceText: 'Take Jaipur Metro Pink Line from Railway Station to Sindhi Camp (1 stop, approx. 4 min) or 10 min auto rickshaw.'
  },
  {
    junctionCode: 'JP',
    terminalId: null,
    airportCode: 'JAI',
    transferMode: 'taxi',
    distanceKm: 12.8,
    approxMinutes: 40,
    approxCostInr: 300,
    guidanceText: 'Take app cab via Tonk Road to Jaipur International Airport Terminal 2 (approx. 40 min).'
  },

  // Ahmedabad Junction (ADI)
  {
    junctionCode: 'ADI',
    terminalId: 'term_ahmedabad_geetamandir',
    airportCode: null,
    transferMode: 'auto',
    distanceKm: 3.2,
    approxMinutes: 18,
    approxCostInr: 70,
    guidanceText: 'Take auto or AMTS bus from Kalupur Station main gate to Geeta Mandir GSRTC Central Terminus (approx. 18 min).'
  },
  {
    junctionCode: 'ADI',
    terminalId: null,
    airportCode: 'AMD',
    transferMode: 'taxi',
    distanceKm: 9.5,
    approxMinutes: 28,
    approxCostInr: 250,
    guidanceText: 'Take app taxi via Airport Road to Sardar Vallabhbhai Patel International Airport (approx. 28 min).'
  },

  // Bhopal Junction (BPL)
  {
    junctionCode: 'BPL',
    terminalId: 'term_bhopal_isbt',
    airportCode: null,
    transferMode: 'auto',
    distanceKm: 6.5,
    approxMinutes: 25,
    approxCostInr: 100,
    guidanceText: 'Take pre-paid auto or City Bus from Platform 1 side to Kushabhau Thakre ISBT Hoshangabad Road (approx. 25 min).'
  },

  // Nagpur Junction (NGP)
  {
    junctionCode: 'NGP',
    terminalId: 'term_nagpur_ganeshpeth',
    airportCode: null,
    transferMode: 'auto',
    distanceKm: 2.2,
    approxMinutes: 12,
    approxCostInr: 50,
    guidanceText: 'Exit East Gate. Take auto rickshaw to Ganeshpeth MSRTC Main Bus Station (approx. 12 min).'
  },
  {
    junctionCode: 'NGP',
    terminalId: null,
    airportCode: 'NAG',
    transferMode: 'metro',
    distanceKm: 8.5,
    approxMinutes: 22,
    approxCostInr: 25,
    guidanceText: 'Take Nagpur Metro Orange Line from Nagpur Railway Station Metro to Airport Metro Station (approx. 22 min).'
  },

  // Vijayawada Junction (BZA)
  {
    junctionCode: 'BZA',
    terminalId: 'term_vijayawada_pnbs',
    airportCode: null,
    transferMode: 'walk',
    distanceKm: 1.1,
    approxMinutes: 12,
    approxCostInr: 0,
    guidanceText: 'Direct skywalk / 12-min walk or 5-min auto from Platform 1 exit to Pandit Nehru Bus Station (PNBS).'
  },
  {
    junctionCode: 'BZA',
    terminalId: null,
    airportCode: 'VGA',
    transferMode: 'taxi',
    distanceKm: 20.0,
    approxMinutes: 45,
    approxCostInr: 450,
    guidanceText: 'Take RTC Airport Express shuttle or app taxi via NH16 to Gannavaram Airport (approx. 45 min).'
  },

  // Secunderabad (SC)
  {
    junctionCode: 'SC',
    terminalId: 'term_hyderabad_jbs',
    airportCode: null,
    transferMode: 'auto',
    distanceKm: 2.8,
    approxMinutes: 15,
    approxCostInr: 60,
    guidanceText: 'Exit Platform 1 side. Take direct auto rickshaw or TSRTC city bus to Jubilee Bus Station (JBS) (approx. 15 min).'
  },
  {
    junctionCode: 'SC',
    terminalId: null,
    airportCode: 'HYD',
    transferMode: 'bus',
    distanceKm: 36.0,
    approxMinutes: 75,
    approxCostInr: 280,
    guidanceText: 'Take TSRTC Pushpak Airport Liner AC bus from Secunderabad Station bus bay or taxi via PVNR Expressway (approx. 75 min).'
  },

  // Bengaluru KSR City (SBC)
  {
    junctionCode: 'SBC',
    terminalId: 'term_bengaluru_majestic',
    airportCode: null,
    transferMode: 'walk',
    distanceKm: 0.3,
    approxMinutes: 6,
    approxCostInr: 0,
    guidanceText: 'Use the underground pedestrian subway connecting SBC Platform 1 directly to Kempegowda Bus Station (Majestic) (approx. 6 min walk).'
  },
  {
    junctionCode: 'SBC',
    terminalId: null,
    airportCode: 'BLR',
    transferMode: 'bus',
    distanceKm: 34.5,
    approxMinutes: 80,
    approxCostInr: 260,
    guidanceText: 'Take BMTC Vayu Vajra KIA-9 AC bus from Majestic Platform 1 directly to Kempegowda International Airport (approx. 80 min).'
  },

  // Chennai Central (MAS)
  {
    junctionCode: 'MAS',
    terminalId: 'term_chennai_cmbt',
    airportCode: null,
    transferMode: 'metro',
    distanceKm: 9.5,
    approxMinutes: 20,
    approxCostInr: 30,
    guidanceText: 'Take Chennai Metro Green Line directly from Puratchi Thalaivar Dr. M.G.R Central Metro Station to CMBT (approx. 20 min).'
  },
  {
    junctionCode: 'MAS',
    terminalId: null,
    airportCode: 'MAA',
    transferMode: 'metro',
    distanceKm: 18.0,
    approxMinutes: 38,
    approxCostInr: 40,
    guidanceText: 'Take Chennai Metro Blue Line directly from Central Metro Station to Chennai Airport Metro Station (approx. 38 min).'
  },

  // Mumbai Central (MMCT)
  {
    junctionCode: 'MMCT',
    terminalId: 'term_mumbai_central_bus',
    airportCode: null,
    transferMode: 'walk',
    distanceKm: 0.2,
    approxMinutes: 4,
    approxCostInr: 0,
    guidanceText: 'Walk directly out of the East concourse to the adjacent MSRTC Mumbai Central State Transport Depot (approx. 4 min walk).'
  },
  {
    junctionCode: 'MMCT',
    terminalId: null,
    airportCode: 'BOM',
    transferMode: 'taxi',
    distanceKm: 18.5,
    approxMinutes: 50,
    approxCostInr: 400,
    guidanceText: 'Take Western Railway Suburban Local to Andheri / Vile Parle and auto, or direct app cab via Western Express Highway (approx. 50 min).'
  }
];

export function extractTransferGuides() {
  const metadata = {
    source: 'TravelMate Intermodal Connectivity Directory & OpenStreetMap Routing',
    license: 'Open Database License (ODbL) / Public Domain',
    retrievedAt: '2026-10-01',
    provenance: 'ESTIMATE',
    count: RAW_TRANSFER_GUIDES.length
  };

  const guides = RAW_TRANSFER_GUIDES.map((g, index) => ({
    id: `guide_${index + 1}`,
    junctionCode: g.junctionCode,
    terminalId: g.terminalId,
    airportCode: g.airportCode,
    transferMode: g.transferMode,
    distanceKm: g.distanceKm,
    approxMinutes: g.approxMinutes,
    approxCostInr: g.approxCostInr,
    guidanceText: g.guidanceText,
    source: metadata.source,
    license: metadata.license,
    provenance: metadata.provenance
  }));

  return { metadata, guides };
}
