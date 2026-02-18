import { useState, useEffect, useMemo, useCallback } from 'react';
import { GRADE_OPTIONS, COURSE_TYPES, GRADE_TOOLTIPS, createEmptySubject } from '../utils/constants';
import { calculateSubjectResult, validateCredits, validateLabMarks, isSubjectComplete } from '../utils/gradeCalculator';
import { Trash2, AlertTriangle, Info } from 'lucide-react';

const SubjectRow = ({ subject, onChange, onDelete, canDelete, index }) => {
    const [creditsError, setCreditsError] = useState(null);
    const [labMarksError, setLabMarksError] = useState(null);
    const [nameError, setNameError] = useState(false);

    const result = useMemo(() => {
        if (isSubjectComplete(subject)) {
            return calculateSubjectResult(subject);
        }
        return null;
    }, [subject]);

    const handleFieldChange = useCallback((field, value) => {
        // Validate credits
        if (field === 'credits') {
            // Block non-numeric and decimal
            if (value !== '' && (!/^\d+$/.test(value))) {
                setCreditsError('Credits must be a whole number');
                return;
            }
            const validation = validateCredits(value);
            setCreditsError(validation.error);
        }

        // Validate lab marks
        if (field === 'labMarks') {
            if (value !== '' && !/^\d+$/.test(value)) {
                setLabMarksError('Enter a valid number');
                return;
            }
            const num = parseInt(value, 10);
            if (!isNaN(num) && num > 100) {
                setLabMarksError('Marks cannot exceed 100');
                return;
            }
            const validation = validateLabMarks(value);
            setLabMarksError(validation.error);
        }

        // Validate name
        if (field === 'name') {
            setNameError(false);
            if (value.length > 60) return;
        }

        // Reset grade fields when course type changes
        if (field === 'courseType') {
            onChange(subject.id, {
                ...subject,
                courseType: value,
                s1Grade: '',
                s2Grade: '',
                leGrade: '',
                labMarks: '',
            });
            return;
        }

        onChange(subject.id, { ...subject, [field]: value });
    }, [subject, onChange]);

    const getGradeBadgeClass = (grade) => {
        if (!grade) return '';
        const map = {
            'O': 'grade-badge-O',
            'A+': 'grade-badge-Aplus',
            'A': 'grade-badge-A',
            'B+': 'grade-badge-Bplus',
            'B': 'grade-badge-B',
            'C': 'grade-badge-C',
            'P': 'grade-badge-P',
            'F': 'grade-badge-F',
            'I': 'grade-badge-I',
        };
        return map[grade] || '';
    };

    const showTheoryInputs = subject.courseType === 'T' || subject.courseType === 'TP';
    const showPracticalInput = subject.courseType === 'P' || subject.courseType === 'TP';

    return (
        <div className="subject-row-enter glass-card-light p-4 md:p-5 mb-3" style={{ animationDelay: `${index * 0.05}s` }}>
            {/* Top row: Name, Credits, Type, Delete */}
            <div className="flex flex-col md:flex-row gap-3 mb-3">
                {/* Subject Name */}
                <div className="flex-1 min-w-0">
                    <label className="block text-xs font-medium text-[var(--color-surface-300)] mb-1.5 font-[var(--font-inter)]">
                        Subject Name
                    </label>
                    <input
                        type="text"
                        className={`input-field ${nameError ? 'input-field-error' : ''}`}
                        placeholder="e.g. Data Structures"
                        value={subject.name}
                        onChange={(e) => handleFieldChange('name', e.target.value)}
                        onBlur={() => {
                            if (!subject.name.trim() && (subject.credits || subject.courseType)) {
                                setNameError(true);
                            }
                        }}
                        maxLength={60}
                        id={`subject-name-${subject.id}`}
                    />
                    {nameError && (
                        <p className="text-xs text-red-400 mt-1 animate-fade-in">Subject name is required</p>
                    )}
                </div>

                {/* Credits */}
                <div className="w-full md:w-24">
                    <label className="block text-xs font-medium text-[var(--color-surface-300)] mb-1.5">
                        Credits
                    </label>
                    <input
                        type="text"
                        inputMode="numeric"
                        className={`input-field text-center ${creditsError ? 'input-field-error' : ''}`}
                        placeholder="1-6"
                        value={subject.credits}
                        onChange={(e) => handleFieldChange('credits', e.target.value)}
                        id={`subject-credits-${subject.id}`}
                    />
                    {creditsError && (
                        <p className="text-xs text-red-400 mt-1 animate-fade-in">{creditsError}</p>
                    )}
                </div>

                {/* Course Type */}
                <div className="w-full md:w-48">
                    <label className="block text-xs font-medium text-[var(--color-surface-300)] mb-1.5">
                        Course Type
                    </label>
                    <select
                        className="input-field"
                        value={subject.courseType}
                        onChange={(e) => handleFieldChange('courseType', e.target.value)}
                        id={`subject-type-${subject.id}`}
                    >
                        {COURSE_TYPES.map((ct) => (
                            <option key={ct.value} value={ct.value} disabled={ct.value === ''}>
                                {ct.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Delete Button */}
                {canDelete && (
                    <div className="flex items-end">
                        <button
                            onClick={() => onDelete(subject.id)}
                            className="btn-danger h-[42px]"
                            title="Remove subject"
                            id={`delete-subject-${subject.id}`}
                        >
                            <Trash2 size={15} />
                            <span className="md:hidden">Remove</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Grade Inputs - conditional based on course type */}
            {subject.courseType && (
                <div className="animate-slide-down">
                    <div className="h-px bg-[rgba(133,133,160,0.08)] my-3"></div>

                    <div className="flex flex-col md:flex-row gap-3">
                        {/* Theory grade inputs */}
                        {showTheoryInputs && (
                            <>
                                <div className="flex-1">
                                    <label className="block text-xs font-medium text-[var(--color-surface-300)] mb-1.5">
                                        Sessional 1 Grade
                                    </label>
                                    <select
                                        className="input-field"
                                        value={subject.s1Grade}
                                        onChange={(e) => handleFieldChange('s1Grade', e.target.value)}
                                        id={`subject-s1-${subject.id}`}
                                    >
                                        {GRADE_OPTIONS.map((g) => (
                                            <option key={g.value} value={g.value} disabled={g.value === ''}>
                                                {g.value ? `${g.value} (${g.gp})` : g.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex-1">
                                    <label className="block text-xs font-medium text-[var(--color-surface-300)] mb-1.5">
                                        Sessional 2 Grade
                                    </label>
                                    <select
                                        className="input-field"
                                        value={subject.s2Grade}
                                        onChange={(e) => handleFieldChange('s2Grade', e.target.value)}
                                        id={`subject-s2-${subject.id}`}
                                    >
                                        {GRADE_OPTIONS.map((g) => (
                                            <option key={g.value} value={g.value} disabled={g.value === ''}>
                                                {g.value ? `${g.value} (${g.gp})` : g.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex-1">
                                    <label className="block text-xs font-medium text-[var(--color-surface-300)] mb-1.5">
                                        Learning Engagement
                                    </label>
                                    <select
                                        className="input-field"
                                        value={subject.leGrade}
                                        onChange={(e) => handleFieldChange('leGrade', e.target.value)}
                                        id={`subject-le-${subject.id}`}
                                    >
                                        {GRADE_OPTIONS.map((g) => (
                                            <option key={g.value} value={g.value} disabled={g.value === ''}>
                                                {g.value ? `${g.value} (${g.gp})` : g.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </>
                        )}

                        {/* Practical marks input */}
                        {showPracticalInput && (
                            <div className={showTheoryInputs ? 'flex-1' : 'w-full md:w-48'}>
                                <label className="block text-xs font-medium text-[var(--color-surface-300)] mb-1.5">
                                    Lab Marks (out of 100)
                                </label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    className={`input-field ${labMarksError ? 'input-field-error' : ''}`}
                                    placeholder="0 – 100"
                                    value={subject.labMarks}
                                    onChange={(e) => handleFieldChange('labMarks', e.target.value)}
                                    id={`subject-lab-${subject.id}`}
                                />
                                {labMarksError && (
                                    <p className="text-xs text-red-400 mt-1 animate-fade-in">{labMarksError}</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Incomplete grades warning */}
                    {subject.courseType && !result && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-[var(--color-surface-300)]">
                            <Info size={13} />
                            <span>
                                {subject.courseType === 'T' && 'Select all three grades to see WGP'}
                                {subject.courseType === 'P' && 'Enter lab marks to see grade'}
                                {subject.courseType === 'TP' && 'Fill all grades and lab marks to see WGP'}
                            </span>
                        </div>
                    )}

                    {/* Result Badge */}
                    {result && (
                        <div className="mt-3 flex items-center gap-3 animate-fade-in">
                            <div className={`grade-badge ${getGradeBadgeClass(result.grade)}`}>
                                {result.grade}
                                <span className="opacity-70">({result.gp})</span>
                            </div>
                            <span className="text-xs text-[var(--color-surface-300)]">
                                WGP: <span className="font-mono font-semibold text-[#e4e4eb]">{result.wgp.toFixed(2)}</span>
                            </span>
                            {result.isFail && (
                                <span className="flex items-center gap-1 text-xs text-red-400 font-medium">
                                    <AlertTriangle size={13} /> Subject not cleared
                                </span>
                            )}
                            {(subject.s1Grade === 'I' || subject.s2Grade === 'I' || subject.leGrade === 'I') && !result.isFail && (
                                <span className="flex items-center gap-1 text-xs text-amber-400">
                                    <AlertTriangle size={13} /> Incomplete grade detected
                                </span>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SubjectRow;
