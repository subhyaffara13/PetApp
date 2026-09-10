export interface PlaceOpenStatusInput {
  openingHours?: string;
  isOpenNow?: boolean;
  isDeclaredOpen?: boolean;
  portalStatusOverride?: 'open' | 'closed' | 'schedule';
  capacityStatus?: string;
  isClaimed?: boolean;
}

const DAY_MAP: Record<string, number> = {
  su: 0,
  sun: 0,
  sunday: 0,
  mo: 1,
  mon: 1,
  monday: 1,
  tu: 2,
  tue: 2,
  tuesday: 2,
  we: 3,
  wed: 3,
  wednesday: 3,
  th: 4,
  thu: 4,
  thursday: 4,
  fr: 5,
  fri: 5,
  friday: 5,
  sa: 6,
  sat: 6,
  saturday: 6,
};

export function getLocalTimeDetails(date = new Date()): { day: number; minutes: number } {
  return {
    day: date.getDay(),
    minutes: date.getHours() * 60 + date.getMinutes(),
  };
}

function parseDaysFromSegment(segmentText: string): number[] | null {
  const lower = segmentText.toLowerCase();

  if (lower.includes('daily') || lower.includes('everyday') || lower.includes('all days')) {
    return [0, 1, 2, 3, 4, 5, 6];
  }

  const rangeMatch = lower.match(
    /\b(sun(?:day)?|mon(?:day)?|tue(?:sday)?|wed(?:nesday)?|thu(?:rsday)?|fri(?:day)?|sat(?:urday)?|su|mo|tu|we|th|fr|sa)\s*(?:[-–—~]|to)\s*(sun(?:day)?|mon(?:day)?|tue(?:sday)?|wed(?:nesday)?|thu(?:rsday)?|fri(?:day)?|sat(?:urday)?|su|mo|tu|we|th|fr|sa)\b/,
  );

  if (rangeMatch) {
    const startDay = DAY_MAP[rangeMatch[1]];
    const endDay = DAY_MAP[rangeMatch[2]];

    if (startDay !== undefined && endDay !== undefined) {
      const days: number[] = [];
      let curr = startDay;
      while (true) {
        days.push(curr);
        if (curr === endDay) break;
        curr = (curr + 1) % 7;
      }
      return days;
    }
  }

  const singleMatches = lower.match(
    /\b(sun(?:day)?|mon(?:day)?|tue(?:sday)?|wed(?:nesday)?|thu(?:rsday)?|fri(?:day)?|sat(?:urday)?)\b/g,
  );

  if (singleMatches && singleMatches.length > 0) {
    const days: number[] = [];
    for (const match of singleMatches) {
      const d = DAY_MAP[match];
      if (d !== undefined && !days.includes(d)) {
        days.push(d);
      }
    }
    return days;
  }

  return null;
}

export function isWithinWorkingHours(
  openingHours?: string,
  referenceDate = new Date(),
): boolean {
  if (!openingHours || !openingHours.trim()) {
    return false;
  }

  const text = openingHours.trim();
  const lower = text.toLowerCase();

  if (
    lower.includes('24/7') ||
    lower.includes('24 hours') ||
    lower.includes('24h') ||
    lower.includes('open 24') ||
    lower.includes('critical care') ||
    lower.includes('live on-duty ambulatory') ||
    lower.includes('rapid ambulatory house calls') ||
    lower.includes('emergency surgery') ||
    lower.includes('emergency triage')
  ) {
    return true;
  }

  const { day: currentDay, minutes: currentMinutes } = getLocalTimeDetails(referenceDate);
  const segments = text.split(/[·;|\n]+/).map((s) => s.trim()).filter(Boolean);

  let parsedAnyDay = false;

  for (const segment of segments) {
    const targetDays = parseDaysFromSegment(segment);

    if (targetDays && targetDays.length > 0) {
      parsedAnyDay = true;
      if (!targetDays.includes(currentDay)) {
        continue;
      }
    }

    const timeRegex = /(\d{1,2}):(\d{2})\s*(?:[-–—~]|to)\s*(\d{1,2}):(\d{2})/g;
    let match: RegExpExecArray | null;

    while ((match = timeRegex.exec(segment)) !== null) {
      const startH = parseInt(match[1], 10);
      const startM = parseInt(match[2], 10);
      const endH = parseInt(match[3], 10);
      const endM = parseInt(match[4], 10);

      const startTotal = startH * 60 + startM;
      const endTotal = endH * 60 + endM;

      if (endTotal > startTotal) {
        if (currentMinutes >= startTotal && currentMinutes < endTotal) {
          return true;
        }
      } else {
        if (currentMinutes >= startTotal || currentMinutes < endTotal) {
          return true;
        }
      }
    }
  }

  if (parsedAnyDay) {
    return false;
  }

  if (lower.includes('unavailable') || lower.includes('check open hours')) {
    return false;
  }

  return true;
}

export function isPlaceOpenNow(
  place: PlaceOpenStatusInput,
  referenceDate = new Date(),
): boolean {
  if (
    place.portalStatusOverride === 'open' ||
    place.isDeclaredOpen === true
  ) {
    return true;
  }

  if (
    place.portalStatusOverride === 'closed' ||
    place.isDeclaredOpen === false ||
    place.capacityStatus === 'at_capacity'
  ) {
    return false;
  }

  if (place.openingHours) {
    return isWithinWorkingHours(place.openingHours, referenceDate);
  }

  return place.isOpenNow ?? true;
}
