import { useState, useCallback, useMemo } from 'react';
import SemesterSection from './components/SemesterSection';
import ResultsSummary from './components/ResultsSummary';
import Footer from './components/Footer';
import { createEmptySemester } from './utils/constants';
import { calculateSGPA } from './utils/gradeCalculator';
import { Plus, RotateCcw, GraduationCap, Sparkles } from 'lucide-react';

const App = () => {
  const [semesters, setSemesters] = useState([createEmptySemester('sem-1')]);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Check if Sem 1 has at least 1 complete subject
  const canAddSemester2 = useMemo(() => {
    if (semesters.length >= 2) return false;
    const sgpa = calculateSGPA(semesters[0].subjects);
    return sgpa !== null;
  }, [semesters]);

  const handleSemesterUpdate = useCallback((index, updatedSemester) => {
    setSemesters((prev) => {
      const newSems = [...prev];
      newSems[index] = updatedSemester;
      return newSems;
    });
  }, []);

  const handleAddSemester2 = useCallback(() => {
    if (semesters.length >= 2) return;
    setSemesters((prev) => [...prev, createEmptySemester('sem-2')]);
  }, [semesters.length]);

  const handleRemoveSemester2 = useCallback(() => {
    setSemesters((prev) => prev.slice(0, 1));
  }, []);

  const handleReset = useCallback(() => {
    setSemesters([createEmptySemester('sem-1-' + Date.now())]);
    setShowResetConfirm(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* ===== HEADER ===== */}
      <header className="relative z-10" id="header">
        <div className="relative z-10 max-w-4xl mx-auto px-4 py-12 md:py-16 text-center">
          {/* Decorative line */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-[rgba(255,255,255,0.3)]"></div>
            <span className="text-xs font-medium uppercase tracking-[0.25em] text-[rgba(255,255,255,0.5)]">
              GITAM University
            </span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-[rgba(255,255,255,0.3)]"></div>
          </div>

          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/20 shadow-xl">
              <GraduationCap size={28} className="text-white" />
            </div>
            <h1 className="font-[var(--font-poppins)] text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              G<span className="text-[rgba(255,255,255,0.6)]">-</span>Marks
            </h1>
          </div>

          <p className="text-base md:text-lg text-[rgba(255,255,255,0.7)] font-light max-w-md mx-auto">
            Your GITAM GPA Calculator
          </p>
          <p className="text-xs text-[rgba(255,255,255,0.4)] mt-2 flex items-center justify-center gap-1.5">
            <Sparkles size={12} />
            Based on Evaluation Policy 2025–26
          </p>
        </div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 md:py-12 relative z-10">
        {/* Semesters */}
        {semesters.map((sem, idx) => (
          <SemesterSection
            key={sem.id}
            semester={sem}
            semesterNumber={idx + 1}
            onUpdate={(updated) => handleSemesterUpdate(idx, updated)}
            onRemove={idx === 1 ? handleRemoveSemester2 : undefined}
            canRemove={idx === 1}
          />
        ))}

        {/* Add Semester 2 Button */}
        {semesters.length < 2 && (
          <div className="mb-8 animate-fade-in">
            <button
              onClick={handleAddSemester2}
              disabled={!canAddSemester2}
              className={`w-full py-4 rounded-2xl border-2 border-dashed transition-all duration-300 flex items-center justify-center gap-2 font-medium text-sm ${canAddSemester2
                ? 'border-[var(--color-brand-600)] text-[var(--color-brand-400)] hover:bg-[rgba(214,40,40,0.06)] hover:border-[var(--color-brand-500)] cursor-pointer'
                : 'border-[rgba(133,133,160,0.1)] text-[var(--color-surface-400)] cursor-not-allowed opacity-50'
                }`}
              id="add-semester-2"
            >
              <Plus size={18} />
              Add Semester 2
            </button>
            {!canAddSemester2 && semesters.length === 1 && (
              <p className="text-xs text-[var(--color-surface-400)] text-center mt-2">
                Complete at least 1 subject in Semester 1 to unlock
              </p>
            )}
          </div>
        )}

        {/* Results Summary */}
        <ResultsSummary semesters={semesters} />

        {/* Reset Button */}
        <div className="text-center mt-6 mb-4">
          {!showResetConfirm ? (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="btn-secondary"
              id="reset-button"
            >
              <RotateCcw size={15} />
              Reset / Start Over
            </button>
          ) : (
            <div className="inline-flex items-center gap-3 glass-card-light px-5 py-3 animate-fade-in">
              <span className="text-sm text-[var(--color-surface-300)]">Clear everything?</span>
              <button
                onClick={handleReset}
                className="btn-danger"
                id="confirm-reset"
              >
                Yes, Reset
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="btn-secondary text-xs"
                id="cancel-reset"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </main>

      {/* ===== FOOTER ===== */}
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
};

export default App;
