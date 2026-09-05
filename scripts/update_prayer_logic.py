from pathlib import Path

path = Path('/home/ubuntu/noor-work/src/data/prayerCities.ts')
text = path.read_text()
marker = '// Calculation Method ID for Aladhan API'
prefix = text.split(marker, 1)[0]
tail = r'''// Calculation Method ID for Aladhan API
export const METHOD_IDS: { [key: string]: number } = {
  UmmAlQura: 4,
  MWL: 3,
  ISNA: 2,
  Egypt: 5,
  GulfRegion: 8,
};

const BAHRAIN_EAST = { latitude: 26.27, longitude: 50.68 };
const BAHRAIN_WEST = { latitude: 26.22, longitude: 50.44 };
const BAHRAIN_TIMEZONE_OFFSET_HOURS = 3;

const degreesToRadians = (degrees: number) => (degrees * Math.PI) / 180;
const radiansToDegrees = (radians: number) => (radians * 180) / Math.PI;

const normaliseMinutes = (minutes: number) => {
  const rounded = Math.round(minutes);
  return ((rounded % 1440) + 1440) % 1440;
};

const formatMinutes = (minutes: number) => {
  const normalised = normaliseMinutes(minutes);
  const hours = Math.floor(normalised / 60);
  const mins = normalised % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

/**
 * Solar calculation used for the Bahrain official calendar profile.
 * The published profile uses the Zubarah/Bahrain calendar approach:
 * eastern Bahrain for Fajr/Sunrise, western Bahrain for the remaining
 * solar events, one minute adjustments for the published meridian rules,
 * and Isha as Maghrib + 90 minutes.
 */
function calculateBahrainOfficialTimes(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const dayOfYear = Math.floor(
    (Date.UTC(year, month, day) - Date.UTC(year, 0, 0)) / 86400000,
  );
  const gamma = (2 * Math.PI / 365) * (dayOfYear - 1);
  const equationOfTime = 229.18 * (
    0.000075 +
    0.001868 * Math.cos(gamma) -
    0.032077 * Math.sin(gamma) -
    0.014615 * Math.cos(2 * gamma) -
    0.040849 * Math.sin(2 * gamma)
  );
  const declination =
    0.006918 -
    0.399912 * Math.cos(gamma) +
    0.070257 * Math.sin(gamma) -
    0.006758 * Math.cos(2 * gamma) +
    0.000907 * Math.sin(2 * gamma) -
    0.002697 * Math.cos(3 * gamma) +
    0.00148 * Math.sin(3 * gamma);

  const solarNoon = (longitude: number) =>
    720 - 4 * longitude - equationOfTime + BAHRAIN_TIMEZONE_OFFSET_HOURS * 60;

  const hourAngle = (latitude: number, altitudeDegrees: number) => {
    const latitudeRad = degreesToRadians(latitude);
    const altitudeRad = degreesToRadians(altitudeDegrees);
    const cosine = (
      Math.sin(altitudeRad) - Math.sin(latitudeRad) * Math.sin(declination)
    ) / (Math.cos(latitudeRad) * Math.cos(declination));
    // Clamp for the rare polar/edge case so a bad floating-point value does
    // not make the whole app fail to render.
    return radiansToDegrees(Math.acos(Math.max(-1, Math.min(1, cosine))));
  };

  const eventPair = (location: { latitude: number; longitude: number }, altitude: number) => {
    const noon = solarNoon(location.longitude);
    const angle = hourAngle(location.latitude, altitude);
    return { sunrise: noon - angle * 4, sunset: noon + angle * 4 };
  };

  const eastSun = eventPair(BAHRAIN_EAST, -0.833);
  const westSun = eventPair(BAHRAIN_WEST, -0.833);
  const eastFajr = solarNoon(BAHRAIN_EAST.longitude) - hourAngle(BAHRAIN_EAST.latitude, -18) * 4;
  const westNoon = solarNoon(BAHRAIN_WEST.longitude);
  const asrAltitude = radiansToDegrees(
    Math.atan(1 / (1 + Math.tan(Math.abs(degreesToRadians(BAHRAIN_WEST.latitude) - declination)))),
  );
  const westAsr = solarNoon(BAHRAIN_WEST.longitude) + hourAngle(BAHRAIN_WEST.latitude, asrAltitude) * 4;
  const maghrib = westSun.sunset + 1;

  return {
    Fajr: formatMinutes(eastFajr),
    Sunrise: formatMinutes(eastSun.sunrise),
    Dhuhr: formatMinutes(westNoon + 1),
    Asr: formatMinutes(westAsr),
    Maghrib: formatMinutes(maghrib),
    Isha: formatMinutes(maghrib + 90),
  };
}

// Helper to find Country & City
export function findCountryAndCity(countryName?: string, cityName?: string) {
  let countryObj = PRAYER_COUNTRIES.find(c => c.ar === countryName || c.en === countryName);

  if (!countryObj) {
    // Search city in all countries if country not explicitly set
    countryObj = PRAYER_COUNTRIES.find(c => c.cities.some(city => city.ar === cityName || city.en === cityName)) || PRAYER_COUNTRIES[0]; // Default Bahrain
  }

  const cityObj = countryObj.cities.find(c => c.ar === cityName || c.en === cityName) || countryObj.cities[0];

  return { country: countryObj, city: cityObj };
}

const formatApiDate = (date: Date) => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  return `${day}-${month}-${date.getFullYear()}`;
};

const getHijriDate = (date: Date) => {
  try {
    return new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch {
    return undefined;
  }
};

// Fetch or calculate accurate timings.
export async function getAccuratePrayerTimes(
  countryName: string = 'مملكة البحرين',
  cityName: string = 'المنامة',
  method: string = 'BahrainOfficial',
  date: Date = new Date(),
) {
  const { country, city } = findCountryAndCity(countryName, cityName);

  // Existing Bahrain users may still have the old GulfRegion value stored;
  // both values intentionally use the official Bahrain profile for Bahrain.
  if (country.code === 'BH' && (method === 'BahrainOfficial' || method === 'GulfRegion')) {
    return {
      source: 'bahrain-official',
      country: country.ar,
      city: city.ar,
      hijriDate: getHijriDate(date),
      times: calculateBahrainOfficialTimes(date),
    };
  }

  const methodId = METHOD_IDS[method] || 4;
  try {
    const datePath = formatApiDate(date);
    const endpoint = `https://api.aladhan.com/v1/timingsByCity/${datePath}?city=${encodeURIComponent(city.en)}&country=${encodeURIComponent(country.en)}&method=${methodId}`;
    const res = await fetch(endpoint);
    if (res.ok) {
      const json = await res.json();
      if (json && json.data && json.data.timings) {
        const t = json.data.timings;
        return {
          source: 'api',
          country: country.ar,
          city: city.ar,
          hijriDate: json.data.date?.hijri ? `${json.data.date.hijri.day} ${json.data.date.hijri.month.ar} ${json.data.date.hijri.year} هـ` : getHijriDate(date),
          times: {
            Fajr: t.Fajr?.substring(0, 5) || city.baseTimes.Fajr,
            Sunrise: t.Sunrise?.substring(0, 5) || city.baseTimes.Sunrise,
            Dhuhr: t.Dhuhr?.substring(0, 5) || city.baseTimes.Dhuhr,
            Asr: t.Asr?.substring(0, 5) || city.baseTimes.Asr,
            Maghrib: t.Maghrib?.substring(0, 5) || city.baseTimes.Maghrib,
            Isha: t.Isha?.substring(0, 5) || city.baseTimes.Isha,
          },
        };
      }
    }
  } catch (err) {
    console.log('Aladhan API offline or unreachable, using seasonal calculation fallback', err);
  }

  // Fallback calculation for non-Bahrain cities when the API is unavailable.
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  const seasonalShift = Math.round(15 * Math.sin((dayOfYear + 80) * 2 * Math.PI / 365));
  const formatAndShift = (timeStr: string, shiftMins: number) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return formatMinutes(hours * 60 + minutes + shiftMins);
  };
  const base = city.baseTimes;
  return {
    source: 'fallback',
    country: country.ar,
    city: city.ar,
    hijriDate: getHijriDate(date),
    times: {
      Fajr: formatAndShift(base.Fajr, seasonalShift),
      Sunrise: formatAndShift(base.Sunrise, seasonalShift - 3),
      Dhuhr: formatAndShift(base.Dhuhr, seasonalShift + 2),
      Asr: formatAndShift(base.Asr, seasonalShift + 5),
      Maghrib: formatAndShift(base.Maghrib, seasonalShift + 2),
      Isha: formatAndShift(base.Isha, seasonalShift + 1),
    },
  };
}
'''
path.write_text(prefix + tail)
print('updated', path)
