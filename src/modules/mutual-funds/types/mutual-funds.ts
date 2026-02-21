export interface MutualFundScheme {
  schemeCode: number;
  schemeName: string;
  fundHouse?: string;
  schemeType?: string;
  schemeCategory?: string;
  isinGrowth?: string | null;
  isinDivReinvestment?: string | null;
  nav?: string;
  date?: string;
  details?: MutualFundSchemeDetails | null;
}

export interface MutualFundListResponse {
  schemes: MutualFundScheme[];
  total: number;
}

export interface SearchResult {
  schemeCode: number;
  schemeName: string;
}

export interface NAVData {
  date: string;
  nav: string;
}

export interface SchemeHistoryResponse {
  meta: {
    schemeCode: number;
    schemeName: string;
    fundHouse: string;
    schemeType?: string;
    schemeCategory?: string;
    isinGrowth?: string;
    isinDivReinvestment?: string;
  };
  data: NAVData[];
}

export interface ReturnsMetrics {
  timeframeLabel: string;
  days: number;
  startNav: number;
  endNav: number;
  absoluteReturn: number;
  percentageReturn: number;
  cagr: number;
  xirr?: number;
  isAvailable: boolean;
}
// Track SIP amount modifications with effective dates
export interface SIPAmountModification {
  effectiveDate: string; // Date from which new amount applies
  amount: number; // New SIP amount from this date
}

// New types for user investments
export interface UserInvestment {
  id: string;
  schemeCode: number;
  investmentType: "lumpsum" | "sip";
  startDate: string;
  amount: number;
  sipAmount?: number; // For SIP: monthly investment amount (original amount)
  sipMonthlyDate?: number; // For SIP: day of month (1-31) when SIP is deducted
  sipEndDate?: string; // For SIP: end date (if cancelled) - if not provided, SIP is active
  sipAmountModifications?: SIPAmountModification[]; // Track all SIP amount changes with effective dates
}

export interface UserInvestmentData {
  schemeCode: number;
  investments: UserInvestment[];
}

export interface InvestmentMetrics {
  totalInvested: number;
  totalCurrentValue: number;
  absoluteGain: number;
  percentageReturn: number;
  xirr?: number;
  cagr?: number;
  numberOfFunds?: number;
  units?: number;
  oneDayChange?: {
    absoluteChange: number;
    percentageChange: number;
  };
}

export interface InvestmentInstallment {
  id: string;
  type: "lumpsum" | "sip-installment";
  originalStartDate: string;
  installmentDate: string;
  amount: number;
  nav: number;
  units: number;
  stampDuty: number;
  isCancelled?: boolean;
  cancelledOn?: string;
}

export interface FundInvestmentDetails {
  scheme: MutualFundScheme;
  installments: InvestmentInstallment[];
  summary: InvestmentMetrics;
}

export interface MutualFundSchemeDetails {
  code: string;
  name: string;
  shortName: string;
  lumpAvailable: string;
  sipAvailable: string;
  lumpMin: number;
  lumpMinAdditional: number;
  lumpMax: number;
  lumpMultiplier: number;
  sipMin: number;
  sipMax: number;
  sipMultiplier: number;
  sipDates: any[];
  upsizecodeSipDates: any[];
  redemptionAllowed: string;
  redemptionAmountMultiple: number;
  redemptionAmountMinimum: number;
  redemptionQuantityMultiple: number;
  redemptionQuantityMinimum: number;
  category: string;
  lockInPeriod: number;
  sipMaximumGap: number;

  fundHouse: string;
  fundName: string;
  shortCode: string;
  detailInfo: string;
  ISIN: string;
  direct: string;
  switchAllowed: string;
  stpFlag: string;
  swpFlag: string;
  sips: Sip[];
  instant: string;
  reinvestment: string;
  tags: any[];
  slug: string;
  channelPartnerCode: string;
  taxPeriod: number;

  /** Current NAV */
  nav: NavInfo;
  /** Previous NAV */
  lastNav: NavInfo;

  jan31Nav: number;
  volatility: number;
  returns: ReturnsInfo;

  startDate: string;
  faceValue: string;
  fundType: string;
  fundCategory: string;
  plan: string;
  expenseRatio: string;
  expenseRatioDate: string;
  fundManager: string;
  crisilRating: string;
  investmentObjective: string;
  portfolioTurnover: string;
  maturityType: string;
  aum: number;
  comparison: CompareFunds[];
}

/** SIP definition */
export interface Sip {
  sipFrequency: string;
  sipDates: any[];
  sipMinimumGap: string;
  sipMaximumGap: string;
}

/** NAV container */
export interface NavInfo {
  nav: number;
  date: string;
}

/** Returns container */
export interface ReturnsInfo {
  week1: number;
  year1: number;
  year3: number;
  year5: number;
  inception: number;
  date: string;
}

export interface CompareFunds {
  name: string;
  shortName: string;
  code: string;
  slug?: string;
  "1y"?: number;
  "3y": number;
  "5y"?: number;
  inception?: number;
  volatility?: number;
  expenseRatio?: number;
  aum?: number;
  infoRatio?: number;
}

export interface FundWithInvestments {
  scheme: MutualFundScheme;
  investmentData: UserInvestmentData;
}

export interface CalculatedReturnsData {
  id?: number; // auto-incremented ID
  schemeCode: number;
  date: string; // Date when calculation was done
  overallReturns: InvestmentMetrics;
  fyReturns: Array<{
    fy: string; // e.g., "2020-21"
    startDate: string;
    endDate: string;
    totalInvested: number;
    currentValue: number;
    absoluteGain: number;
    percentageReturn: number;
    xirr?: number;
    cagr?: number;
    oneDayChange?: {
      absoluteChange: number;
      percentageChange: number;
    };
  }>;
  portfolioLevel?: boolean; // true for portfolio-level calculations
}
