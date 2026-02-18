import {
    GRADE_OPTIONS,
    PRACTICAL_GRADE_TABLE,
    WGP_TO_GRADE,
    THEORY_WEIGHTS,
    TP_WEIGHTS,
} from './constants';

/**
 * Get grade point from a grade value string (e.g., 'A+' → 9)
 */
export const getGradePoint = (gradeValue) => {
    const found = GRADE_OPTIONS.find((g) => g.value === gradeValue);
    return found ? found.gp : null;
};

/**
 * Get grade info from practical marks (absolute grading)
 */
export const getPracticalGrade = (marks) => {
    const m = parseInt(marks, 10);
    if (isNaN(m) || m < 0 || m > 100) return null;
    return PRACTICAL_GRADE_TABLE.find((g) => m >= g.min && m <= g.max) || null;
};

/**
 * Calculate WGP for a Theory course
 * WGP = (S1_GP × 0.30) + (S2_GP × 0.45) + (LE_GP × 0.25)
 */
export const calculateTheoryWGP = (s1Grade, s2Grade, leGrade) => {
    const s1 = getGradePoint(s1Grade);
    const s2 = getGradePoint(s2Grade);
    const le = getGradePoint(leGrade);

    if (s1 === null || s2 === null || le === null) return null;

    return s1 * THEORY_WEIGHTS.S1 + s2 * THEORY_WEIGHTS.S2 + le * THEORY_WEIGHTS.LE;
};

/**
 * Calculate GP for a Practical course from marks
 */
export const calculatePracticalGP = (marks) => {
    const gradeInfo = getPracticalGrade(marks);
    return gradeInfo ? gradeInfo.gp : null;
};

/**
 * Calculate final GP for Theory cum Practical (TP)
 * TP_GP = (Theory_GP × 0.70) + (Practical_GP × 0.30)
 */
export const calculateTPGP = (s1Grade, s2Grade, leGrade, labMarks) => {
    const theoryWGP = calculateTheoryWGP(s1Grade, s2Grade, leGrade);
    const practicalGP = calculatePracticalGP(labMarks);

    if (theoryWGP === null || practicalGP === null) return null;

    return theoryWGP * TP_WEIGHTS.theory + practicalGP * TP_WEIGHTS.practical;
};

/**
 * Map a WGP value to a letter grade using Annexure-IV
 */
export const getLetterGrade = (wgp) => {
    if (wgp === null || wgp === undefined) return null;

    // Handle exact 4.00 case
    if (wgp === 4.00) {
        return WGP_TO_GRADE.find((g) => g.grade === 'P');
    }

    for (const entry of WGP_TO_GRADE) {
        if (entry.grade === 'P') continue; // skip exact match entry
        if (wgp >= entry.min && wgp <= entry.max) return entry;
    }

    // Fallback to F
    return WGP_TO_GRADE.find((g) => g.grade === 'F');
};

/**
 * Calculate the final GP for any subject based on its course type
 * Returns { wgp, grade, gp, label, isFail }
 */
export const calculateSubjectResult = (subject) => {
    const { courseType, s1Grade, s2Grade, leGrade, labMarks } = subject;

    let wgp = null;

    switch (courseType) {
        case 'T':
            wgp = calculateTheoryWGP(s1Grade, s2Grade, leGrade);
            break;
        case 'P':
            wgp = calculatePracticalGP(labMarks);
            break;
        case 'TP':
            wgp = calculateTPGP(s1Grade, s2Grade, leGrade, labMarks);
            break;
        default:
            return null;
    }

    if (wgp === null) return null;

    const gradeInfo = getLetterGrade(wgp);
    if (!gradeInfo) return null;

    return {
        wgp: Math.round(wgp * 100) / 100,
        grade: gradeInfo.grade,
        gp: gradeInfo.gp,
        label: gradeInfo.label,
        isFail: gradeInfo.grade === 'F',
    };
};

/**
 * Check if a subject has all required fields filled
 */
export const isSubjectComplete = (subject) => {
    const { name, credits, courseType } = subject;

    if (!name.trim() || !credits || !courseType) return false;

    const c = parseInt(credits, 10);
    if (isNaN(c) || c < 1 || c > 6) return false;

    switch (courseType) {
        case 'T':
            return !!subject.s1Grade && !!subject.s2Grade && !!subject.leGrade;
        case 'P':
            return subject.labMarks !== '' && !isNaN(parseInt(subject.labMarks, 10));
        case 'TP':
            return (
                !!subject.s1Grade &&
                !!subject.s2Grade &&
                !!subject.leGrade &&
                subject.labMarks !== '' &&
                !isNaN(parseInt(subject.labMarks, 10))
            );
        default:
            return false;
    }
};

/**
 * Calculate SGPA for a semester
 * SGPA = Σ(Course_GP × Credits) / Σ(Credits)
 */
export const calculateSGPA = (subjects) => {
    let totalWeighted = 0;
    let totalCredits = 0;
    let hasFailure = false;
    let completeCount = 0;

    for (const subject of subjects) {
        if (!isSubjectComplete(subject)) continue;

        const result = calculateSubjectResult(subject);
        if (!result) continue;

        completeCount++;
        const credits = parseInt(subject.credits, 10);
        totalWeighted += result.gp * credits;
        totalCredits += credits;

        if (result.isFail) hasFailure = true;
    }

    if (totalCredits === 0) return null;

    return {
        sgpa: Math.round((totalWeighted / totalCredits) * 100) / 100,
        totalCredits,
        completeCount,
        hasFailure,
    };
};

/**
 * Calculate CGPA across multiple semesters
 */
export const calculateCGPA = (semesters) => {
    let totalWeighted = 0;
    let totalCredits = 0;
    let hasFailure = false;

    for (const sem of semesters) {
        for (const subject of sem.subjects) {
            if (!isSubjectComplete(subject)) continue;

            const result = calculateSubjectResult(subject);
            if (!result) continue;

            const credits = parseInt(subject.credits, 10);
            totalWeighted += result.gp * credits;
            totalCredits += credits;

            if (result.isFail) hasFailure = true;
        }
    }

    if (totalCredits === 0) return null;

    return {
        cgpa: Math.round((totalWeighted / totalCredits) * 100) / 100,
        totalCredits,
        hasFailure,
    };
};

/**
 * Get the CGPA color class
 */
export const getCGPAColor = (cgpa) => {
    if (cgpa >= 9.0) return 'emerald';
    if (cgpa >= 7.5) return 'blue';
    if (cgpa >= 6.0) return 'amber';
    return 'red';
};

/**
 * Validate credits input
 */
export const validateCredits = (value) => {
    if (value === '') return { valid: true, error: null };
    const num = parseInt(value, 10);
    if (isNaN(num) || value.includes('.')) return { valid: false, error: 'Credits must be a whole number' };
    if (num < 1) return { valid: false, error: 'Credits must be at least 1' };
    if (num > 6) return { valid: false, error: 'Credits cannot exceed 6' };
    return { valid: true, error: null };
};

/**
 * Validate lab marks input
 */
export const validateLabMarks = (value) => {
    if (value === '') return { valid: true, error: null };
    const num = parseInt(value, 10);
    if (isNaN(num)) return { valid: false, error: 'Enter a valid number' };
    if (num < 0) return { valid: false, error: 'Marks cannot be negative' };
    if (num > 100) return { valid: false, error: 'Marks cannot exceed 100' };
    return { valid: true, error: null };
};
