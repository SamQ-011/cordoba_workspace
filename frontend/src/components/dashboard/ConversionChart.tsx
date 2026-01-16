import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface ConversionChartProps {
  completed: number;
  total: number;
}

export const ConversionChart = ({ completed, total }: ConversionChartProps) => {
  const notCompleted = Math.max(0, total - completed);
  
  const data = [
    { name: 'Successful', value: completed },
    { name: 'Others', value: notCompleted },
  ];

  const COLORS = ['#10B981', '#F1F5F9']; 

  const percentage = total > 0 ? ((completed / total) * 100).toFixed(1) : 0;

  if (total === 0) {
    return (
      <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-slate-400 bg-white rounded-2xl border border-slate-100 shadow-sm">
        <p className="text-sm font-medium">Waiting for data...</p>
      </div>
    );
  }

  return (
    <div className="h-full bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between relative overflow-hidden">
      
      {/* 1. Text Info (Left) */}
      <div className="z-10 mb-4 sm:mb-0 text-center sm:text-left">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Conversion Rate</h3>
        <div className="flex items-baseline gap-2 justify-center sm:justify-start">
          <span className="text-5xl font-black text-slate-900 tracking-tighter">{percentage}%</span>
        </div>
        <p className="text-xs text-slate-500 mt-2 font-medium">
          <span className="text-emerald-600 font-bold">{completed}</span> sales out of <span className="text-slate-700 font-bold">{total}</span> calls
        </p>
      </div>

      {/* 2. Donut Chart (Right) */}
      <div className="h-40 w-40 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={75}
              startAngle={90}
              endAngle={-270}
              paddingAngle={0}
              dataKey="value"
              stroke="none"
              cornerRadius={10}
            >
              <Cell key="cell-completed" fill={COLORS[0]} />
              <Cell key="cell-other" fill={COLORS[1]} />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center Decoration */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
           <div className="w-24 h-24 rounded-full bg-emerald-50/50 flex items-center justify-center">
             <div className="w-16 h-16 rounded-full bg-emerald-100/50"></div>
           </div>
        </div>
      </div>
    </div>
  );
};