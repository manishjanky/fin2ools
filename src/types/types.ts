export interface FYData {
  fyYear: string;
  startBalance: number;
  contribution?: number;
  endBalance: number;
  interestEarned: number;
}

export type DeviceType = "mobile" | "tablet" | "desktop";
