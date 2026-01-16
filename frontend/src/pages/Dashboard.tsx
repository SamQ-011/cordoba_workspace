import { useEffect, useState } from 'react';
import api from '../api/axios';
import type { WorkspaceData } from '../types/dashboard';
import { DateCard } from '../components/dashboard/DateCard';
import { PerformanceSection } from '../components/dashboard/PerformanceSection';
import { NewsFeed } from '../components/dashboard/NewsFeed';
import { Loader2 } from 'lucide-react';

export default function Dashboard() {
  const [data, setData] = useState<WorkspaceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/workspace/information');
        setData(response.data);
      } catch (error) {
        console.error("Error loading dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!data) return <div className="text-red-500">Error loading data.</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      
      {/* 1. Minimal Header */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Workspace
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Welcome back, <span className="font-semibold text-slate-700">{data.agent_name}</span>. Here is your operational summary.
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
            System Active ●
          </span>
        </div>
      </div>

      {/* 2. Key Dates (Top Grid) */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <DateCard label="Standard Payment" date={data.payment_dates.standard} />
          <DateCard label="California Payment" date={data.payment_dates.california} type="warning" />
          <DateCard label="Submission Deadline" date={data.payment_dates.max_date} type="danger" />
        </div>
      </section>

      {/* 3. Main Grid (Asymmetric) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        
        {/* Wide Column: Metrics (2/3) */}
        <div className="xl:col-span-2 space-y-6">
          <PerformanceSection data={data.performance} />
        </div>

        {/* Narrow Column: News (1/3) */}
        <div className="xl:col-span-1">
           <NewsFeed news={data.news} />
        </div>

      </div>
    </div>
  );
}