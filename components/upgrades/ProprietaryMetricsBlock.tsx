import { JSX } from "react";

interface ProprietaryMetricsBlockProps {
  processingScore: number;
  additiveLoadScore: number;
  nutrientDensityScore: number;
  overallGrade: string;
  commentary: string;
}

function getProcessingLevel(score: number): { label: string; color: string; ringColor: string; bg: string } {
  if (score >= 75) {
    return { label: "Ultra-processed", color: "text-red-700", ringColor: "stroke-red-500", bg: "bg-red-50" };
  }
  if (score >= 45) {
    return { label: "Moderately processed", color: "text-amber-700", ringColor: "stroke-amber-500", bg: "bg-amber-50" };
  }
  return { label: "Minimally processed", color: "text-green-700", ringColor: "stroke-green-500", bg: "bg-green-50" };
}

function getAdditiveLevel(score: number): { label: string; color: string; ringColor: string; bg: string } {
  if (score >= 60) {
    return { label: "High additive load", color: "text-purple-700", ringColor: "stroke-purple-500", bg: "bg-purple-50" };
  }
  if (score >= 30) {
    return { label: "Moderate additives", color: "text-slate-600", ringColor: "stroke-slate-400", bg: "bg-slate-50" };
  }
  return { label: "Additive-free / Low", color: "text-emerald-700", ringColor: "stroke-emerald-500", bg: "bg-emerald-50" };
}

function getNutrientLevel(score: number): { label: string; color: string; ringColor: string; bg: string } {
  if (score >= 75) {
    return { label: "High nutrient density", color: "text-green-700", ringColor: "stroke-green-600", bg: "bg-green-50" };
  }
  if (score >= 45) {
    return { label: "Moderate nutrients", color: "text-slate-600", ringColor: "stroke-slate-400", bg: "bg-slate-50" };
  }
  return { label: "Low density / Empty", color: "text-rose-700", ringColor: "stroke-rose-500", bg: "bg-rose-50" };
}

function getGradeStyles(grade: string): { badge: string; border: string; bg: string } {
  const cleanGrade = grade.charAt(0);
  switch (cleanGrade) {
    case "A":
      return { badge: "text-green-800 bg-green-100", border: "border-green-200", bg: "bg-green-50/30" };
    case "B":
      return { badge: "text-emerald-800 bg-emerald-100", border: "border-emerald-200", bg: "bg-emerald-50/30" };
    case "C":
      return { badge: "text-amber-950 bg-amber-100/70", border: "border-amber-100", bg: "bg-amber-50/20" };
    case "D":
    case "F":
    default:
      return { badge: "text-rose-800 bg-rose-100", border: "border-rose-200", bg: "bg-rose-50/30" };
  }
}

export function ProprietaryMetricsBlock({
  processingScore,
  additiveLoadScore,
  nutrientDensityScore,
  overallGrade,
  commentary,
}: ProprietaryMetricsBlockProps): JSX.Element {
  const processing = getProcessingLevel(processingScore);
  const additive = getAdditiveLevel(additiveLoadScore);
  const nutrient = getNutrientLevel(nutrientDensityScore);
  const gradeStyles = getGradeStyles(overallGrade);

  // SVG Circle parameters for progress gauge
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const processingDashoffset = circumference - (processingScore / 100) * circumference;
  const additiveDashoffset = circumference - (additiveLoadScore / 100) * circumference;
  const nutrientDashoffset = circumference - (nutrientDensityScore / 100) * circumference;

  return (
    <section
      data-upgrade="proprietary-metrics"
      aria-label="IngrediPeek Proprietary Food Safety and Suitability Ratings"
      className="not-prose my-8 rounded-xl border border-green-100 bg-white p-5 shadow-sm"
    >
      <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider font-sans">
        <svg
          aria-hidden="true"
          className="h-4.5 w-4.5 text-green-600"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.746 3.746 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
          />
        </svg>
        IngrediPeek Food Safety Index
      </h3>

      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Metric Gauges Row */}
        <div className="flex flex-row items-center gap-6 flex-shrink-0">
          {/* Processing Ring */}
          <div className="flex flex-col items-center">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 96 96">
                {/* Background Ring */}
                <circle
                  className="text-slate-100"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                  r={radius}
                  cx="48"
                  cy="48"
                />
                {/* Active Ring */}
                <circle
                  className={`${processing.ringColor} transition-all duration-500`}
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={processingDashoffset}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r={radius}
                  cx="48"
                  cy="48"
                />
              </svg>
              {/* Score Text */}
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-slate-800">{processingScore}</span>
                <span className="text-[8px] text-slate-400 font-semibold uppercase tracking-wider text-center max-w-[50px] leading-tight font-sans">Processing</span>
              </div>
            </div>
            <span className={`text-xs font-bold mt-2 ${processing.color} font-sans`}>{processing.label}</span>
          </div>

          {/* Additive Ring */}
          <div className="flex flex-col items-center">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 96 96">
                {/* Background Ring */}
                <circle
                  className="text-slate-100"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                  r={radius}
                  cx="48"
                  cy="48"
                />
                {/* Active Ring */}
                <circle
                  className={`${additive.ringColor} transition-all duration-500`}
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={additiveDashoffset}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r={radius}
                  cx="48"
                  cy="48"
                />
              </svg>
              {/* Score Text */}
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-slate-800">{additiveLoadScore}</span>
                <span className="text-[8px] text-slate-400 font-semibold uppercase tracking-wider text-center max-w-[50px] leading-tight font-sans">Additives</span>
              </div>
            </div>
            <span className={`text-xs font-bold mt-2 ${additive.color} font-sans`}>{additive.label}</span>
          </div>

          {/* Nutrient Density Ring */}
          <div className="flex flex-col items-center">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 96 96">
                {/* Background Ring */}
                <circle
                  className="text-slate-100"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                  r={radius}
                  cx="48"
                  cy="48"
                />
                {/* Active Ring */}
                <circle
                  className={`${nutrient.ringColor} transition-all duration-500`}
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={nutrientDashoffset}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r={radius}
                  cx="48"
                  cy="48"
                />
              </svg>
              {/* Score Text */}
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-slate-800">{nutrientDensityScore}</span>
                <span className="text-[8px] text-slate-400 font-semibold uppercase tracking-wider text-center max-w-[50px] leading-tight font-sans">Nutrients</span>
              </div>
            </div>
            <span className={`text-xs font-bold mt-2 ${nutrient.color} font-sans`}>{nutrient.label}</span>
          </div>
        </div>

        {/* Grade Badge and Commentary Section */}
        <div className="flex-1 flex flex-col sm:flex-row items-center sm:items-start gap-4 border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0 sm:pl-6 w-full">
          {/* Grade Badge Card */}
          <div className={`flex flex-col items-center justify-center border ${gradeStyles.border} ${gradeStyles.bg} rounded-xl px-5 py-4 w-28 text-center flex-shrink-0`}>
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1 font-sans">Safety Grade</span>
            <span className="text-4xl font-extrabold text-slate-800 tracking-tight leading-none my-1 font-sans">{overallGrade}</span>
            <span className={`inline-block text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full mt-2 ${gradeStyles.badge} font-sans`}>
              Calibrated
            </span>
          </div>

          {/* Expert Dynamic Commentary */}
          <div className="flex-1 flex flex-col justify-center">
            <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider mb-1 font-sans">Nutrition Analysis</span>
            <p className="text-xs text-slate-600 leading-relaxed font-normal font-sans">
              {commentary}
            </p>
            <div className="flex items-center gap-1 mt-3">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-600" />
              <span className="text-[9px] text-slate-400 font-medium font-sans">FDA &amp; EFSA Watchlist Calibrated</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
