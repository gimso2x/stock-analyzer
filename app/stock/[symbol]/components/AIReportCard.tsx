'use client';

import React, { useState } from 'react';
import { Bot, Sparkles, RefreshCw, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';

interface AIReportCardProps {
  report?: {
    report: string;
    symbol: string;
  };
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

const AIReportCard: React.FC<AIReportCardProps> = ({ report, isLoading, isError, refetch }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (isLoading) {
    return (
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-emerald-100 p-4 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-600"></div>

        <div className="flex items-center space-x-3 mb-4 sm:mb-6">
          <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg shadow-emerald-200">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 flex items-center">
              AI 기술 분석 리포트
              <Sparkles className="w-4 h-4 ml-2 text-amber-400 fill-amber-400" />
            </h3>
            <p className="text-xs text-slate-500 font-medium tracking-wide italic">POWERED BY NVIDIA NIM (LLAMA 3.1 70B)</p>
          </div>
        </div>

        <div className="space-y-4 animate-pulse">
          <div className="h-4 w-full bg-slate-100 rounded-md"></div>
          <div className="h-4 w-5/6 bg-slate-100 rounded-md"></div>
          <div className="h-4 w-4/6 bg-slate-100 rounded-md"></div>
          <div className="h-4 w-full bg-slate-100 rounded-md"></div>
          <div className="h-4 w-3/4 bg-slate-100 rounded-md"></div>
          <div className="h-4 w-5/6 bg-slate-100 rounded-md"></div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-red-100 p-6 sm:p-8 shadow-xl text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-900 mb-2">리포트를 가져오지 못했습니다</h3>
        <p className="text-slate-500 mb-6 text-sm">NVIDIA API 연결을 확인하거나 나중에 다시 시도해주세요.</p>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors font-medium"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          다시 시도
        </button>
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="group bg-white/90 backdrop-blur-2xl rounded-2xl sm:rounded-3xl border border-emerald-100 p-4 sm:p-8 shadow-2xl shadow-emerald-900/5 relative overflow-hidden transition-all duration-300 hover:shadow-emerald-900/10">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-600 opacity-80"></div>
      
      {/* Background Micro-animation */}
      <div className="absolute -right-16 -top-16 w-48 h-48 bg-emerald-50 rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition-opacity"></div>
      
      <div 
        className="flex items-center justify-between mb-4 cursor-pointer relative z-10 select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg shadow-emerald-200">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 flex items-center">
              AI 기술 분석 리포트
              <Sparkles className="w-4 h-4 ml-2 text-amber-400 fill-amber-400" />
            </h3>
            <p className="text-xs text-slate-500 font-medium tracking-wide italic">POWERED BY NVIDIA NIM (LLAMA 3.1 70B)</p>
          </div>
        </div>
        <div className="p-2 hover:bg-slate-50 rounded-full transition-colors">
          {isExpanded ? (
            <ChevronUp className="w-6 h-6 text-slate-400" />
          ) : (
            <ChevronDown className="w-6 h-6 text-slate-400" />
          )}
        </div>
      </div>

      <div 
        className={`transition-all duration-700 ease-in-out relative overflow-hidden z-10 ${
          isExpanded ? 'opacity-100 mt-4 h-auto' : 'max-h-0 opacity-0 mt-0 pointer-events-none'
        }`}
      >
        <div className="prose-none max-w-none text-slate-600">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw, rehypeHighlight]}
            components={{
            h1: (props) => <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-8 mb-4 tracking-tight border-b-2 border-emerald-500 pb-2" {...props} />,
            h2: (props) => <h2 className="text-lg sm:text-xl font-bold text-slate-800 mt-8 mb-3 flex items-center before:content-[''] before:w-1 before:h-5 before:bg-emerald-500 before:mr-2 before:rounded-full" {...props} />,
            h3: (props) => <h3 className="text-base sm:text-lg font-bold text-slate-800 mt-6 mb-2" {...props} />,
              p: (props) => <p className="leading-relaxed mb-4 text-[15px] opacity-90" {...props} />,
              ul: (props) => <ul className="list-none space-y-2 mb-6" {...props} />,
              li: (props) => (
                <li className="flex items-start before:content-['•'] before:text-emerald-500 before:font-bold before:mr-2 text-slate-600" {...props} />
              ),
              table: (props) => (
                <div className="my-8 overflow-hidden rounded-2xl border border-slate-100 shadow-sm bg-white overflow-x-auto">
                  <table className="w-full text-sm text-left border-collapse" {...props} />
                </div>
              ),
              thead: (props) => <thead className="bg-slate-50/80 backdrop-blur-sm" {...props} />,
              th: (props) => <th className="px-5 py-3 font-bold text-slate-700 border-b border-slate-100" {...props} />,
              td: (props) => <td className="px-5 py-3 border-b border-slate-50 text-slate-600" {...props} />,
              strong: (props) => <strong className="font-bold text-slate-900 bg-emerald-50/80 px-1 rounded mx-0.5" {...props} />,
              hr: (props) => <hr className="my-10 border-slate-100" {...props} />,
              blockquote: (props) => (
                <blockquote className="border-l-4 border-emerald-200 bg-emerald-50/30 p-4 rounded-r-xl my-6 italic text-slate-700" {...props} />
              ),
            }}
          >
            {report.report}
          </ReactMarkdown>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">실시간 지표 기반 분석</span>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              refetch();
            }}
            className="text-slate-400 hover:text-emerald-600 transition-colors p-1"
            title="리포트 새로고침"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {!isExpanded && (
        <div className="mt-2 text-center relative z-10">
          <p className="text-xs text-slate-400 italic">클릭하여 리포트 내용 보기</p>
        </div>
      )}
    </div>
  );
};

export default AIReportCard;
