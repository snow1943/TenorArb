import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  ComposedChart
} from 'recharts';

interface PriceChartProps {
  type: 'basis-convergence' | 'funding-rate' | 'simulation';
  data?: any[];
}

const PriceChart: React.FC<PriceChartProps> = ({ type, data }) => {
  // Idealized Convergence Data
  const convergenceData = [
    { day: 0, Spot: 2000, Futures: 2050, Profit: 0 },
    { day: 15, Spot: 2010, Futures: 2055, Profit: 5 },
    { day: 30, Spot: 2025, Futures: 2060, Profit: 15 },
    { day: 45, Spot: 2040, Futures: 2065, Profit: 25 },
    { day: 60, Spot: 2045, Futures: 2060, Profit: 35 },
    { day: 75, Spot: 2055, Futures: 2060, Profit: 45 },
    { day: 90, Spot: 2065, Futures: 2065, Profit: 50 }, // Converged
  ];

  if (type === 'simulation' && data) {
    return (
      <div className="h-[450px] w-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h4 className="font-semibold text-gray-900">实盘价格与基差监控</h4>
          <div className="flex items-center space-x-4 text-xs">
            <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-gold-500 mr-2"></span>现货价格</span>
            <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-brand-600 mr-2"></span>期货价格</span>
            <span className="flex items-center"><span className="w-2 h-2 bg-indigo-500/20 border border-indigo-500 mr-2"></span>基差 (Spread)</span>
            <span className="flex items-center"><span className="w-2 h-2 bg-emerald-500 mr-2"></span>净利润</span>
          </div>
        </div>
        <div className="p-4 flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F2F4F7" vertical={false} />
              <XAxis 
                dataKey="day" 
                stroke="#98A2B3" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                tickMargin={10}
              />
              {/* Left Axis: Price */}
              <YAxis 
                yAxisId="price" 
                stroke="#98A2B3" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                domain={['dataMin - 10', 'dataMax + 10']}
                tickFormatter={(val) => `$${val}`}
              />
              {/* Right Axis: PnL & Basis */}
              <YAxis 
                yAxisId="pnl" 
                orientation="right" 
                stroke="#667085" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(val) => `$${val}`}
              />
              
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#ffffff', 
                  borderColor: '#EAECF0', 
                  borderRadius: '8px', 
                  boxShadow: '0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                  padding: '12px'
                }}
                labelStyle={{ color: '#667085', marginBottom: '8px', fontSize: '12px' }}
                itemStyle={{ fontSize: '12px', fontWeight: 500, padding: '2px 0' }}
                formatter={(value: number) => value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
              />
              
              {/* Basis Area: Visualizes the spread shrinking */}
              <Area 
                yAxisId="pnl"
                type="monotone" 
                dataKey="basis" 
                stroke="#6366f1" 
                fill="#6366f1" 
                fillOpacity={0.1} 
                strokeWidth={1}
                name="基差 (Basis)"
                isAnimationActive={false} // Disable animation for realtime updates
              />

              <Line 
                yAxisId="price" 
                type="monotone" 
                dataKey="spot" 
                stroke="#F79009" 
                strokeWidth={2} 
                dot={false} 
                activeDot={{ r: 4, fill: '#F79009' }} 
                isAnimationActive={false} // Disable animation
                name="现货 (Spot)"
              />
              <Line 
                yAxisId="price" 
                type="monotone" 
                dataKey="futures" 
                stroke="#0086C9" 
                strokeWidth={2} 
                dot={false} 
                activeDot={{ r: 4, fill: '#0086C9' }} 
                isAnimationActive={false} // Disable animation
                name="期货 (Fut)"
              />
              
              {/* Profit Step Line */}
              <Line 
                yAxisId="pnl" 
                type="step" 
                dataKey="pnl" 
                stroke="#10B981" 
                strokeWidth={2} 
                dot={false} 
                isAnimationActive={false} // Disable animation
                name="净利润 (PnL)"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  if (type === 'basis-convergence') {
    return (
      <div className="h-80 w-full bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h4 className="text-center font-semibold text-gray-900 mb-6">理想基差回归模型</h4>
        <ResponsiveContainer width="100%" height="85%">
          <ComposedChart data={convergenceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F2F4F7" vertical={false} />
            <XAxis 
              dataKey="day" 
              label={{ value: '持有天数', position: 'insideBottom', offset: -5, fill: '#98A2B3', fontSize: 12 }} 
              stroke="#98A2B3" 
              tickLine={false} 
              axisLine={false} 
            />
            {/* Left Axis: Price (Auto Scaled) */}
            <YAxis 
              yAxisId="left"
              stroke="#98A2B3" 
              tickLine={false} 
              axisLine={false} 
              domain={['dataMin - 20', 'dataMax + 20']} // Dynamic domain to show details
              tickFormatter={(val) => `$${val}`}
            />
            {/* Right Axis: Profit (Starts at 0) */}
            <YAxis 
              yAxisId="right"
              orientation="right"
              stroke="#10B981" 
              tickLine={false} 
              axisLine={false} 
              domain={[0, 'auto']} 
              tickFormatter={(val) => `$${val}`}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', borderColor: '#EAECF0', borderRadius: '8px', boxShadow: '0 12px 16px -4px rgba(16, 24, 40, 0.08)' }} 
              formatter={(value: number, name: string) => [`$${value}`, name === 'Profit' ? '已锁定利润' : name]}
            />
            <Legend verticalAlign="top" height={36} iconType="circle" />
            
            <Line yAxisId="left" type="monotone" dataKey="Spot" stroke="#F79009" strokeWidth={3} name="现货价格" dot={{ r: 4, fill: '#F79009' }} />
            <Line yAxisId="left" type="monotone" dataKey="Futures" stroke="#0086C9" strokeWidth={3} name="期货价格" dot={{ r: 4, fill: '#0086C9' }} />
            
            <Area yAxisId="right" type="monotone" dataKey="Profit" fill="#10B981" stroke="none" fillOpacity={0.15} name="已锁定利润" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return null;
};

export default PriceChart;