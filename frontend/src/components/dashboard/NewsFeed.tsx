import { Link } from 'react-router-dom';
import { AlertTriangle, Info, Bell, CheckCircle2, ArrowRight } from 'lucide-react';
import type { NewsItem } from '../../types/dashboard';

interface NewsFeedProps {
  news: NewsItem[];
}

export const NewsFeed = ({ news }: NewsFeedProps) => {

  const getIcon = (category: string) => {
    switch (category.toUpperCase()) {
      case 'CRITICAL': return <AlertTriangle size={18} className="text-rose-500" />;
      case 'WARNING': return <AlertTriangle size={18} className="text-amber-500" />;
      default: return <Info size={18} className="text-blue-500" />;
    }
  };

  // Limit to 4 items
  const displayNews = news.slice(0, 4);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-card h-full flex flex-col">
      
      {/* Header */}
      <div className="p-6 border-b border-slate-50 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Bell className="text-slate-400" size={20} />
          <h3 className="font-semibold text-slate-700">Recent News</h3>
        </div>
        
        <Link 
          to="/updates" 
          className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors cursor-pointer"
        >
          VIEW ALL <ArrowRight size={12} />
        </Link>
      </div>

      {/* List */}
      <div className="p-0 overflow-y-auto max-h-[400px]">
        {displayNews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <CheckCircle2 size={40} className="mb-3 opacity-20" />
            <p className="text-sm">All caught up</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {displayNews.map((item) => (
              <div key={item.id} className="p-5 hover:bg-slate-50 transition-colors group">
                <div className="flex gap-4">
                  
                  {/* Icon */}
                  <div className="mt-0.5 shrink-0 w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-white border border-transparent group-hover:border-slate-200 transition-all">
                    {getIcon(item.category)}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-sm font-semibold text-slate-800 leading-tight">
                        {item.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-2 bg-slate-100 px-1.5 py-0.5 rounded">
                        {item.date}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed mt-1 line-clamp-2">
                      {item.message}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};