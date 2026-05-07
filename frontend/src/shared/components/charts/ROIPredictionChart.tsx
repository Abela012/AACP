import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface ROIPredictionChartProps {
  data: {
    month: string;
    reach: number;
    conversions: number;
    revenue: number;
  }[];
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b'];

export default function ROIPredictionChart({ data }: ROIPredictionChartProps) {
  // Use the latest month's data for the funnel breakdown
  const latest = data[data.length - 1] || { reach: 0, conversions: 0, revenue: 0 };
  
  const chartData = [
    { name: 'Estimated Reach', value: latest.reach },
    { name: 'Target Conversions', value: latest.conversions * 100 }, // Scaled for visibility
    { name: 'Revenue Impact (ETB)', value: latest.revenue },
  ];

  return (
    <div className="w-full h-[320px] mt-6 flex flex-col items-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip 
            contentStyle={{ 
              borderRadius: '16px', 
              border: 'none', 
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
              fontSize: '12px',
              fontWeight: 'bold'
            }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            iconType="circle"
            wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '20px' }}
          />
          <Pie
            data={chartData}
            cx="50%"
            cy="45%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={8}
            dataKey="value"
            animationDuration={1500}
            stroke="none"
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]} 
                style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="text-[10px] text-gray-400 font-bold mt-2 text-center italic">
        * Funnel breakdown based on Month 6 projections
      </div>
    </div>
  );
}
