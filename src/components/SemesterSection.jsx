import { useState, useMemo, useCallback } from 'react';
import SubjectRow from './SubjectRow';
import { createEmptySubject } from '../utils/constants';
import { calculateSGPA } from '../utils/gradeCalculator';
import { Plus, ChevronDown, ChevronUp, AlertTriangle, BookOpen } from 'lucide-react';

let subjectCounter = 1;

const SemesterSection = ({ semester, onUpdate, onRemove, semesterNumber, canRemove }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    const sgpaResult = useMemo(() => {
        return calculateSGPA(semester.subjects);
    }, [semester.subjects]);

    const handleSubjectChange = useCallback((subjectId, updatedSubject) => {
        const newSubjects = semester.subjects.map((s) =>
            s.id === subjectId ? updatedSubject : s
        );
        onUpdate({ ...semester, subjects: newSubjects });
    }, [semester, onUpdate]);

    const handleAddSubject = useCallback(() => {
        subjectCounter++;
        const newSubject = createEmptySubject(`${semester.id}-sub-${subjectCounter}-${Date.now()}`);
        onUpdate({ ...semester, subjects: [...semester.subjects, newSubject] });
    }, [semester, onUpdate]);

    const handleDeleteSubject = useCallback((subjectId) => {
        if (semester.subjects.length <= 1) return;
        const newSubjects = semester.subjects.filter((s) => s.id !== subjectId);
        onUpdate({ ...semester, subjects: newSubjects });
    }, [semester, onUpdate]);

    const getColorClass = () => {
        if (!sgpaResult) return '';
        const sgpa = sgpaResult.sgpa;
        if (sgpa >= 9.0) return 'gpa-display-emerald';
        if (sgpa >= 7.5) return 'gpa-display-blue';
        if (sgpa >= 6.0) return 'gpa-display-amber';
        return 'gpa-display-red';
    };

    return (
        <div className="glass-card mb-6 animate-fade-in-up overflow-hidden">
            {/* Semester Header */}
            <div
                className="flex items-center justify-between p-5 cursor-pointer select-none hover:bg-[rgba(133,133,160,0.04)] transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
                id={`semester-header-${semesterNumber}`}
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-brand-600)] to-[var(--color-brand-800)] flex items-center justify-center shadow-lg">
                        <BookOpen size={18} className="text-white" />
                    </div>
                    <div>
                        <h2 className="font-[var(--font-poppins)] text-lg font-bold text-white">
                            Semester {semesterNumber}
                        </h2>
                        <p className="text-xs text-[var(--color-surface-300)]">
                            {semester.subjects.length} subject{semester.subjects.length !== 1 ? 's' : ''}
                            {sgpaResult && ` • SGPA: ${sgpaResult.sgpa.toFixed(2)}`}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {canRemove && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemove();
                            }}
                            className="btn-danger text-xs"
                            id={`remove-semester-${semesterNumber}`}
                        >
                            × Remove
                        </button>
                    )}
                    {isExpanded ? (
                        <ChevronUp size={20} className="text-[var(--color-surface-300)]" />
                    ) : (
                        <ChevronDown size={20} className="text-[var(--color-surface-300)]" />
                    )}
                </div>
            </div>

            {/* Expandable Content */}
            {isExpanded && (
                <div className="px-5 pb-5 animate-slide-down">
                    {/* Subject Rows */}
                    {semester.subjects.map((subject, index) => (
                        <SubjectRow
                            key={subject.id}
                            subject={subject}
                            onChange={handleSubjectChange}
                            onDelete={handleDeleteSubject}
                            canDelete={semester.subjects.length > 1}
                            index={index}
                        />
                    ))}

                    {/* Empty State */}
                    {semester.subjects.length === 0 && (
                        <div className="text-center py-10 text-[var(--color-surface-300)]">
                            <BookOpen size={36} className="mx-auto mb-3 opacity-40" />
                            <p className="text-sm">No subjects added. Click below to add one.</p>
                        </div>
                    )}

                    {/* Add Subject Button */}
                    <button
                        onClick={handleAddSubject}
                        className="btn-primary w-full justify-center mt-2"
                        id={`add-subject-sem-${semesterNumber}`}
                    >
                        <Plus size={16} />
                        Add Subject
                    </button>

                    {/* SGPA Card */}
                    {sgpaResult && (
                        <div className="mt-4 glass-card-light p-4 flex items-center justify-between animate-fade-in">
                            <div>
                                <p className="text-xs font-medium text-[var(--color-surface-300)] uppercase tracking-wider mb-1">
                                    Semester {semesterNumber} SGPA
                                </p>
                                <p className="text-xs text-[var(--color-surface-400)]">
                                    {sgpaResult.completeCount} subject{sgpaResult.completeCount !== 1 ? 's' : ''} • {sgpaResult.totalCredits} credits
                                </p>
                            </div>
                            <div className={`gpa-display ${getColorClass()} animate-counter`}>
                                {sgpaResult.sgpa.toFixed(2)}
                            </div>
                        </div>
                    )}

                    {/* Failure warning */}
                    {sgpaResult?.hasFailure && (
                        <div className="warning-banner mt-3 animate-fade-in">
                            <AlertTriangle size={16} />
                            <span>One or more subjects have F grade. SGPA may be impacted.</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SemesterSection;
