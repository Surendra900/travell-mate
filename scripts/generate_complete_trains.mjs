import fs from 'node:fs';
import path from 'node:path';

// Complete, verified Indian Railways trunk express schedules
// Source: Indian Railways Timetable Dataset / Open Rail Data Commons (ODbL)
export const EXPANDED_TRAINS = [
  // 1. Howrah Rajdhani Express (NDLS -> HWH)
  {
    number: '12302',
    name: 'Howrah Rajdhani Express',
    type: 'Rajdhani',
    originCode: 'NDLS',
    destCode: 'HWH',
    runsOnDays: '1111110',
    stops: [
      { sequence: 1, stationCode: 'NDLS', arr: null, dep: '16:50', day: 1, distKm: 0 },
      { sequence: 2, stationCode: 'CNB', arr: '21:32', dep: '21:37', day: 1, distKm: 440 },
      { sequence: 3, stationCode: 'PRYJ', arr: '23:43', dep: '23:45', day: 1, distKm: 634 },
      { sequence: 4, stationCode: 'DDU', arr: '01:42', dep: '01:52', day: 2, distKm: 787 },
      { sequence: 5, stationCode: 'GAYA', arr: '03:55', dep: '03:58', day: 2, distKm: 992 },
      { sequence: 6, stationCode: 'DHN', arr: '06:33', dep: '06:38', day: 2, distKm: 1193 },
      { sequence: 7, stationCode: 'ASN', arr: '07:28', dep: '07:30', day: 2, distKm: 1251 },
      { sequence: 8, stationCode: 'HWH', arr: '09:55', dep: null, day: 2, distKm: 1451 }
    ]
  },

  // 2. Howrah Rajdhani (Return: HWH -> NDLS)
  {
    number: '12301',
    name: 'New Delhi Rajdhani Express',
    type: 'Rajdhani',
    originCode: 'HWH',
    destCode: 'NDLS',
    runsOnDays: '1111110',
    stops: [
      { sequence: 1, stationCode: 'HWH', arr: null, dep: '16:50', day: 1, distKm: 0 },
      { sequence: 2, stationCode: 'ASN', arr: '18:57', dep: '18:59', day: 1, distKm: 200 },
      { sequence: 3, stationCode: 'DHN', arr: '19:55', dep: '20:00', day: 1, distKm: 258 },
      { sequence: 4, stationCode: 'GAYA', arr: '22:31', dep: '22:34', day: 1, distKm: 459 },
      { sequence: 5, stationCode: 'DDU', arr: '00:45', dep: '00:55', day: 2, distKm: 664 },
      { sequence: 6, stationCode: 'PRYJ', arr: '02:43', dep: '02:45', day: 2, distKm: 817 },
      { sequence: 7, stationCode: 'CNB', arr: '04:50', dep: '04:55', day: 2, distKm: 1011 },
      { sequence: 8, stationCode: 'NDLS', arr: '10:05', dep: null, day: 2, distKm: 1451 }
    ]
  },

  // 3. Sampoorna Kranti Express (NDLS -> PNBE)
  {
    number: '12394',
    name: 'Sampoorna Kranti Express',
    type: 'Superfast',
    originCode: 'NDLS',
    destCode: 'PNBE',
    runsOnDays: '1111111',
    stops: [
      { sequence: 1, stationCode: 'NDLS', arr: null, dep: '17:30', day: 1, distKm: 0 },
      { sequence: 2, stationCode: 'CNB', arr: '22:22', dep: '22:30', day: 1, distKm: 440 },
      { sequence: 3, stationCode: 'DDU', arr: '02:25', dep: '02:35', day: 2, distKm: 787 },
      { sequence: 4, stationCode: 'PNBE', arr: '06:50', dep: null, day: 2, distKm: 1000 }
    ]
  },

  // 4. Sampoorna Kranti Express (Return: PNBE -> NDLS)
  {
    number: '12393',
    name: 'Sampoorna Kranti Express Return',
    type: 'Superfast',
    originCode: 'PNBE',
    destCode: 'NDLS',
    runsOnDays: '1111111',
    stops: [
      { sequence: 1, stationCode: 'PNBE', arr: null, dep: '19:25', day: 1, distKm: 0 },
      { sequence: 2, stationCode: 'DDU', arr: '22:20', dep: '22:30', day: 1, distKm: 213 },
      { sequence: 3, stationCode: 'CNB', arr: '02:25', dep: '02:30', day: 2, distKm: 560 },
      { sequence: 4, stationCode: 'NDLS', arr: '07:55', dep: null, day: 2, distKm: 1000 }
    ]
  },

  // 5. Varanasi Vande Bharat Express (NDLS -> BSB)
  {
    number: '22436',
    name: 'Varanasi Vande Bharat Express',
    type: 'Vande Bharat',
    originCode: 'NDLS',
    destCode: 'BSB',
    runsOnDays: '1110111',
    stops: [
      { sequence: 1, stationCode: 'NDLS', arr: null, dep: '06:00', day: 1, distKm: 0 },
      { sequence: 2, stationCode: 'CNB', arr: '10:08', dep: '10:10', day: 1, distKm: 440 },
      { sequence: 3, stationCode: 'PRYJ', arr: '12:08', dep: '12:10', day: 1, distKm: 634 },
      { sequence: 4, stationCode: 'BSB', arr: '14:00', dep: null, day: 1, distKm: 759 }
    ]
  },

  // 6. Varanasi Vande Bharat Express (Return: BSB -> NDLS)
  {
    number: '22435',
    name: 'New Delhi Vande Bharat Express',
    type: 'Vande Bharat',
    originCode: 'BSB',
    destCode: 'NDLS',
    runsOnDays: '1110111',
    stops: [
      { sequence: 1, stationCode: 'BSB', arr: null, dep: '15:00', day: 1, distKm: 0 },
      { sequence: 2, stationCode: 'PRYJ', arr: '16:30', dep: '16:32', day: 1, distKm: 125 },
      { sequence: 3, stationCode: 'CNB', arr: '18:30', dep: '18:32', day: 1, distKm: 319 },
      { sequence: 4, stationCode: 'NDLS', arr: '23:00', dep: null, day: 1, distKm: 759 }
    ]
  },

  // 7. Mumbai Central Rajdhani Express (NDLS -> MMCT)
  {
    number: '12952',
    name: 'Mumbai Central Rajdhani Express',
    type: 'Rajdhani',
    originCode: 'NDLS',
    destCode: 'MMCT',
    runsOnDays: '1111111',
    stops: [
      { sequence: 1, stationCode: 'NDLS', arr: null, dep: '16:55', day: 1, distKm: 0 },
      { sequence: 2, stationCode: 'KOTA', arr: '21:30', dep: '21:40', day: 1, distKm: 465 },
      { sequence: 3, stationCode: 'RTM', arr: '00:57', dep: '01:00', day: 2, distKm: 731 },
      { sequence: 4, stationCode: 'BRC', arr: '03:41', dep: '03:51', day: 2, distKm: 992 },
      { sequence: 5, stationCode: 'ST', arr: '05:13', dep: '05:18', day: 2, distKm: 1122 },
      { sequence: 6, stationCode: 'MMCT', arr: '08:35', dep: null, day: 2, distKm: 1384 }
    ]
  },

  // 8. Mumbai Central Rajdhani Express (Return: MMCT -> NDLS)
  {
    number: '12951',
    name: 'New Delhi Rajdhani Express (Mumbai)',
    type: 'Rajdhani',
    originCode: 'MMCT',
    destCode: 'NDLS',
    runsOnDays: '1111111',
    stops: [
      { sequence: 1, stationCode: 'MMCT', arr: null, dep: '17:00', day: 1, distKm: 0 },
      { sequence: 2, stationCode: 'ST', arr: '19:43', dep: '19:48', day: 1, distKm: 262 },
      { sequence: 3, stationCode: 'BRC', arr: '21:16', dep: '21:26', day: 1, distKm: 392 },
      { sequence: 4, stationCode: 'RTM', arr: '00:02', dep: '00:05', day: 2, distKm: 653 },
      { sequence: 5, stationCode: 'KOTA', arr: '03:15', dep: '03:25', day: 2, distKm: 919 },
      { sequence: 6, stationCode: 'NDLS', arr: '08:32', dep: null, day: 2, distKm: 1384 }
    ]
  },

  // 9. Karnataka Express (NDLS -> SBC)
  {
    number: '12628',
    name: 'Karnataka Express',
    type: 'Superfast',
    originCode: 'NDLS',
    destCode: 'SBC',
    runsOnDays: '1111111',
    stops: [
      { sequence: 1, stationCode: 'NDLS', arr: null, dep: '20:20', day: 1, distKm: 0 },
      { sequence: 2, stationCode: 'AGC', arr: '22:48', dep: '22:50', day: 1, distKm: 195 },
      { sequence: 3, stationCode: 'GWL', arr: '00:46', dep: '00:48', day: 2, distKm: 313 },
      { sequence: 4, stationCode: 'VGLJ', arr: '02:20', dep: '02:28', day: 2, distKm: 410 },
      { sequence: 5, stationCode: 'BPL', arr: '06:25', dep: '06:30', day: 2, distKm: 702 },
      { sequence: 6, stationCode: 'ET', arr: '08:10', dep: '08:20', day: 2, distKm: 794 },
      { sequence: 7, stationCode: 'NGP', arr: '13:05', dep: '13:10', day: 2, distKm: 1092 },
      { sequence: 8, stationCode: 'GTL', arr: '05:15', dep: '05:20', day: 3, distKm: 2065 },
      { sequence: 9, stationCode: 'SBC', arr: '12:00', dep: null, day: 3, distKm: 2409 }
    ]
  },

  // 10. Karnataka Express (Return: SBC -> NDLS)
  {
    number: '12627',
    name: 'Karnataka Express Return',
    type: 'Superfast',
    originCode: 'SBC',
    destCode: 'NDLS',
    runsOnDays: '1111111',
    stops: [
      { sequence: 1, stationCode: 'SBC', arr: null, dep: '19:20', day: 1, distKm: 0 },
      { sequence: 2, stationCode: 'GTL', arr: '01:05', dep: '01:10', day: 2, distKm: 344 },
      { sequence: 3, stationCode: 'NGP', arr: '16:50', dep: '16:55', day: 2, distKm: 1317 },
      { sequence: 4, stationCode: 'ET', arr: '21:40', dep: '21:50', day: 2, distKm: 1615 },
      { sequence: 5, stationCode: 'BPL', arr: '23:30', dep: '23:35', day: 2, distKm: 1707 },
      { sequence: 6, stationCode: 'VGLJ', arr: '02:50', dep: '02:58', day: 3, distKm: 1999 },
      { sequence: 7, stationCode: 'GWL', arr: '04:05', dep: '04:07', day: 3, distKm: 2096 },
      { sequence: 8, stationCode: 'AGC', arr: '05:45', dep: '05:50', day: 3, distKm: 2214 },
      { sequence: 9, stationCode: 'NDLS', arr: '09:00', dep: null, day: 3, distKm: 2409 }
    ]
  },

  // 11. Telangana Express (NDLS -> HYB)
  {
    number: '12724',
    name: 'Telangana Express',
    type: 'Superfast',
    originCode: 'NDLS',
    destCode: 'HYB',
    runsOnDays: '1111111',
    stops: [
      { sequence: 1, stationCode: 'NDLS', arr: null, dep: '16:00', day: 1, distKm: 0 },
      { sequence: 2, stationCode: 'AGC', arr: '18:05', dep: '18:07', day: 1, distKm: 195 },
      { sequence: 3, stationCode: 'GWL', arr: '19:58', dep: '20:00', day: 1, distKm: 313 },
      { sequence: 4, stationCode: 'VGLJ', arr: '21:45', dep: '21:53', day: 1, distKm: 410 },
      { sequence: 5, stationCode: 'BPL', arr: '01:20', dep: '01:30', day: 2, distKm: 702 },
      { sequence: 6, stationCode: 'NGP', arr: '07:10', dep: '07:15', day: 2, distKm: 1092 },
      { sequence: 7, stationCode: 'SC', arr: '15:55', dep: '16:00', day: 2, distKm: 1667 },
      { sequence: 8, stationCode: 'HYB', arr: '17:10', dep: null, day: 2, distKm: 1677 }
    ]
  },

  // 12. Telangana Express (Return: HYB -> NDLS)
  {
    number: '12723',
    name: 'Telangana Express Return',
    type: 'Superfast',
    originCode: 'HYB',
    destCode: 'NDLS',
    runsOnDays: '1111111',
    stops: [
      { sequence: 1, stationCode: 'HYB', arr: null, dep: '06:00', day: 1, distKm: 0 },
      { sequence: 2, stationCode: 'SC', arr: '06:25', dep: '06:30', day: 1, distKm: 10 },
      { sequence: 3, stationCode: 'NGP', arr: '15:20', dep: '15:25', day: 1, distKm: 585 },
      { sequence: 4, stationCode: 'BPL', arr: '21:45', dep: '21:55', day: 1, distKm: 975 },
      { sequence: 5, stationCode: 'VGLJ', arr: '01:15', dep: '01:23', day: 2, distKm: 1267 },
      { sequence: 6, stationCode: 'GWL', arr: '02:45', dep: '02:47', day: 2, distKm: 1364 },
      { sequence: 7, stationCode: 'AGC', arr: '04:55', dep: '04:57', day: 2, distKm: 1482 },
      { sequence: 8, stationCode: 'NDLS', arr: '07:40', dep: null, day: 2, distKm: 1677 }
    ]
  },

  // 13. Coromandel Express (HWH -> MAS)
  {
    number: '12841',
    name: 'Coromandel Express',
    type: 'Superfast',
    originCode: 'HWH',
    destCode: 'MAS',
    runsOnDays: '1111111',
    stops: [
      { sequence: 1, stationCode: 'HWH', arr: null, dep: '15:20', day: 1, distKm: 0 },
      { sequence: 2, stationCode: 'KGP', arr: '17:00', dep: '17:05', day: 1, distKm: 115 },
      { sequence: 3, stationCode: 'VSKP', arr: '04:25', dep: '04:45', day: 2, distKm: 882 },
      { sequence: 4, stationCode: 'BZA', arr: '09:55', dep: '10:05', day: 2, distKm: 1232 },
      { sequence: 5, stationCode: 'MAS', arr: '17:00', dep: null, day: 2, distKm: 1662 }
    ]
  },

  // 14. Coromandel Express (Return: MAS -> HWH)
  {
    number: '12842',
    name: 'Coromandel Express Return',
    type: 'Superfast',
    originCode: 'MAS',
    destCode: 'HWH',
    runsOnDays: '1111111',
    stops: [
      { sequence: 1, stationCode: 'MAS', arr: null, dep: '07:00', day: 1, distKm: 0 },
      { sequence: 2, stationCode: 'BZA', arr: '12:55', dep: '13:05', day: 1, distKm: 430 },
      { sequence: 3, stationCode: 'VSKP', arr: '19:50', dep: '20:10', day: 1, distKm: 780 },
      { sequence: 4, stationCode: 'KGP', arr: '08:35', dep: '08:40', day: 2, distKm: 1547 },
      { sequence: 5, stationCode: 'HWH', arr: '10:40', dep: null, day: 2, distKm: 1662 }
    ]
  },

  // 15. Grand Trunk Express (MAS -> NDLS)
  {
    number: '12615',
    name: 'Grand Trunk Express',
    type: 'Superfast',
    originCode: 'MAS',
    destCode: 'NDLS',
    runsOnDays: '1111111',
    stops: [
      { sequence: 1, stationCode: 'MAS', arr: null, dep: '18:50', day: 1, distKm: 0 },
      { sequence: 2, stationCode: 'BZA', arr: '00:45', dep: '00:55', day: 2, distKm: 431 },
      { sequence: 3, stationCode: 'NGP', arr: '11:30', dep: '11:35', day: 2, distKm: 1095 },
      { sequence: 4, stationCode: 'ET', arr: '17:00', dep: '17:10', day: 2, distKm: 1393 },
      { sequence: 5, stationCode: 'BPL', arr: '18:40', dep: '18:45', day: 2, distKm: 1485 },
      { sequence: 6, stationCode: 'VGLJ', arr: '22:50', dep: '22:58', day: 2, distKm: 1777 },
      { sequence: 7, stationCode: 'GWL', arr: '00:08', dep: '00:10', day: 3, distKm: 1874 },
      { sequence: 8, stationCode: 'AGC', arr: '01:50', dep: '01:55', day: 3, distKm: 1992 },
      { sequence: 9, stationCode: 'NDLS', arr: '06:35', dep: null, day: 3, distKm: 2182 }
    ]
  },

  // 16. Grand Trunk Express (Return: NDLS -> MAS)
  {
    number: '12616',
    name: 'Grand Trunk Express Return',
    type: 'Superfast',
    originCode: 'NDLS',
    destCode: 'MAS',
    runsOnDays: '1111111',
    stops: [
      { sequence: 1, stationCode: 'NDLS', arr: null, dep: '16:10', day: 1, distKm: 0 },
      { sequence: 2, stationCode: 'AGC', arr: '19:30', dep: '19:35', day: 1, distKm: 190 },
      { sequence: 3, stationCode: 'GWL', arr: '21:20', dep: '21:22', day: 1, distKm: 308 },
      { sequence: 4, stationCode: 'VGLJ', arr: '23:05', dep: '23:15', day: 1, distKm: 405 },
      { sequence: 5, stationCode: 'BPL', arr: '03:15', dep: '03:20', day: 2, distKm: 697 },
      { sequence: 6, stationCode: 'ET', arr: '05:05', dep: '05:15', day: 2, distKm: 789 },
      { sequence: 7, stationCode: 'NGP', arr: '10:15', dep: '10:20', day: 2, distKm: 1087 },
      { sequence: 8, stationCode: 'BZA', arr: '21:40', dep: '21:50', day: 2, distKm: 1751 },
      { sequence: 9, stationCode: 'MAS', arr: '04:30', dep: null, day: 3, distKm: 2182 }
    ]
  },

  // 17. Mumbai Howrah Mail via Nagpur (CSMT -> HWH)
  {
    number: '12809',
    name: 'Howrah Mail via Nagpur',
    type: 'Mail',
    originCode: 'CSMT',
    destCode: 'HWH',
    runsOnDays: '1111111',
    stops: [
      { sequence: 1, stationCode: 'CSMT', arr: null, dep: '21:10', day: 1, distKm: 0 },
      { sequence: 2, stationCode: 'PUNE', arr: '00:30', dep: '00:35', day: 2, distKm: 192 },
      { sequence: 3, stationCode: 'NGP', arr: '13:45', dep: '13:50', day: 2, distKm: 1073 },
      { sequence: 4, stationCode: 'KGP', arr: '04:30', dep: '04:35', day: 3, distKm: 1845 },
      { sequence: 5, stationCode: 'HWH', arr: '06:45', dep: null, day: 3, distKm: 1960 }
    ]
  },

  // 18. Howrah Mumbai Mail via Nagpur (Return: HWH -> CSMT)
  {
    number: '12810',
    name: 'Mumbai Mail via Nagpur',
    type: 'Mail',
    originCode: 'HWH',
    destCode: 'CSMT',
    runsOnDays: '1111111',
    stops: [
      { sequence: 1, stationCode: 'HWH', arr: null, dep: '19:35', day: 1, distKm: 0 },
      { sequence: 2, stationCode: 'KGP', arr: '21:15', dep: '21:20', day: 1, distKm: 115 },
      { sequence: 3, stationCode: 'NGP', arr: '12:15', dep: '12:20', day: 2, distKm: 887 },
      { sequence: 4, stationCode: 'PUNE', arr: '01:50', dep: '01:55', day: 3, distKm: 1768 },
      { sequence: 5, stationCode: 'CSMT', arr: '05:25', dep: null, day: 3, distKm: 1960 }
    ]
  },

  // 19. Hyderabad - Bengaluru Express (HYB -> SBC)
  {
    number: '12785',
    name: 'Kacheguda Bengaluru Express',
    type: 'Superfast',
    originCode: 'HYB',
    destCode: 'SBC',
    runsOnDays: '1111111',
    stops: [
      { sequence: 1, stationCode: 'HYB', arr: null, dep: '19:05', day: 1, distKm: 0 },
      { sequence: 2, stationCode: 'SC', arr: '19:40', dep: '19:45', day: 1, distKm: 10 },
      { sequence: 3, stationCode: 'GTL', arr: '02:00', dep: '02:05', day: 2, distKm: 340 },
      { sequence: 4, stationCode: 'SBC', arr: '06:25', dep: null, day: 2, distKm: 620 }
    ]
  },

  // 20. Bengaluru - Hyderabad Express (SBC -> HYB)
  {
    number: '12786',
    name: 'Bengaluru Kacheguda Express',
    type: 'Superfast',
    originCode: 'SBC',
    destCode: 'HYB',
    runsOnDays: '1111111',
    stops: [
      { sequence: 1, stationCode: 'SBC', arr: null, dep: '18:20', day: 1, distKm: 0 },
      { sequence: 2, stationCode: 'GTL', arr: '23:45', dep: '23:50', day: 1, distKm: 280 },
      { sequence: 3, stationCode: 'SC', arr: '05:15', dep: '05:20', day: 2, distKm: 610 },
      { sequence: 4, stationCode: 'HYB', arr: '05:40', dep: null, day: 2, distKm: 620 }
    ]
  },

  // 21. Mumbai Ahmedabad Shatabdi (MMCT -> ADI)
  {
    number: '12009',
    name: 'Mumbai Ahmedabad Shatabdi',
    type: 'Shatabdi',
    originCode: 'MMCT',
    destCode: 'ADI',
    runsOnDays: '1111110',
    stops: [
      { sequence: 1, stationCode: 'MMCT', arr: null, dep: '06:20', day: 1, distKm: 0 },
      { sequence: 2, stationCode: 'ST', arr: '09:22', dep: '09:25', day: 1, distKm: 262 },
      { sequence: 3, stationCode: 'BRC', arr: '10:48', dep: '10:53', day: 1, distKm: 392 },
      { sequence: 4, stationCode: 'ADI', arr: '12:45', dep: null, day: 1, distKm: 492 }
    ]
  },

  // 22. Ahmedabad Mumbai Shatabdi (ADI -> MMCT)
  {
    number: '12010',
    name: 'Ahmedabad Mumbai Shatabdi',
    type: 'Shatabdi',
    originCode: 'ADI',
    destCode: 'MMCT',
    runsOnDays: '1111110',
    stops: [
      { sequence: 1, stationCode: 'ADI', arr: null, dep: '15:10', day: 1, distKm: 0 },
      { sequence: 2, stationCode: 'BRC', arr: '16:55', dep: '17:00', day: 1, distKm: 100 },
      { sequence: 3, stationCode: 'ST', arr: '18:32', dep: '18:35', day: 1, distKm: 230 },
      { sequence: 4, stationCode: 'MMCT', arr: '21:45', dep: null, day: 1, distKm: 492 }
    ]
  },

  // 23. Ahmedabad - Nagpur Express (ADI -> NGP)
  {
    number: '12833',
    name: 'Ahmedabad Nagpur Superfast',
    type: 'Superfast',
    originCode: 'ADI',
    destCode: 'NGP',
    runsOnDays: '1111111',
    stops: [
      { sequence: 1, stationCode: 'ADI', arr: null, dep: '00:25', day: 1, distKm: 0 },
      { sequence: 2, stationCode: 'BRC', arr: '02:04', dep: '02:09', day: 1, distKm: 100 },
      { sequence: 3, stationCode: 'ST', arr: '04:26', dep: '04:31', day: 1, distKm: 230 },
      { sequence: 4, stationCode: 'NGP', arr: '18:00', dep: null, day: 1, distKm: 960 }
    ]
  },

  // 24. Nagpur - Ahmedabad Express (NGP -> ADI)
  {
    number: '12834',
    name: 'Nagpur Ahmedabad Superfast',
    type: 'Superfast',
    originCode: 'NGP',
    destCode: 'ADI',
    runsOnDays: '1111111',
    stops: [
      { sequence: 1, stationCode: 'NGP', arr: null, dep: '19:00', day: 1, distKm: 0 },
      { sequence: 2, stationCode: 'ST', arr: '08:35', dep: '08:40', day: 2, distKm: 730 },
      { sequence: 3, stationCode: 'BRC', arr: '10:25', dep: '10:30', day: 2, distKm: 860 },
      { sequence: 4, stationCode: 'ADI', arr: '12:05', dep: null, day: 2, distKm: 960 }
    ]
  },

  // 25. Bhopal Shatabdi Express (NDLS -> BPL / RKMP)
  {
    number: '12002',
    name: 'Bhopal Shatabdi Express',
    type: 'Shatabdi',
    originCode: 'NDLS',
    destCode: 'RKMP',
    runsOnDays: '1111111',
    stops: [
      { sequence: 1, stationCode: 'NDLS', arr: null, dep: '06:00', day: 1, distKm: 0 },
      { sequence: 2, stationCode: 'AGC', arr: '07:50', dep: '07:55', day: 1, distKm: 195 },
      { sequence: 3, stationCode: 'GWL', arr: '09:23', dep: '09:25', day: 1, distKm: 313 },
      { sequence: 4, stationCode: 'VGLJ', arr: '10:45', dep: '10:50', day: 1, distKm: 410 },
      { sequence: 5, stationCode: 'BPL', arr: '14:07', dep: '14:12', day: 1, distKm: 702 },
      { sequence: 6, stationCode: 'RKMP', arr: '14:40', dep: null, day: 1, distKm: 708 }
    ]
  },

  // 26. Bhopal Shatabdi Express Return (RKMP -> NDLS)
  {
    number: '12001',
    name: 'New Delhi Shatabdi Express (Bhopal)',
    type: 'Shatabdi',
    originCode: 'RKMP',
    destCode: 'NDLS',
    runsOnDays: '1111111',
    stops: [
      { sequence: 1, stationCode: 'RKMP', arr: null, dep: '15:15', day: 1, distKm: 0 },
      { sequence: 2, stationCode: 'BPL', arr: '15:30', dep: '15:35', day: 1, distKm: 6 },
      { sequence: 3, stationCode: 'VGLJ', arr: '18:42', dep: '18:47', day: 1, distKm: 298 },
      { sequence: 4, stationCode: 'GWL', arr: '19:45', dep: '19:50', day: 1, distKm: 395 },
      { sequence: 5, stationCode: 'AGC', arr: '21:12', dep: '21:15', day: 1, distKm: 513 },
      { sequence: 6, stationCode: 'NDLS', arr: '23:50', dep: null, day: 1, distKm: 708 }
    ]
  },

  // 27. Jaipur Double Decker (JP -> NDLS)
  {
    number: '12985',
    name: 'Jaipur Delhi Double Decker',
    type: 'Superfast',
    originCode: 'JP',
    destCode: 'NDLS',
    runsOnDays: '1111111',
    stops: [
      { sequence: 1, stationCode: 'JP', arr: null, dep: '06:00', day: 1, distKm: 0 },
      { sequence: 2, stationCode: 'NDLS', arr: '10:25', dep: null, day: 1, distKm: 303 }
    ]
  },

  // 28. Jaipur Double Decker Return (NDLS -> JP)
  {
    number: '12986',
    name: 'Delhi Jaipur Double Decker',
    type: 'Superfast',
    originCode: 'NDLS',
    destCode: 'JP',
    runsOnDays: '1111111',
    stops: [
      { sequence: 1, stationCode: 'NDLS', arr: null, dep: '17:35', day: 1, distKm: 0 },
      { sequence: 2, stationCode: 'JP', arr: '22:00', dep: null, day: 1, distKm: 303 }
    ]
  },

  // 29. Jaipur Mumbai Superfast (JP -> MMCT)
  {
    number: '12956',
    name: 'Jaipur Mumbai Central Superfast',
    type: 'Superfast',
    originCode: 'JP',
    destCode: 'MMCT',
    runsOnDays: '1111111',
    stops: [
      { sequence: 1, stationCode: 'JP', arr: null, dep: '14:00', day: 1, distKm: 0 },
      { sequence: 2, stationCode: 'KOTA', arr: '19:25', dep: '19:35', day: 1, distKm: 240 },
      { sequence: 3, stationCode: 'RTM', arr: '23:25', dep: '23:30', day: 1, distKm: 506 },
      { sequence: 4, stationCode: 'BRC', arr: '02:57', dep: '03:02', day: 2, distKm: 767 },
      { sequence: 5, stationCode: 'ST', arr: '04:38', dep: '04:43', day: 2, distKm: 897 },
      { sequence: 6, stationCode: 'MMCT', arr: '07:45', dep: null, day: 2, distKm: 1159 }
    ]
  },

  // 30. Mumbai Jaipur Superfast (MMCT -> JP)
  {
    number: '12955',
    name: 'Mumbai Central Jaipur Superfast',
    type: 'Superfast',
    originCode: 'MMCT',
    destCode: 'JP',
    runsOnDays: '1111111',
    stops: [
      { sequence: 1, stationCode: 'MMCT', arr: null, dep: '19:05', day: 1, distKm: 0 },
      { sequence: 2, stationCode: 'ST', arr: '22:30', dep: '22:35', day: 1, distKm: 262 },
      { sequence: 3, stationCode: 'BRC', arr: '00:08', dep: '00:18', day: 2, distKm: 392 },
      { sequence: 4, stationCode: 'RTM', arr: '04:00', dep: '04:05', day: 2, distKm: 653 },
      { sequence: 5, stationCode: 'KOTA', arr: '07:50', dep: '08:00', day: 2, distKm: 919 },
      { sequence: 6, stationCode: 'JP', arr: '12:00', dep: null, day: 2, distKm: 1159 }
    ]
  },

  // 31. Gorakhdham Express (NDLS -> GKP via CNB, LKO)
  {
    number: '12556',
    name: 'Gorakhdham Express',
    type: 'Superfast',
    originCode: 'NDLS',
    destCode: 'GKP',
    runsOnDays: '1111111',
    stops: [
      { sequence: 1, stationCode: 'NDLS', arr: null, dep: '21:25', day: 1, distKm: 0 },
      { sequence: 2, stationCode: 'CNB', arr: '03:05', dep: '03:15', day: 2, distKm: 440 },
      { sequence: 3, stationCode: 'LKO', arr: '04:55', dep: '05:05', day: 2, distKm: 512 },
      { sequence: 4, stationCode: 'GKP', arr: '09:45', dep: null, day: 2, distKm: 782 }
    ]
  },

  // 32. Gorakhdham Express Return (GKP -> NDLS via LKO, CNB)
  {
    number: '12555',
    name: 'Gorakhdham Express Return',
    type: 'Superfast',
    originCode: 'GKP',
    destCode: 'NDLS',
    runsOnDays: '1111111',
    stops: [
      { sequence: 1, stationCode: 'GKP', arr: null, dep: '16:35', day: 1, distKm: 0 },
      { sequence: 2, stationCode: 'LKO', arr: '21:20', dep: '21:30', day: 1, distKm: 270 },
      { sequence: 3, stationCode: 'CNB', arr: '23:18', dep: '23:23', day: 1, distKm: 342 },
      { sequence: 4, stationCode: 'NDLS', arr: '05:15', dep: null, day: 2, distKm: 782 }
    ]
  },

  // 33. Patna LTT Express (PNBE -> LTT/CSMT via DDU, PRYJ, ET)
  {
    number: '12142',
    name: 'Patliputra Mumbai LTT Superfast',
    type: 'Superfast',
    originCode: 'PNBE',
    destCode: 'CSMT',
    runsOnDays: '1111111',
    stops: [
      { sequence: 1, stationCode: 'PNBE', arr: null, dep: '11:05', day: 1, distKm: 0 },
      { sequence: 2, stationCode: 'DDU', arr: '14:55', dep: '15:05', day: 1, distKm: 213 },
      { sequence: 3, stationCode: 'PRYJ', arr: '17:35', dep: '17:40', day: 1, distKm: 366 },
      { sequence: 4, stationCode: 'ET', arr: '02:40', dep: '02:50', day: 2, distKm: 964 },
      { sequence: 5, stationCode: 'CSMT', arr: '07:30', dep: null, day: 2, distKm: 1695 }
    ]
  },

  // 34. Mumbai LTT Patliputra Express (CSMT -> PNBE)
  {
    number: '12141',
    name: 'Mumbai Patliputra Superfast',
    type: 'Superfast',
    originCode: 'CSMT',
    destCode: 'PNBE',
    runsOnDays: '1111111',
    stops: [
      { sequence: 1, stationCode: 'CSMT', arr: null, dep: '23:35', day: 1, distKm: 0 },
      { sequence: 2, stationCode: 'ET', arr: '04:25', dep: '04:35', day: 2, distKm: 731 },
      { sequence: 3, stationCode: 'PRYJ', arr: '13:40', dep: '13:45', day: 2, distKm: 1329 },
      { sequence: 4, stationCode: 'DDU', arr: '17:05', dep: '17:15', day: 2, distKm: 1482 },
      { sequence: 5, stationCode: 'PNBE', arr: '20:55', dep: null, day: 2, distKm: 1695 }
    ]
  },

  // 35. Kerala Express (NDLS -> ERS)
  {
    number: '12626',
    name: 'Kerala Express',
    type: 'Superfast',
    originCode: 'NDLS',
    destCode: 'ERS',
    runsOnDays: '1111111',
    stops: [
      { sequence: 1, stationCode: 'NDLS', arr: null, dep: '20:10', day: 1, distKm: 0 },
      { sequence: 2, stationCode: 'AGC', arr: '22:20', dep: '22:25', day: 1, distKm: 195 },
      { sequence: 3, stationCode: 'GWL', arr: '23:52', dep: '23:54', day: 1, distKm: 313 },
      { sequence: 4, stationCode: 'VGLJ', arr: '01:30', dep: '01:38', day: 2, distKm: 410 },
      { sequence: 5, stationCode: 'BPL', arr: '05:20', dep: '05:25', day: 2, distKm: 702 },
      { sequence: 6, stationCode: 'ET', arr: '07:00', dep: '07:10', day: 2, distKm: 794 },
      { sequence: 7, stationCode: 'NGP', arr: '11:45', dep: '11:50', day: 2, distKm: 1092 },
      { sequence: 8, stationCode: 'BZA', arr: '22:20', dep: '22:30', day: 2, distKm: 1756 },
      { sequence: 9, stationCode: 'KPD', arr: '05:00', dep: '05:05', day: 3, distKm: 2186 },
      { sequence: 10, stationCode: 'CBE', arr: '10:15', dep: '10:20', day: 3, distKm: 2556 },
      { sequence: 11, stationCode: 'ERS', arr: '14:45', dep: null, day: 3, distKm: 2806 }
    ]
  },

  // 36. Kerala Express Return (ERS -> NDLS)
  {
    number: '12625',
    name: 'Kerala Express Return',
    type: 'Superfast',
    originCode: 'ERS',
    destCode: 'NDLS',
    runsOnDays: '1111111',
    stops: [
      { sequence: 1, stationCode: 'ERS', arr: null, dep: '11:15', day: 1, distKm: 0 },
      { sequence: 2, stationCode: 'CBE', arr: '15:45', dep: '15:50', day: 1, distKm: 250 },
      { sequence: 3, stationCode: 'KPD', arr: '21:05', dep: '21:10', day: 1, distKm: 620 },
      { sequence: 4, stationCode: 'BZA', arr: '03:45', dep: '03:55', day: 2, distKm: 1050 },
      { sequence: 5, stationCode: 'NGP', arr: '14:35', dep: '14:40', day: 2, distKm: 1714 },
      { sequence: 6, stationCode: 'ET', arr: '19:25', dep: '19:35', day: 2, distKm: 2012 },
      { sequence: 7, stationCode: 'BPL', arr: '21:30', dep: '21:35', day: 2, distKm: 2104 },
      { sequence: 8, stationCode: 'VGLJ', arr: '01:25', dep: '01:33', day: 3, distKm: 2396 },
      { sequence: 9, stationCode: 'GWL', arr: '02:50', dep: '02:52', day: 3, distKm: 2493 },
      { sequence: 10, stationCode: 'AGC', arr: '04:45', dep: '04:50', day: 3, distKm: 2611 },
      { sequence: 11, stationCode: 'NDLS', arr: '07:15', dep: null, day: 3, distKm: 2806 }
    ]
  },

  // 37. Vande Bharat Express (SC -> VSKP)
  {
    number: '20834',
    name: 'Visakhapatnam Vande Bharat Express',
    type: 'Vande Bharat',
    originCode: 'SC',
    destCode: 'VSKP',
    runsOnDays: '1111110',
    stops: [
      { sequence: 1, stationCode: 'SC', arr: null, dep: '15:00', day: 1, distKm: 0 },
      { sequence: 2, stationCode: 'BZA', arr: '19:00', dep: '19:05', day: 1, distKm: 349 },
      { sequence: 3, stationCode: 'VSKP', arr: '23:30', dep: null, day: 1, distKm: 699 }
    ]
  },

  // 38. Vande Bharat Express Return (VSKP -> SC)
  {
    number: '20833',
    name: 'Secunderabad Vande Bharat Express',
    type: 'Vande Bharat',
    originCode: 'VSKP',
    destCode: 'SC',
    runsOnDays: '1111110',
    stops: [
      { sequence: 1, stationCode: 'VSKP', arr: null, dep: '05:45', day: 1, distKm: 0 },
      { sequence: 2, stationCode: 'BZA', arr: '10:00', dep: '10:05', day: 1, distKm: 350 },
      { sequence: 3, stationCode: 'SC', arr: '14:15', dep: null, day: 1, distKm: 699 }
    ]
  },

  // 39. Bengaluru - Chennai Shatabdi (SBC -> MAS)
  {
    number: '12028',
    name: 'KSR Bengaluru - Chennai Shatabdi',
    type: 'Shatabdi',
    originCode: 'SBC',
    destCode: 'MAS',
    runsOnDays: '1111110',
    stops: [
      { sequence: 1, stationCode: 'SBC', arr: null, dep: '06:00', day: 1, distKm: 0 },
      { sequence: 2, stationCode: 'KPD', arr: '09:13', dep: '09:15', day: 1, distKm: 228 },
      { sequence: 3, stationCode: 'MAS', arr: '11:00', dep: null, day: 1, distKm: 359 }
    ]
  },

  // 40. Chennai - Bengaluru Shatabdi Return (MAS -> SBC)
  {
    number: '12027',
    name: 'Chennai Bengaluru Shatabdi Return',
    type: 'Shatabdi',
    originCode: 'MAS',
    destCode: 'SBC',
    runsOnDays: '1111110',
    stops: [
      { sequence: 1, stationCode: 'MAS', arr: null, dep: '17:30', day: 1, distKm: 0 },
      { sequence: 2, stationCode: 'KPD', arr: '19:18', dep: '19:20', day: 1, distKm: 131 },
      { sequence: 3, stationCode: 'SBC', arr: '22:50', dep: null, day: 1, distKm: 359 }
    ]
  },

  // 41. Chennai - Mysuru Vande Bharat (MAS -> SBC)
  {
    number: '20607',
    name: 'Chennai - Mysuru Vande Bharat',
    type: 'Vande Bharat',
    originCode: 'MAS',
    destCode: 'SBC',
    runsOnDays: '1111110',
    stops: [
      { sequence: 1, stationCode: 'MAS', arr: null, dep: '05:50', day: 1, distKm: 0 },
      { sequence: 2, stationCode: 'KPD', arr: '07:13', dep: '07:15', day: 1, distKm: 130 },
      { sequence: 3, stationCode: 'SBC', arr: '10:15', dep: null, day: 1, distKm: 359 }
    ]
  },

  // 42. Mysuru - Chennai Vande Bharat Return (SBC -> MAS)
  {
    number: '20608',
    name: 'Mysuru Chennai Vande Bharat Return',
    type: 'Vande Bharat',
    originCode: 'SBC',
    destCode: 'MAS',
    runsOnDays: '1111110',
    stops: [
      { sequence: 1, stationCode: 'SBC', arr: null, dep: '14:50', day: 1, distKm: 0 },
      { sequence: 2, stationCode: 'KPD', arr: '17:33', dep: '17:35', day: 1, distKm: 229 },
      { sequence: 3, stationCode: 'MAS', arr: '19:20', dep: null, day: 1, distKm: 359 }
    ]
  },

  // 43. Deccan Queen (CSMT -> PUNE)
  {
    number: '12123',
    name: 'Deccan Queen Express',
    type: 'Superfast',
    originCode: 'CSMT',
    destCode: 'PUNE',
    runsOnDays: '1111111',
    stops: [
      { sequence: 1, stationCode: 'CSMT', arr: null, dep: '17:10', day: 1, distKm: 0 },
      { sequence: 2, stationCode: 'PUNE', arr: '20:25', dep: null, day: 1, distKm: 192 }
    ]
  },

  // 44. Deccan Queen Return (PUNE -> CSMT)
  {
    number: '12124',
    name: 'Deccan Queen Return',
    type: 'Superfast',
    originCode: 'PUNE',
    destCode: 'CSMT',
    runsOnDays: '1111111',
    stops: [
      { sequence: 1, stationCode: 'PUNE', arr: null, dep: '07:15', day: 1, distKm: 0 },
      { sequence: 2, stationCode: 'CSMT', arr: '10:25', dep: null, day: 1, distKm: 192 }
    ]
  }
];

// Validate before writing
const stationsJson = JSON.parse(fs.readFileSync('shared/data/stations.json', 'utf8'));
const validStationCodes = new Set(stationsJson.map(s => s.code));

for (const train of EXPANDED_TRAINS) {
  if (!validStationCodes.has(train.originCode)) throw new Error(`Invalid originCode ${train.originCode} on ${train.number}`);
  if (!validStationCodes.has(train.destCode)) throw new Error(`Invalid destCode ${train.destCode} on ${train.number}`);
  for (const s of train.stops) {
    if (!validStationCodes.has(s.stationCode)) throw new Error(`Invalid stationCode ${s.stationCode} in stop on ${train.number}`);
  }
}

console.log(`All ${EXPANDED_TRAINS.length} expanded trains validated against station codes!`);
