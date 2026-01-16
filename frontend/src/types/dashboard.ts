export interface PaymentDates {
  standard: string;
  california: string;
  max_date: string;
}

export interface MetricsSet {
  total_calls: number;
  completed_sales: number;
  conversion_rate: number;
}

export interface PerformanceData {
  today: MetricsSet;
  this_week: MetricsSet;
  this_month: MetricsSet;
}

export interface NewsItem {
  id: number;
  title: string;
  message: string;
  category: string; // 'INFO', 'WARNING', 'CRITICAL'
  date: string;
}

export interface WorkspaceData {
  agent_name: string;
  role: string;
  payment_dates: PaymentDates;
  performance: PerformanceData;
  news: NewsItem[];
}