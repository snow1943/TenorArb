import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, ShieldAlert, LineChart, Target, Zap } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="space-y-32 animate-fade-in-up">
      {/* Hero Section */}
      <section className="relative pt-12 text-center md:text-left md:pt-24 md:flex md:items-center md:justify-between max-w-6xl mx-auto">
        <div className="md:w-1/2 space-y-8">
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 leading-[1.1]">
            Master the art of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-brand-400">
              Basis Trading.
            </span>
          </h1>
          
          <p className="text-xl text-gray-500 max-w-lg leading-relaxed font-light">
            TenorArb 是首个专注于金融期限套利（Cash-and-Carry）的交互式学习终端。
            利用数据可视化和实战仿真系统，帮您构建机构级的低风险对冲策略。
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link
              to="/learn"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-all shadow-lg shadow-gray-200 hover:shadow-xl hover:-translate-y-0.5"
            >
              开始课程
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link
              to="/simulator"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-gray-700 bg-white hover:bg-gray-50 rounded-lg transition-all border border-gray-200 shadow-sm hover:shadow-md"
            >
              模拟交易
            </Link>
          </div>
          
          <div className="pt-8 flex items-center space-x-8 text-gray-400 text-sm font-medium">
            <div className="flex items-center space-x-2">
              <ShieldAlert size={16} />
              <span>Risk Management</span>
            </div>
            <div className="flex items-center space-x-2">
              <Target size={16} />
              <span>Market Neutral</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap size={16} />
              <span>Real-time Sim</span>
            </div>
          </div>
        </div>

        {/* Hero Graphic */}
        <div className="hidden md:block md:w-1/2 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-100/50 rounded-full blur-[100px] -z-10"></div>
          <div className="relative bg-white/60 backdrop-blur-xl border border-white/40 rounded-2xl shadow-xl p-6 transform rotate-3 hover:rotate-0 transition-transform duration-700">
            <div className="flex items-center justify-between mb-8">
               <div>
                 <div className="text-xs font-mono text-gray-400 uppercase">Portfolio Value</div>
                 <div className="text-3xl font-bold text-gray-900">$102,450.00</div>
               </div>
               <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">+2.45%</div>
            </div>
            <div className="space-y-4">
               <div className="h-2 bg-gray-100 rounded-full w-full overflow-hidden">
                 <div className="h-full bg-brand-500 w-3/4"></div>
               </div>
               <div className="h-2 bg-gray-100 rounded-full w-2/3"></div>
               <div className="h-2 bg-gray-100 rounded-full w-5/6"></div>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4">
               <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                  <div className="text-xs text-gray-500 mb-1">Spot Gold</div>
                  <div className="text-lg font-mono font-bold text-gold-500">$2,020.00</div>
               </div>
               <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                  <div className="text-xs text-gray-500 mb-1">Futures</div>
                  <div className="text-lg font-mono font-bold text-brand-600">$2,055.00</div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Why TenorArb?</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            我们不仅仅提供理论。通过高度仿真的市场环境，填补教科书与真实交易之间的鸿沟。
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Card 1 */}
          <div className="group p-8 bg-white border border-gray-200 rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-brand-600 transition-colors duration-300">
              <LineChart className="text-brand-600 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">可视化基差模型</h3>
            <p className="text-gray-500 leading-relaxed text-sm">
              告别枯燥的公式。通过动态图表直观理解 Contango 结构、持有成本 (Cost of Carry) 以及基差收敛的数学原理。
            </p>
          </div>

          {/* Card 2 */}
          <div className="group p-8 bg-white border border-gray-200 rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-orange-500 transition-colors duration-300">
              <ShieldAlert className="text-orange-600 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">极端行情压力测试</h3>
            <p className="text-gray-500 leading-relaxed text-sm">
              在模拟器中体验“黑天鹅”事件。了解保证金追缴 (Margin Call) 和流动性枯竭如何摧毁一个看似完美的套利策略。
            </p>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="border-t border-gray-200 py-12 text-center">
         <div className="flex items-center justify-center space-x-2 mb-4">
            <TrendingUp size={20} className="text-gray-900" />
            <span className="font-bold text-gray-900">TenorArb</span>
         </div>
         <p className="text-gray-400 text-sm">© 2024 TenorArb Inc. Built for quants.</p>
      </footer>
    </div>
  );
};

export default Home;