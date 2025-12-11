import React, { useState, useEffect } from 'react';
import { COURSE_CONTENT } from '../constants';
import PriceChart from '../components/PriceChart';
import { BookOpen, Menu, ArrowLeft, ChevronLeft, ChevronRight, AlertTriangle, Lock, Timer } from 'lucide-react';

const Course: React.FC = () => {
  const [activeChapterId, setActiveChapterId] = useState(COURSE_CONTENT[0].id);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Scroll content to top when chapter changes
  useEffect(() => {
    const contentContainer = document.getElementById('course-content-container');
    if (contentContainer) {
      contentContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeChapterId]);

  const activeIndex = COURSE_CONTENT.findIndex(c => c.id === activeChapterId);
  const activeChapter = COURSE_CONTENT[activeIndex] || COURSE_CONTENT[0];
  const prevChapter = COURSE_CONTENT[activeIndex - 1];
  const nextChapter = COURSE_CONTENT[activeIndex + 1];

  const renderText = (text: string) => {
    const parts = text.split(/(\$\$.*?\$\$)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('$$') && part.endsWith('$$')) {
        let formula = part.slice(2, -2);
        
        // Basic LaTeX parsing
        formula = formula.replace(/\\times/g, '×');
        
        // Handle Fractions: \frac{num}{den} -> HTML vertical stack
        // Using a simple regex for non-nested braces.
        formula = formula.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, 
          '<span class="inline-flex flex-col text-center align-middle mx-1" style="vertical-align: middle"><span class="border-b border-gray-900 pb-[1px] text-[0.85em] leading-tight mb-[1px]">$1</span><span class="text-[0.85em] leading-tight mt-[1px]">$2</span></span>'
        );

        // Handle Scaled Parentheses
        formula = formula.replace(/\\left\(/g, '<span class="text-[1.2em] inline-block align-middle font-light mx-0.5">(</span>');
        formula = formula.replace(/\\right\)/g, '<span class="text-[1.2em] inline-block align-middle font-light mx-0.5">)</span>');
        // Clean up remaining left/right if not matching parens (fallback)
        formula = formula.replace(/\\left/g, '');
        formula = formula.replace(/\\right/g, '');
        
        // Handle subscripts: _{...} or _char
        formula = formula.replace(/_\{([^}]+)\}/g, '<sub>$1</sub>');
        formula = formula.replace(/_([a-zA-Z0-9])/g, '<sub>$1</sub>');
        
        // Handle superscripts: ^{...} or ^char
        formula = formula.replace(/\^\{([^}]+)\}/g, '<sup>$1</sup>');
        formula = formula.replace(/\^([a-zA-Z0-9])/g, '<sup>$1</sup>');

        return (
          <span 
            key={index} 
            className="inline-block font-serif italic text-[1.1em] text-gray-900 px-1 mx-0.5 align-middle whitespace-nowrap"
            dangerouslySetInnerHTML={{ __html: formula }}
          />
        );
      }
      
      const subParts = part.split(/(\*\*.*?\*\*)/g);
      return subParts.map((subPart, subIndex) => {
        if (subPart.startsWith('**') && subPart.endsWith('**')) {
          return <strong key={`${index}-${subIndex}`} className="font-bold text-gray-900 bg-gray-100 px-1 rounded">{subPart.slice(2, -2)}</strong>;
        }
        return subPart;
      });
    });
  };

  const DifficultyBadge = ({ diff }: { diff: string }) => {
    let colorClass = '';
    switch(diff) {
      case '基础': colorClass = 'bg-emerald-50 text-emerald-700 border-emerald-100'; break;
      case '进阶': colorClass = 'bg-blue-50 text-blue-700 border-blue-100'; break;
      case '专家': colorClass = 'bg-purple-50 text-purple-700 border-purple-100'; break;
      default: colorClass = 'bg-gray-50 text-gray-700 border-gray-100';
    }
    return (
      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${colorClass}`}>
        {diff}
      </span>
    );
  };

  return (
    // Fixed height container to enable independent scrolling panes
    // Increased height to 85vh to utilize more screen space
    <div className="flex flex-col lg:flex-row gap-6 h-[85vh] animate-fade-in-up">
      
      {/* Mobile Chapter Toggle */}
      <div className="lg:hidden shrink-0">
        <button 
          className="w-full bg-white p-4 rounded-xl border border-gray-200 flex items-center justify-between shadow-sm"
          onClick={() => setMobileMenuOpen(true)}
        >
          <span className="font-semibold text-gray-800 line-clamp-1">{activeChapter.title}</span>
          <Menu className="text-gray-500" size={20} />
        </button>
      </div>

      {/* Sidebar: Independent Scroll Container */}
      <div className={`
        lg:w-72 flex-shrink-0 flex flex-col 
        ${mobileMenuOpen 
          ? 'fixed inset-0 z-[60] bg-white p-6' 
          : 'hidden lg:flex lg:h-full'}
      `}>
        {mobileMenuOpen && (
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">课程目录</h2>
            <button onClick={() => setMobileMenuOpen(false)}><ArrowLeft className="text-gray-600"/></button>
          </div>
        )}

        <div className="hidden lg:flex items-center space-x-2 mb-4 px-2 shrink-0">
          <BookOpen className="text-gray-400 w-4 h-4" />
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Syllabus</h2>
        </div>

        {/* Scrollable List */}
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2">
          {COURSE_CONTENT.map((chapter) => (
            <button
              key={chapter.id}
              onClick={() => {
                setActiveChapterId(chapter.id);
                setMobileMenuOpen(false);
              }}
              className={`
                w-full text-left p-3 rounded-lg border transition-all duration-200 group relative
                ${activeChapterId === chapter.id
                  ? 'bg-white border-brand-500 shadow-sm ring-1 ring-brand-100'
                  : 'bg-white border-gray-200 hover:border-brand-300 hover:shadow-xs'}
              `}
            >
              {activeChapterId === chapter.id && <div className="absolute left-0 top-1 bottom-1 w-1 bg-brand-500 rounded-full"></div>}
              <div className="flex justify-between items-center mb-1 pl-2">
                <span className={`text-[10px] font-mono ${activeChapterId === chapter.id ? 'text-brand-600 font-bold' : 'text-gray-400'}`}>
                   CH.{chapter.id}
                </span>
                <DifficultyBadge diff={chapter.difficulty} />
              </div>
              <h3 className={`pl-2 font-semibold text-xs leading-snug ${activeChapterId === chapter.id ? 'text-gray-900' : 'text-gray-600 group-hover:text-gray-900'}`}>
                {chapter.title.split('：')[1] || chapter.title}
              </h3>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area: Independent Scroll Container */}
      <div 
        id="course-content-container"
        className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col relative overflow-hidden overflow-y-auto scroll-smooth custom-scrollbar"
      >
        <div className="p-8 lg:p-12">
          <div className="max-w-3xl mx-auto">
            
            {/* Header */}
            <div className="mb-10 border-b border-gray-100 pb-8">
               <div className="flex items-center space-x-2 mb-4">
                 <span className="px-2 py-1 bg-brand-50 text-brand-700 rounded text-xs font-bold tracking-wide uppercase">Chapter {activeChapter.id}</span>
               </div>
               <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
                 {activeChapter.title.includes('：') ? activeChapter.title.split('：')[1] : activeChapter.title}
               </h1>
               <p className="text-base text-gray-500 font-light leading-relaxed">
                 {activeChapter.description}
               </p>
            </div>

            {/* Content Body */}
            <div className="space-y-6 text-gray-700 leading-7 text-[15px] lg:text-base">
              {activeChapter.content.split('\n').map((line, i) => {
                const trimmed = line.trim();
                if (!trimmed) return null;

                if (trimmed.startsWith('## ')) {
                  return <h2 key={i} className="text-xl font-bold text-gray-900 mt-10 mb-3 flex items-center">{trimmed.replace('## ', '')}</h2>;
                }
                if (trimmed.startsWith('### ')) {
                   return <h3 key={i} className="text-lg font-bold text-gray-800 mt-6 mb-2 flex items-center"><span className="w-1.5 h-1.5 bg-brand-500 rounded-full mr-2"></span>{trimmed.replace('### ', '')}</h3>;
                }
                if (trimmed.startsWith('#### ')) {
                    // Special styling for barrier cards
                    return <h4 key={i} className="text-sm font-bold text-brand-600 uppercase tracking-wider mt-6 mb-1">{trimmed.replace('#### ', '')}</h4>;
                }
                if (trimmed.startsWith('>')) {
                   return (
                     <div key={i} className="my-6 p-5 bg-brand-50/50 border-l-4 border-brand-500 rounded-r-lg">
                       <p className="text-gray-800 font-medium italic">{renderText(trimmed.replace('>', ''))}</p>
                     </div>
                   );
                }
                if (trimmed.startsWith('* ')) {
                  return (
                    <li key={i} className="ml-4 list-disc marker:text-brand-500 pl-1 text-gray-600 mb-1">
                       {renderText(trimmed.replace('* ', ''))}
                    </li>
                  );
                }
                if (trimmed.startsWith('!ALERT')) {
                    return (
                        <div key={i} className="my-6 p-4 bg-orange-50 border border-orange-100 rounded-lg flex gap-3">
                            <AlertTriangle className="shrink-0 text-orange-500" size={20} />
                            <div className="text-sm text-orange-800">{renderText(trimmed.replace('!ALERT ', ''))}</div>
                        </div>
                    )
                }
                if (trimmed.startsWith('!LOCK')) {
                    return (
                        <div key={i} className="my-6 p-4 bg-gray-50 border border-gray-100 rounded-lg flex gap-3">
                            <Lock className="shrink-0 text-gray-500" size={20} />
                            <div className="text-sm text-gray-600">{renderText(trimmed.replace('!LOCK ', ''))}</div>
                        </div>
                    )
                }

                // Numbered lists rough heuristic
                if (/^\d+\./.test(trimmed)) {
                   return <p key={i} className="ml-4 font-medium text-gray-800 mt-3 mb-1">{renderText(trimmed)}</p>;
                }

                return <p key={i} className="text-gray-600">{renderText(trimmed)}</p>;
              })}
            </div>

            {/* Interactive Chart */}
            {activeChapter.diagramType !== 'none' && (
               <div className="mt-12 pt-8 border-t border-gray-100">
                  <div className="bg-gray-50 rounded-lg p-1 inline-block mb-4">
                    <span className="px-3 py-1 text-xs font-bold text-gray-500 uppercase tracking-wider">Interactive Figure</span>
                  </div>
                  <PriceChart type={activeChapter.diagramType as any} />
               </div>
            )}

            {/* Navigation Footer */}
            <div className="mt-16 pt-8 border-t border-gray-100 grid grid-cols-2 gap-4">
               {prevChapter ? (
                 <button 
                    onClick={() => setActiveChapterId(prevChapter.id)}
                    className="flex flex-col items-start p-4 rounded-xl border border-gray-200 hover:border-brand-300 hover:bg-gray-50 transition-all group text-left"
                 >
                    <span className="text-xs font-bold text-gray-400 uppercase mb-1 flex items-center group-hover:text-brand-600">
                      <ChevronLeft size={14} className="mr-1" /> Previous
                    </span>
                    <span className="font-bold text-sm lg:text-base text-gray-900 group-hover:text-brand-700 line-clamp-1">
                       {prevChapter.title.split('：')[1] || prevChapter.title}
                    </span>
                 </button>
               ) : <div />}

               {nextChapter ? (
                 <button 
                    onClick={() => setActiveChapterId(nextChapter.id)}
                    className="flex flex-col items-end p-4 rounded-xl border border-gray-200 hover:border-brand-300 hover:bg-gray-50 transition-all group text-right"
                 >
                    <span className="text-xs font-bold text-gray-400 uppercase mb-1 flex items-center group-hover:text-brand-600">
                      Next <ChevronRight size={14} className="ml-1" />
                    </span>
                    <span className="font-bold text-sm lg:text-base text-gray-900 group-hover:text-brand-700 line-clamp-1">
                       {nextChapter.title.split('：')[1] || nextChapter.title}
                    </span>
                 </button>
               ) : <div />}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Course;