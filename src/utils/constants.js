// Grade options for Theory dropdowns (S1, S2, LE)
export const GRADE_OPTIONS = [
    { label: 'Select Grade', value: '', gp: null },
    { label: 'O — Outstanding', value: 'O', gp: 10 },
    { label: 'A+ — Excellent', value: 'A+', gp: 9 },
    { label: 'A — Very Good', value: 'A', gp: 8 },
    { label: 'B+ — Good', value: 'B+', gp: 7 },
    { label: 'B — Above Average', value: 'B', gp: 6 },
    { label: 'C — Average', value: 'C', gp: 5 },
    { label: 'P — Pass', value: 'P', gp: 4 },
    { label: 'I — Incomplete', value: 'I', gp: 0 },
];

// Course type options
export const COURSE_TYPES = [
    { label: 'Select Type', value: '' },
    { label: 'Theory (T)', value: 'T' },
    { label: 'Practical (P)', value: 'P' },
    { label: 'Theory + Practical (TP)', value: 'TP' },
];

// WGP to Letter Grade mapping (Annexure-IV)
export const WGP_TO_GRADE = [
    { min: 9.01, max: 10, grade: 'O', gp: 10, label: 'Outstanding' },
    { min: 8.01, max: 9.00, grade: 'A+', gp: 9, label: 'Excellent' },
    { min: 7.01, max: 8.00, grade: 'A', gp: 8, label: 'Very Good' },
    { min: 6.01, max: 7.00, grade: 'B+', gp: 7, label: 'Good' },
    { min: 5.01, max: 6.00, grade: 'B', gp: 6, label: 'Above Average' },
    { min: 4.01, max: 5.00, grade: 'C', gp: 5, label: 'Average' },
    { min: 4.00, max: 4.00, grade: 'P', gp: 4, label: 'Pass' },
    { min: 0, max: 3.99, grade: 'F', gp: 0, label: 'Fail' },
];

// Absolute grading for Practicals (marks to grade)
export const PRACTICAL_GRADE_TABLE = [
    { min: 90, max: 100, grade: 'O', gp: 10 },
    { min: 80, max: 89, grade: 'A+', gp: 9 },
    { min: 70, max: 79, grade: 'A', gp: 8 },
    { min: 60, max: 69, grade: 'B+', gp: 7 },
    { min: 50, max: 59, grade: 'B', gp: 6 },
    { min: 41, max: 49, grade: 'C', gp: 5 },
    { min: 33, max: 40, grade: 'P', gp: 4 },
    { min: 0, max: 32, grade: 'F', gp: 0 },
];

// Theory WGP weights
export const THEORY_WEIGHTS = {
    S1: 0.30,
    S2: 0.45,
    LE: 0.25,
};

// TP course weights
export const TP_WEIGHTS = {
    theory: 0.70,
    practical: 0.30,
};

// CGPA color coding thresholds
export const CGPA_COLORS = [
    { min: 9.0, max: 10, color: 'emerald', label: 'Outstanding' },
    { min: 7.5, max: 8.99, color: 'blue', label: 'Very Good' },
    { min: 6.0, max: 7.49, color: 'amber', label: 'Good' },
    { min: 0, max: 5.99, color: 'red', label: 'Needs Improvement' },
];

// Create a new empty subject
export const createEmptySubject = (id) => ({
    id,
    name: '',
    credits: '',
    courseType: '',
    s1Grade: '',
    s2Grade: '',
    leGrade: '',
    labMarks: '',
});

// Create a new empty semester
export const createEmptySemester = (semId) => ({
    id: semId,
    subjects: [createEmptySubject(`${semId}-sub-1`)],
});

// Grade tooltip descriptions
export const GRADE_TOOLTIPS = {
    'O': 'Outstanding — Grade Point 10',
    'A+': 'Excellent — Grade Point 9',
    'A': 'Very Good — Grade Point 8',
    'B+': 'Good — Grade Point 7',
    'B': 'Above Average — Grade Point 6',
    'C': 'Average — Grade Point 5',
    'P': 'Pass — Grade Point 4',
    'I': 'Incomplete — Grade Point 0',
    'F': 'Fail — Grade Point 0',
};
