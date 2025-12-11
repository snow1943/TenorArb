import React, { useState, useEffect } from 'react';
import { INITIAL_SIMULATION_STATE } from '../constants';
import { SimulationState, MarketScenario } from '../types';
import PriceChart from '../components/PriceChart';
import { Play, RotateCcw, AlertOctagon, TrendingUp, Wallet, Sliders, Pause, FastForward } from 'lucide-react';

const Simulator: React.FC = () => {
  const [state, setState] = useState<SimulationState>(INITIAL_SIMULATION_STATE);
  const [isPlaying, setIsPlaying] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(800); 

  // Computed PnL & Margin Logic
  // 1. Mark-to-Market PnL
  const spotValue = state.spotPosition * state.currentSpotPrice;
  const entrySpotValue = state.spotPosition * state.entrySpotPrice;
  const spotPnL = spotValue - entrySpotValue;

  // Short Futures PnL = (Entry - Current) * Size
  const futuresPnL = Math.abs(state.futuresPosition) * (state.entryFuturesPrice - state.currentFuturesPrice);
  
  const totalPnL = spotPnL + futuresPnL;
  const currentBasis = state.currentFuturesPrice - state.currentSpotPrice;

  // Margin Calculation
  const futuresNotional = Math.abs(state.futuresPosition) * state.currentFuturesPrice;
  const requiredMaintenanceMargin = futuresNotional * state.maintenanceMarginRatio;
  const futuresAccountEquity = state.cash + futuresPnL; 

  const isMarginCall = state.futuresPosition !== 0 && futuresAccountEquity < requiredMaintenanceMargin;

  // Actions
  const openPositions = () => {
    if (state.spotPosition > 0) return; 
    
    // Strategy: Use 50% of cash to buy Spot, keep 50% for Futures Margin buffer.
    const amount = 25; 
    const spotCost = amount * state.currentSpotPrice;

    if (state.cash < spotCost + (spotCost * 0.2)) {
      alert("资金不足以建立安全头寸 (需预留保证金)。");
      return;
    }

    setState(prev => ({
      ...prev,
      cash: prev.cash - spotCost,
      spotPosition: amount,
      futuresPosition: -amount, // Short Futures
      entrySpotPrice: prev.currentSpotPrice,
      entryFuturesPrice: prev.currentFuturesPrice,
      history: [...prev.history, { 
        day: 90 - prev.timeToMaturity, 
        spot: prev.currentSpotPrice, 
        futures: prev.currentFuturesPrice, 
        pnl: 0,
        basis: prev.currentFuturesPrice - prev.currentSpotPrice
      }]
    }));
  };

  const closePositions = () => {
    if (state.spotPosition === 0) return;

    const finalSpotValue = state.spotPosition * state.currentSpotPrice;
    const finalFuturesPnL = Math.abs(state.futuresPosition) * (state.entryFuturesPrice - state.currentFuturesPrice);
    
    const newCash = state.cash + finalSpotValue + finalFuturesPnL;

    setState(prev => ({
      ...prev,
      cash: newCash,
      spotPosition: 0,
      futuresPosition: 0,
      entrySpotPrice: 0,
      entryFuturesPrice: 0,
      isLiquidated: false
    }));
    setIsPlaying(false);
  };

  const resetSim = () => {
    setState({ ...INITIAL_SIMULATION_STATE, scenario: state.scenario });
    setIsPlaying(false);
  };

  const checkLiquidation = (currentState: SimulationState) => {
    if (currentState.futuresPosition !== 0 && !currentState.isLiquidated) {
      // Calculate Margin Status
      const fPnL = Math.abs(currentState.futuresPosition) * (currentState.entryFuturesPrice - currentState.currentFuturesPrice);
      const equity = currentState.cash + fPnL;
      const notional = Math.abs(currentState.futuresPosition) * currentState.currentFuturesPrice;
      const mm = notional * currentState.maintenanceMarginRatio;

      if (equity < mm) {
        return true;
      }
    }
    return false;
  };

  // Pure function to calculate next day state
  const simulateDay = (prev: SimulationState): SimulationState => {
    // 1. Determine Market Move based on Scenario
    let spotChangePercent = 0;
    let volatility = 10;

    switch (prev.scenario) {
      case 'NORMAL':
        spotChangePercent = (Math.random() - 0.45) * 0.005; // Slight drift up
        volatility = 5;
        break;
      case 'BULL_RUN':
        spotChangePercent = (Math.random() * 0.015); // Consistent up +1.5% max daily
        volatility = 10;
        break;
      case 'BEAR_CRASH':
        spotChangePercent = -(Math.random() * 0.015); // Consistent down
        volatility = 15;
        break;
      case 'HIGH_VOLATILITY':
        spotChangePercent = (Math.random() - 0.5) * 0.04; // +/- 2% daily
        volatility = 30;
        break;
    }

    const newSpot = prev.currentSpotPrice * (1 + spotChangePercent);

    // 2. Basis Logic
    // Basis tends to converge to 0 at maturity.
    const daysPassed = 90 - prev.timeToMaturity + 1;
    const totalDuration = 90;
    const progress = daysPassed / totalDuration;
    
    const initialBasis = 50; 
    // Ideal convergence
    let targetBasis = initialBasis * (1 - progress);

    // Scenario impact on Basis
    if (prev.scenario === 'BULL_RUN') targetBasis += 5; 
    if (prev.scenario === 'BEAR_CRASH') targetBasis -= 5;
    if (prev.scenario === 'HIGH_VOLATILITY') targetBasis += (Math.random() - 0.5) * 20;

    // Add noise
    const noise = (Math.random() - 0.5) * volatility;
    // Ensure basis doesn't flip irrationally unless high vol, but let's keep it simple
    let newFutures = newSpot + targetBasis + noise;

    // Force convergence on last day
    if (prev.timeToMaturity <= 1) {
       newFutures = newSpot; 
    }

    // 3. PnL Calc
    const sPnL = prev.spotPosition * (newSpot - prev.entrySpotPrice);
    const fPnL = Math.abs(prev.futuresPosition) * (prev.entryFuturesPrice - newFutures);
    
    const newState = {
      ...prev,
      currentSpotPrice: newSpot,
      currentFuturesPrice: newFutures,
      timeToMaturity: prev.timeToMaturity - 1,
      history: [...prev.history, {
        day: daysPassed,
        spot: newSpot,
        futures: newFutures,
        pnl: prev.spotPosition > 0 ? (sPnL + fPnL) : 0,
        basis: newFutures - newSpot
      }]
    };

    // 4. Check Liquidation
    if (checkLiquidation(newState)) {
      newState.isLiquidated = true;
      newState.cash = 0; 
      newState.spotPosition = 0; 
      newState.futuresPosition = 0;
    }

    return newState;
  };

  const nextDay = () => {
    if (state.timeToMaturity <= 0 || state.isLiquidated) {
      setIsPlaying(false);
      return;
    }
    setState(prev => simulateDay(prev));
  };

  const skipToMaturity = () => {
    setIsPlaying(false);
    setState(prev => {
        let curr = { ...prev };
        let safeGuard = 0;
        // Simulate until maturity (0 days left) or liquidated
        while(curr.timeToMaturity > 0 && !curr.isLiquidated && safeGuard < 365) {
            curr = simulateDay(curr);
            safeGuard++;
        }
        return curr;
    });
  };

  useEffect(() => {
    let interval: any;
    if (isPlaying && state.timeToMaturity > 0 && !state.isLiquidated) {
      interval = setInterval(nextDay, simulationSpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, state.timeToMaturity, state.isLiquidated]);

  const handleScenarioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    resetSim();
    setState(prev => ({ ...prev, scenario: e.target.value as MarketScenario }));
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">实战交易终端</h1>
          <p className="text-gray-500 mt-1">COMEX Gold Futures (GC) / 保证金仿真环境</p>
        </div>
        <div className="flex items-center space-x-3 bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
           <Sliders size={16} className="text-gray-400 ml-2" />
           <select 
             value={state.scenario} 
             onChange={handleScenarioChange}
             disabled={state.spotPosition !== 0}
             className="bg-transparent text-sm font-medium text-gray-700 outline-none cursor-pointer pr-2"
           >
             <option value="NORMAL">标准行情 (基差回归)</option>
             <option value="BULL_RUN">单边牛市 (保证金压力)</option>
             <option value="BEAR_CRASH">单边熊市 (资金缩水)</option>
             <option value="HIGH_VOLATILITY">高波动 (基差震荡)</option>
           </select>
        </div>
        <button 
          onClick={resetSim}
          className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition shadow-sm text-sm"
        >
          <RotateCcw size={14} className="mr-2"/> 重置系统
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Column: Charts & Market Data */}
        <div className="lg:col-span-2 space-y-6">
           {/* Prices Cards */}
           <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-xs">
                <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Spot Price (XAU)</div>
                <div className="flex items-baseline space-x-2">
                   <span className="text-2xl font-mono font-bold text-gold-600">${state.currentSpotPrice.toFixed(2)}</span>
                   <span className="text-xs text-gray-400">/ oz</span>
                </div>
              </div>
              <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-xs">
                <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Futures Price (GC)</div>
                <div className="flex justify-between items-baseline">
                   <div className="flex items-baseline space-x-2">
                      <span className="text-2xl font-mono font-bold text-brand-600">${state.currentFuturesPrice.toFixed(2)}</span>
                      <span className="text-xs text-gray-400">/ oz</span>
                   </div>
                   <div className={`px-2 py-1 rounded text-xs font-mono font-bold ${currentBasis > 0 ? 'bg-indigo-50 text-indigo-700' : 'bg-red-50 text-red-700'}`}>
                     Basis: {currentBasis > 0 ? '+' : ''}{currentBasis.toFixed(2)}
                   </div>
                </div>
              </div>
           </div>

           {/* Chart */}
           <PriceChart type="simulation" data={state.history} />

           {/* Controls */}
           <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
             <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center space-x-8 text-sm">
                  <div>
                    <div className="text-gray-400 uppercase text-xs mb-1">Time Left</div>
                    <div className="text-xl font-bold text-gray-900">{state.timeToMaturity} <span className="text-sm font-normal text-gray-400">Days</span></div>
                  </div>
                  <div>
                    <div className="text-gray-400 uppercase text-xs mb-1">Position</div>
                    <div className="text-xl font-bold text-gray-900">{state.spotPosition} <span className="text-sm font-normal text-gray-400">oz</span></div>
                  </div>
                </div>

                <div className="flex-1 w-full md:w-auto flex justify-end gap-3">
                  {state.spotPosition === 0 ? (
                    <button 
                      onClick={openPositions}
                      disabled={state.isLiquidated}
                      className="w-full md:w-auto px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-lg shadow-md transition-all flex items-center justify-center"
                    >
                      <TrendingUp className="mr-2" size={18}/>
                      一键开仓 (25 oz)
                    </button>
                  ) : (
                    <>
                      <button 
                        onClick={() => setIsPlaying(!isPlaying)}
                        disabled={state.timeToMaturity === 0}
                        className={`flex-1 md:flex-none px-6 py-3 rounded-lg font-bold text-white transition-all flex items-center justify-center shadow-md ${
                          state.timeToMaturity === 0 
                            ? 'bg-gray-300 cursor-not-allowed'
                            : isPlaying ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-600 hover:bg-green-700'
                        }`}
                      >
                        {isPlaying ? <><Pause className="mr-2" size={18}/> 暂停</> : <><Play className="mr-2" size={18}/> 运行</>}
                      </button>
                      
                      {state.timeToMaturity > 0 && (
                        <button 
                          onClick={skipToMaturity}
                          className="flex-1 md:flex-none px-6 py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg transition-all shadow-sm flex items-center justify-center border border-indigo-200"
                        >
                          <FastForward className="mr-2" size={18}/> 直接到期
                        </button>
                      )}

                      <button 
                        onClick={closePositions}
                        className="flex-1 md:flex-none px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-lg transition-all shadow-md"
                      >
                        {state.timeToMaturity === 0 ? "到期结算" : "平仓结算"}
                      </button>
                    </>
                  )}
                </div>
             </div>
           </div>
        </div>

        {/* Right Column: Portfolio & Risk */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm h-full flex flex-col relative overflow-hidden">
            {state.isLiquidated && (
              <div className="absolute inset-0 z-10 bg-red-500/90 backdrop-blur-sm flex flex-col items-center justify-center text-white p-6 text-center animate-fade-in-up">
                <AlertOctagon size={48} className="mb-4" />
                <h3 className="text-2xl font-bold mb-2">已爆仓 (Liquidated)</h3>
                <p className="mb-6">期货账户保证金不足，头寸已被强行平仓。</p>
                <button onClick={resetSim} className="px-6 py-2 bg-white text-red-600 font-bold rounded-lg">重新开始</button>
              </div>
            )}

            <div className="flex items-center space-x-2 mb-6 text-gray-900 font-bold text-lg">
              <Wallet className="text-brand-600" />
              <h3>资产概览</h3>
            </div>
            
            <div className="space-y-6">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="text-sm text-gray-500 mb-1">Total Equity (Approx)</div>
                <div className="text-2xl font-mono font-bold text-gray-900">${(state.cash + spotPnL + futuresPnL + (state.spotPosition * state.entrySpotPrice)).toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
              </div>

              {state.spotPosition > 0 && (
                <div className="space-y-3 text-sm">
                   <div className="flex justify-between">
                      <span className="text-gray-500">Spot PnL</span>
                      <span className={`font-mono font-medium ${spotPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {spotPnL > 0 ? '+' : ''}{spotPnL.toFixed(2)}
                      </span>
                   </div>
                   <div className="flex justify-between">
                      <span className="text-gray-500">Futures PnL</span>
                      <span className={`font-mono font-medium ${futuresPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {futuresPnL > 0 ? '+' : ''}{futuresPnL.toFixed(2)}
                      </span>
                   </div>
                   <div className="h-px bg-gray-200 my-2"></div>
                   <div className="flex justify-between">
                      <span className="text-gray-900 font-bold">Net Profit</span>
                      <span className={`font-mono font-bold ${totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {totalPnL > 0 ? '+' : ''}{totalPnL.toFixed(2)}
                      </span>
                   </div>
                   
                   {/* Risk Meter */}
                   <div className="pt-4 mt-2 border-t border-gray-100">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-500">期货保证金使用率</span>
                        <span className="text-gray-700 font-mono">
                           {((requiredMaintenanceMargin / futuresAccountEquity) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div 
                           className={`h-full transition-all duration-300 ${futuresAccountEquity < requiredMaintenanceMargin * 1.5 ? 'bg-red-500' : 'bg-green-500'}`}
                           style={{ width: `${Math.min(((requiredMaintenanceMargin / futuresAccountEquity) * 100), 100)}%` }}
                        ></div>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1">
                        当使用率达到 100% 时触发强平。
                      </p>
                   </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Simulator;