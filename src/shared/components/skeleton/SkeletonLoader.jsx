import React from "react";

export default function SkeletonLoader({ count = 5 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="rounded-lg border border-slate-200 bg-white p-4 md:p-5 w-full animate-pulse"
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-200 rounded-md h-10 w-10 shrink-0"></div>
              <div className="flex-1">
                <div className="h-5 bg-slate-200 rounded w-32 mb-2"></div>
                <div className="h-3 bg-slate-100 rounded w-24"></div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
              <div className="h-6 bg-slate-200 rounded-2xl w-20"></div>
              <div className="h-4 w-px bg-slate-300 mx-1"></div>
              <div className="h-9 w-9 bg-slate-200 rounded-full"></div>
              <div className="h-9 w-9 bg-slate-200 rounded-full"></div>
              <div className="h-9 w-9 bg-slate-200 rounded-full"></div>
            </div>
          </div>

          {/* Grid Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 text-sm">
            {/* Coluna 1 */}
            <div className="lg:col-span-3">
              <div className="h-3 bg-slate-200 rounded w-16 mb-2"></div>
              <div className="h-4 bg-slate-100 rounded w-full"></div>
            </div>

            {/* Coluna 2 */}
            <div className="lg:col-span-4">
              <div className="h-3 bg-slate-200 rounded w-20 mb-2"></div>
              <div className="h-4 bg-slate-100 rounded w-full mb-1"></div>
              <div className="h-4 bg-slate-100 rounded w-3/4"></div>
            </div>

            {/* Coluna 3 */}
            <div className="lg:col-span-3">
              <div className="h-3 bg-slate-200 rounded w-20 mb-2"></div>
              <div className="h-4 bg-slate-100 rounded w-full"></div>
            </div>

            {/* Coluna 4 - Progress or Value */}
            <div className="lg:col-span-2">
              <div className="h-3 bg-slate-200 rounded w-24 mb-2"></div>
              <div className="h-2.5 bg-slate-100 rounded w-full"></div>
              <div className="h-2 bg-slate-100 rounded w-12 mt-1"></div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
