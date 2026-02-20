import { useMemo } from 'react';
import { calculateSGPA, calculateCGPA, calculateSubjectResult, isSubjectComplete, getCGPAColor } from '../utils/gradeCalculator';
import { AlertTriangle, Award, Copy, CheckCircle } from 'lucide-react';
import { useState } from 'react';

const ResultsSummary = ({ semesters }) => {
    const [copied, setCopied] = useState(false);

    // Calculate results for each semester
    const semesterResults = useMemo(() => {
        return semesters.map((sem, idx) => {
            const sgpa = calculateSGPA(sem.subjects);
            const subjectResults = sem.subjects
                .filter(isSubjectComplete)
                .map((sub) => ({
                    ...sub,
                    result: calculateSubjectResult(sub),
                }));
            return { semNumber: idx + 1, sgpa, subjectResults };
        });
    }, [semesters]);

    // Calculate CGPA
    const cgpaResult = useMemo(() => {
        const completeSemesters = semesters.filter((sem) => {
            const sgpa = calculateSGPA(sem.subjects);
            return sgpa !== null;
        });

        if (completeSemesters.length === 0) return null;
        if (completeSemesters.length === 1) {
            const sgpa = calculateSGPA(completeSemesters[0].subjects);
            return { cgpa: sgpa.sgpa, totalCredits: sgpa.totalCredits, hasFailure: sgpa.hasFailure, isSingle: true };
        }

        const result = calculateCGPA(completeSemesters);
        return result ? { ...result, isSingle: false } : null;
    }, [semesters]);

    // Check if we have any results to show
    const hasResults = semesterResults.some((sr) => sr.subjectResults.length > 0);

    if (!hasResults) return null;

    const colorClass = cgpaResult ? getCGPAColor(cgpaResult.cgpa) : '';

    const getGradeBadgeClass = (grade) => {
        const map = {
            'O': 'grade-badge-O',
            'A+': 'grade-badge-Aplus',
            'A': 'grade-badge-A',
            'B+': 'grade-badge-Bplus',
            'B': 'grade-badge-B',
            'C': 'grade-badge-C',
            'P': 'grade-badge-P',
            'F': 'grade-badge-F',
        };
        return map[grade] || '';
    };

    const getGlowColor = () => {
        const map = {
            emerald: 'rgba(16, 185, 129, 0.15)',
            blue: 'rgba(59, 130, 246, 0.15)',
            amber: 'rgba(245, 158, 11, 0.15)',
            red: 'rgba(239, 68, 68, 0.15)',
        };
        return map[colorClass] || 'rgba(133, 133, 160, 0.1)';
    };

    const getBorderColor = () => {
        const map = {
            emerald: 'rgba(16, 185, 129, 0.3)',
            blue: 'rgba(59, 130, 246, 0.3)',
            amber: 'rgba(245, 158, 11, 0.3)',
            red: 'rgba(239, 68, 68, 0.3)',
        };
        return map[colorClass] || 'rgba(133, 133, 160, 0.15)';
    };

    // Check if sem2 is partially filled
    const sem2Partial = semesters.length === 2 && (() => {
        const sem2 = semesters[1];
        const sgpa = calculateSGPA(sem2.subjects);
        const hasAnyInput = sem2.subjects.some((s) => s.name || s.credits || s.courseType);
        return hasAnyInput && sgpa === null;
    })();

    const handleCopy = () => {
        let text = '📊 G-Marks — GPA Summary\n\n';

        semesterResults.forEach((sr) => {
            if (sr.subjectResults.length === 0) return;
            text += `Semester ${sr.semNumber}:\n`;
            sr.subjectResults.forEach((sub) => {
                text += `  • ${sub.name} (${sub.credits} cr, ${sub.courseType}) → ${sub.result.grade} (${sub.result.wgp.toFixed(2)})\n`;
            });
            if (sr.sgpa) {
                text += `  SGPA: ${sr.sgpa.sgpa.toFixed(2)}\n`;
            }
            text += '\n';
        });

        if (cgpaResult) {
            text += `${cgpaResult.isSingle ? 'CGPA (= SGPA)' : 'CGPA'}: ${cgpaResult.cgpa.toFixed(2)}\n`;
        }

        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="glass-card animate-fade-in-up overflow-hidden mb-6" id="results-summary">
            {/* Header */}
            <div className="p-5 border-b border-[rgba(133,133,160,0.1)]">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center shadow-lg">
                            <Award size={18} className="text-white" />
                        </div>
                        <div>
                            <h2 className="font-[var(--font-poppins)] text-lg font-bold text-white">
                                Results Summary
                            </h2>
                            <p className="text-xs text-[var(--color-surface-300)]">
                                Your computed grades and GPA
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleCopy}
                        className="btn-secondary text-xs"
                        id="copy-results"
                    >
                        {copied ? <CheckCircle size={14} className="text-emerald-400" /> : <Copy size={14} />}
                        {copied ? 'Copied!' : 'Copy Results'}
                    </button>
                </div>
            </div>

            {/* Semester Tables */}
            <div className="p-5">
                {semesterResults.map((sr) => {
                    if (sr.subjectResults.length === 0) return null;

                    return (
                        <div key={sr.semNumber} className="mb-6 last:mb-0">
                            <h3 className="text-sm font-semibold text-[var(--color-surface-300)] uppercase tracking-wider mb-3 font-[var(--font-poppins)]">
                                Semester {sr.semNumber}
                            </h3>

                            <div className="overflow-x-auto rounded-xl border border-[rgba(133,133,160,0.08)]">
                                <table className="results-table">
                                    <thead>
                                        <tr className="bg-[rgba(133,133,160,0.04)]">
                                            <th>Subject</th>
                                            <th className="text-center">Credits</th>
                                            <th className="text-center">Type</th>
                                            <th className="text-center">WGP</th>
                                            <th className="text-center">Grade</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sr.subjectResults.map((sub) => (
                                            <tr key={sub.id}>
                                                <td>
                                                    <span className="subject-name-cell block" title={sub.name}>
                                                        {sub.name}
                                                    </span>
                                                </td>
                                                <td className="text-center font-mono font-medium">{sub.credits}</td>
                                                <td className="text-center">
                                                    <span className="text-xs px-2 py-1 rounded-md bg-[rgba(133,133,160,0.08)] text-[var(--color-surface-300)] font-medium">
                                                        {sub.courseType}
                                                    </span>
                                                </td>
                                                <td className="text-center font-mono font-semibold text-white">
                                                    {sub.result.wgp.toFixed(2)}
                                                </td>
                                                <td className="text-center">
                                                    <span className={`grade-badge ${getGradeBadgeClass(sub.result.grade)}`}>
                                                        {sub.result.grade}
                                                        {sub.result.isFail && ' ✗'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Semester SGPA inline */}
                            {sr.sgpa && (
                                <div className="flex items-center justify-between mt-3 px-2">
                                    <span className="text-xs text-[var(--color-surface-300)]">
                                        Semester {sr.semNumber} SGPA
                                    </span>
                                    <span className="font-mono font-bold text-white text-sm">
                                        {sr.sgpa.sgpa.toFixed(2)}
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* Sem 2 partial warning */}
                {sem2Partial && (
                    <div className="warning-banner mb-4 animate-fade-in">
                        <AlertTriangle size={16} />
                        <span>Complete Semester 2 to calculate CGPA</span>
                    </div>
                )}

                {/* CGPA Card */}
                {cgpaResult && (
                    <div
                        className="rounded-2xl p-6 text-center animate-fade-in"
                        style={{
                            background: `linear-gradient(135deg, ${getGlowColor()}, rgba(15, 15, 18, 0.8))`,
                            border: `1px solid ${getBorderColor()}`,
                        }}
                    >
                        <p className="text-xs font-medium text-[var(--color-surface-300)] uppercase tracking-widest mb-2">
                            {cgpaResult.isSingle ? 'CGPA (= SGPA)' : 'Cumulative GPA'}
                        </p>
                        <div className={`gpa-display text-5xl mb-2 gpa-display-${colorClass} animate-counter`}>
                            {cgpaResult.cgpa.toFixed(2)}
                        </div>
                        <p className="text-xs text-[var(--color-surface-400)]">
                            {cgpaResult.totalCredits} total credits
                        </p>

                        {/* Scholarship badge */}
                        {cgpaResult.cgpa >= 8.0 && !cgpaResult.hasFailure && (
                            <div className="scholarship-badge mt-4 justify-center">
                                 Safe!
                            </div>
                        )}

                        {/* Failure warning */}
                        {cgpaResult.hasFailure && (
                            <div className="warning-banner mt-4 justify-center">
                                <AlertTriangle size={16} />
                                <span>One or more subjects have F grade</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResultsSummary;
