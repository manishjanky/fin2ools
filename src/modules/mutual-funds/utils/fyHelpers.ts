import moment from 'moment';

/**
 * Financial year utilities for India
 * FY runs from April 1 to March 31
 * e.g., FY 2023-24 runs from 01-04-2023 to 31-03-2024
 */

export interface FiscalYearPeriod {
  fy: string; // e.g., "2023-24"
  startDate: string; // DD-MM-YYYY
  endDate: string; // DD-MM-YYYY
}

/**
 * Get fiscal year from a date
 * @param dateStr Date in DD-MM-YYYY format
 * @returns Fiscal year string (e.g., "2023-24")
 */
export function getFiscalYear(dateStr: string): string {
  const [day, month, year] = dateStr.split('-').map(Number);
  const date = moment([year, month - 1, day]); // moment uses 0-indexed months
  
  const fiscalYear = date.month() >= 3 // April is month 3 (0-indexed)
    ? date.year()
    : date.year() - 1;
  
  return `${fiscalYear}-${String(fiscalYear + 1).slice(2)}`;
}

/**
 * Get start date of a fiscal year
 * @param fy Fiscal year string (e.g., "2023-24")
 * @returns Start date in DD-MM-YYYY format
 */
export function getFYStartDate(fy: string): string {
  const startYear = parseInt(fy.split('-')[0]);
  return `01-04-${startYear}`;
}

/**
 * Get end date of a fiscal year
 * @param fy Fiscal year string (e.g., "2023-24")
 * @returns End date in DD-MM-YYYY format
 */
export function getFYEndDate(fy: string): string {
  const endYear = parseInt(fy.split('-')[0]) + 1;
  return `31-03-${endYear}`;
}

/**
 * Get all fiscal years from a start date to today
 * @param startDateStr Start date in DD-MM-YYYY format
 * @returns Array of fiscal year periods
 */
export function getFiscalYearsInRange(startDateStr: string): FiscalYearPeriod[] {
  const today = moment();

  const fiscalYears: FiscalYearPeriod[] = [];
  let currentFY = getFiscalYear(startDateStr);

  // Generate fiscal years from start date to today
  while (currentFY <= getFiscalYear(today.format('DD-MM-YYYY'))) {
    const fyStart = getFYStartDate(currentFY);
    const fyEnd = getFYEndDate(currentFY);
    
    // For the first FY, start from the actual investment date
    let effectiveStart = fyStart;
    if (currentFY === getFiscalYear(startDateStr)) {
      effectiveStart = startDateStr;
    }

    // For the current/last FY, end at today
    let effectiveEnd = fyEnd;
    const todayFY = getFiscalYear(today.format('DD-MM-YYYY'));
    if (currentFY === todayFY) {
      effectiveEnd = today.format('DD-MM-YYYY');
    }

    fiscalYears.push({
      fy: currentFY,
      startDate: effectiveStart,
      endDate: effectiveEnd,
    });

    // Move to next fiscal year
    const [currentYear, _] = currentFY.split('-').map(Number);
    currentFY = `${currentYear + 1}-${String(currentYear + 2).slice(2)}`;
  }

  return fiscalYears;
}

/**
 * Check if a date falls within a fiscal year
 * @param dateStr Date in DD-MM-YYYY format
 * @param fy Fiscal year string (e.g., "2023-24")
 * @returns true if date is in the fiscal year
 */
export function isDateInFY(dateStr: string, fy: string): boolean {
  const [day, month, year] = dateStr.split('-').map(Number);
  const date = moment([year, month - 1, day]);
  
  const startDate = moment(getFYStartDate(fy), 'DD-MM-YYYY');
  const endDate = moment(getFYEndDate(fy), 'DD-MM-YYYY');
  
  return date.isBetween(startDate, endDate, undefined, '[]');
}

/**
 * Get the end date for calculations in a fiscal year
 * For current fiscal year, use today
 * For past fiscal years, use the FY end date
 * @param fy Fiscal year string
 * @returns Date in DD-MM-YYYY format
 */
export function getEffectiveEndDateForFY(fy: string): string {
  const todayFY = getFiscalYear(moment().format('DD-MM-YYYY'));
  return todayFY === fy 
    ? moment().format('DD-MM-YYYY')
    : getFYEndDate(fy);
}
