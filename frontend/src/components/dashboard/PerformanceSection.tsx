import { useState } from 'react';
import { Phone, CheckCircle2 } from 'lucide-react';
import type{ PerformanceData, MetricsSet } from '../../types/dashboard';
import { StatCard } from './StatCard';
import { ConversionChart } from './ConversionChart';
import clsx from 'clsx';

interface Props {
  data: PerformanceData;
}

type Period = 'today' | 'this_week' | 'this_month';

export const PerformanceSection = ({ data }: Props) => {
  const [activeTab, setActiveTab] = useState<Period>('today');
  const currentMetrics: MetricsSet = data[activeTab];

  const tabs: { id: Period; label: string }[] = [
    { id: 'today', label: 'Today' },
    { id: 'this_week', label: 'Week' },
    { id: 'this_month', label: 'Month' },
  ];

  return (
    <section className="space-y-6">
      
      {/* Header + Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-end gap-4">
        <div>
           <h3 className="text-lg font-bold text-slate-800">Operational Performance</h3>
           <p className="text-xs text-slate-500">Key metrics for management and efficiency.</p>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-xl">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "px-3 py-1.5 text-xs font-bold rounded-lg transition-all",
                activeTab === tab.id
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Column 1: Stacked Cards */}
        <div className="flex flex-col gap-4">
          <StatCard 
            label="Total Calls" 
            value={currentMetrics.total_calls} 
            icon={Phone} 
            color="text-blue-600"
            bgIcon="bg-blue-50"
          />
          <StatCard 
            label="Successful Sales" 
            value={currentMetrics.completed_sales} 
            icon={CheckCircle2} 
            color="text-emerald-600"
            bgIcon="bg-emerald-50"
          />
        </div>

        {/* Column 2: Chart */}
        <div className="lg:col-span-2">
          <ConversionChart 
            completed={currentMetrics.completed_sales}
            total={currentMetrics.total_calls}
          />
        </div>

      </div>
    </section>
  );
};