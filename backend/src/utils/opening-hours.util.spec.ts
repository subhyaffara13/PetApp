import {
  isWithinWorkingHours,
  isPlaceOpenNow,
  getLocalTimeDetails,
} from './opening-hours.util';

describe('Opening Hours & Place Open Status Utility', () => {
  describe('getLocalTimeDetails', () => {
    it('should extract correct local day and minutes in Asia/Jerusalem', () => {
      // 2026-09-10T02:47:00Z is 05:47:00 in Asia/Jerusalem (UTC+3 daylight time)
      const date = new Date('2026-09-10T02:47:00Z');
      const details = getLocalTimeDetails(date, 'Asia/Jerusalem');
      // Thursday = 4
      expect(details.day).toBe(4);
      // 05:47 = 5 * 60 + 47 = 347
      expect(details.minutes).toBe(347);
    });
  });

  describe('isWithinWorkingHours', () => {
    const batGalimHours = 'Sun–Thu 09:00–18:00 · Fri 09:00–13:00';

    it('should return false for Bat Galim at 05:47 AM on Thursday (before opening)', () => {
      const date = new Date('2026-09-10T02:47:00Z'); // 05:47 in Israel
      const open = isWithinWorkingHours(batGalimHours, date, 'Asia/Jerusalem');
      expect(open).toBe(false);
    });

    it('should return true for Bat Galim at 11:30 AM on Thursday (during working hours)', () => {
      const date = new Date('2026-09-10T08:30:00Z'); // 11:30 in Israel
      const open = isWithinWorkingHours(batGalimHours, date, 'Asia/Jerusalem');
      expect(open).toBe(true);
    });

    it('should return false for Bat Galim at 19:15 PM on Thursday (after working hours)', () => {
      const date = new Date('2026-09-10T16:15:00Z'); // 19:15 in Israel
      const open = isWithinWorkingHours(batGalimHours, date, 'Asia/Jerusalem');
      expect(open).toBe(false);
    });

    it('should return true for Bat Galim at 11:00 AM on Friday', () => {
      const date = new Date('2026-09-11T08:00:00Z'); // Friday 11:00 in Israel
      const open = isWithinWorkingHours(batGalimHours, date, 'Asia/Jerusalem');
      expect(open).toBe(true);
    });

    it('should return false for Bat Galim at 14:00 PM on Friday (after 13:00 closing)', () => {
      const date = new Date('2026-09-11T11:00:00Z'); // Friday 14:00 in Israel
      const open = isWithinWorkingHours(batGalimHours, date, 'Asia/Jerusalem');
      expect(open).toBe(false);
    });

    it('should return false for Bat Galim on Saturday (closed all day)', () => {
      const date = new Date('2026-09-12T09:00:00Z'); // Saturday 12:00 in Israel
      const open = isWithinWorkingHours(batGalimHours, date, 'Asia/Jerusalem');
      expect(open).toBe(false);
    });

    it('should return true for 24/7 ER hospitals at any time', () => {
      const date = new Date('2026-09-10T02:47:00Z'); // 05:47 in Israel
      expect(
        isWithinWorkingHours('Open 24/7 · Critical Care & CT Trauma Center', date),
      ).toBe(true);
      expect(
        isWithinWorkingHours('Open 24 Hours · Emergency Surgery', date),
      ).toBe(true);
      expect(
        isWithinWorkingHours('Live On-Duty Ambulatory Dispatch', date),
      ).toBe(true);
    });

    it('should support split operating hours (e.g. 08:00-11:00, 17:00-19:30)', () => {
      const splitHours = 'Sun–Thu 08:00–11:00, 17:00–19:30 · (054-545-4599)';
      // 09:30 Israel time (during morning slot)
      const morningDate = new Date('2026-09-10T06:30:00Z');
      expect(isWithinWorkingHours(splitHours, morningDate, 'Asia/Jerusalem')).toBe(true);

      // 14:00 Israel time (between slots)
      const midDayDate = new Date('2026-09-10T11:00:00Z');
      expect(isWithinWorkingHours(splitHours, midDayDate, 'Asia/Jerusalem')).toBe(false);

      // 18:00 Israel time (during evening slot)
      const eveningDate = new Date('2026-09-10T15:00:00Z');
      expect(isWithinWorkingHours(splitHours, eveningDate, 'Asia/Jerusalem')).toBe(true);
    });
  });

  describe('isPlaceOpenNow', () => {
    const earlyMorningThursday = new Date('2026-09-10T02:47:00Z'); // 05:47 Israel

    it('should return false for regular clinic outside working hours when not declared in portal', () => {
      const clinic = {
        openingHours: 'Sun–Thu 09:00–18:00 · Fri 09:00–13:00',
        isOpenNow: true, // legacy hardcoded true
      };
      expect(isPlaceOpenNow(clinic, earlyMorningThursday, 'Asia/Jerusalem')).toBe(false);
    });

    it('should return true when declared open through the portal even outside working hours', () => {
      const clinic = {
        openingHours: 'Sun–Thu 09:00–18:00 · Fri 09:00–13:00',
        isOpenNow: true,
        isDeclaredOpen: true, // declared open via portal!
      };
      expect(isPlaceOpenNow(clinic, earlyMorningThursday, 'Asia/Jerusalem')).toBe(true);
    });

    it('should return false when declared closed through portal even during working hours', () => {
      const midDay = new Date('2026-09-10T09:00:00Z'); // 12:00 in Israel
      const clinic = {
        openingHours: 'Sun–Thu 09:00–18:00 · Fri 09:00–13:00',
        isOpenNow: false,
        isDeclaredOpen: false, // declared closed via portal!
      };
      expect(isPlaceOpenNow(clinic, midDay, 'Asia/Jerusalem')).toBe(false);
    });

    it('should return false when capacityStatus is at_capacity / diverting', () => {
      const midDay = new Date('2026-09-10T09:00:00Z');
      const clinic = {
        openingHours: 'Open 24/7 · Critical Care',
        capacityStatus: 'at_capacity',
      };
      expect(isPlaceOpenNow(clinic, midDay, 'Asia/Jerusalem')).toBe(false);
    });
  });
});
