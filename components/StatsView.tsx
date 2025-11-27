import React from 'react';
import { Habit } from '../types';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface StatsViewProps {
  habits: Habit[];
  aiInsight: string | null;
  onGenerateInsight: () => void;
  isLoadingAi: boolean;
}

const StatsView: React.FC<StatsViewProps> = ({ habits, aiInsight, onGenerateInsight, isLoadingAi }) => {
  
  // Calculate completion rate for each habit
  const data = habits.map(habit => {
    // Simple mock calculation: completion in last 30 days
    // In a real app, we'd filter dates properly
    return {
      name: habit.name,
      count: habit.completedDates.length,
      fill: habit.color
    };
  });

  const totalCompletions = habits.reduce((acc, h) => acc + h.completedDates.length, 0);

  return (
    <div className="animate-fade-in pb-24">
      <h2 className="text-2xl font-bold mb-6">الإحصائيات</h2>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-surface p-5 rounded-3xl border border-secondary">
          <div className="text-primary text-3xl font-bold mb-1">{habits.length}</div>
          <div className="text-muted text-sm">العادات النشطة</div>
        </div>
        <div className="bg-surface p-5 rounded-3xl border border-secondary">
          <div className="text-green-500 text-3xl font-bold mb-1">{totalCompletions}</div>
          <div className="text-muted text-sm">إجمالي الإكمال</div>
        </div>
      </div>

      {/* AI Insight Section */}
      <div className="bg-gradient-to-br from-[#1C1C1C] to-[#252525] p-6 rounded-3xl border border-secondary mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
        
        <div className="flex justify-between items-start mb-4 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-xl">✨</span>
            <h3 className="font-bold text-white">تحليل الذكاء الاصطناعي</h3>
          </div>
          <button 
            onClick={onGenerateInsight}
            disabled={isLoadingAi}
            className="text-xs bg-primary/20 text-primary px-3 py-1.5 rounded-full hover:bg-primary hover:text-white transition-colors disabled:opacity-50"
          >
            {isLoadingAi ? 'جار التحليل...' : 'تحديث'}
          </button>
        </div>
        
        <p className="text-gray-300 leading-relaxed text-sm min-h-[60px] relative z-10">
          {aiInsight || "اضغط على تحديث للحصول على نصائح مخصصة لعاداتك..."}
        </p>
      </div>

      {/* Chart */}
      <div className="bg-surface p-6 rounded-3xl border border-secondary h-[300px]">
        <h3 className="font-bold text-white mb-6 text-sm">أداء العادات</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: -20, right: 30 }}>
             <XAxis type="number" hide />
             <YAxis 
                dataKey="name" 
                type="category" 
                tick={{ fill: '#AAAAAA', fontSize: 12 }} 
                width={80}
                orientation="right" 
             />
             <Tooltip 
                cursor={{fill: 'transparent'}}
                contentStyle={{ backgroundColor: '#1C1C1C', borderRadius: '12px', border: '1px solid #2C2C2C', color: '#fff' }}
             />
             <Bar dataKey="count" barSize={16} radius={[4, 0, 0, 4]} background={{ fill: '#0F0F0F', radius: [4, 0, 0, 4] }} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StatsView;