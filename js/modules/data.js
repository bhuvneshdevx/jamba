/* =============================================
   NexStudy — Data Store
   ============================================= */

export const NEXSTUDY_DATA = {
    branches: [
        { id: 'cse', name: 'Computer Science & Engineering', icon: '💻' },
        { id: 'ece', name: 'Electronics & Communication', icon: '📡' },
        { id: 'me', name: 'Mechanical Engineering', icon: '⚙️' },
        { id: 'ce', name: 'Civil Engineering', icon: '🏗️' },
        { id: 'ee', name: 'Electrical Engineering', icon: '⚡' },
        { id: 'it', name: 'Information Technology', icon: '🌐' },
    ],

    years: {
        1: {
            name: 'First Year',
            description: 'Foundation courses common to all engineering branches',
            semesters: {
                1: {
                    name: 'Semester 1',
                    subjects: [
                        { id: 'math1', name: 'Engineering Mathematics I', code: 'MA101', icon: '📐', resources: [] },
                        { id: 'phy1', name: 'Engineering Physics', code: 'PH101', icon: '⚛️', resources: [] },
                        { id: 'chem1', name: 'Engineering Chemistry', code: 'CH101', icon: '🧪', resources: [] },
                        { id: 'bee', name: 'Basic Electrical Engineering', code: 'EE101', icon: '⚡', resources: [] },
                        { id: 'prog1', name: 'Programming in C', code: 'CS101', icon: '💻', resources: [] },
                    ]
                },
                2: {
                    name: 'Semester 2',
                    subjects: [
                        { id: 'math2', name: 'Engineering Mathematics II', code: 'MA102', icon: '📐', resources: [] },
                        { id: 'mech', name: 'Engineering Mechanics', code: 'ME101', icon: '🔧', resources: [] },
                        { id: 'ed', name: 'Engineering Drawing', code: 'ME102', icon: '📏', resources: [] },
                        { id: 'env', name: 'Environmental Science', code: 'ES101', icon: '🌍', resources: [] },
                        { id: 'workshop', name: 'Workshop Practice', code: 'ME103', icon: '🔨', resources: [] },
                    ]
                }
            }
        },
        2: {
            name: 'Second Year',
            description: 'Core engineering subjects begin — branch-specific courses',
            semesters: {
                3: {
                    name: 'Semester 3',
                    subjects: [
                        { id: 'math3', name: 'Engineering Mathematics III', code: 'MA201', icon: '📐', resources: [] },
                        { id: 'dsa', name: 'Data Structures & Algorithms', code: 'CS201', icon: '🌳', resources: [] },
                        { id: 'oop', name: 'Object-Oriented Programming', code: 'CS202', icon: '☕', resources: [] },
                        { id: 'deld', name: 'Digital Electronics & Logic Design', code: 'EC201', icon: '🔌', resources: [] },
                        { id: 'dm', name: 'Discrete Mathematics', code: 'CS203', icon: '🔢', resources: [] },
                    ]
                },
                4: {
                    name: 'Semester 4',
                    subjects: [
                        { id: 'os', name: 'Operating Systems', code: 'CS301', icon: '🖥️', resources: [] },
                        { id: 'dbms', name: 'Database Management Systems', code: 'CS302', icon: '🗄️', resources: [] },
                        { id: 'coa', name: 'Computer Organization & Architecture', code: 'CS303', icon: '🏗️', resources: [] },
                        { id: 'toc', name: 'Theory of Computation', code: 'CS304', icon: '🤖', resources: [] },
                        { id: 'maths4', name: 'Numerical Methods & Statistics', code: 'MA202', icon: '📊', resources: [] },
                    ]
                }
            }
        },
        3: {
            name: 'Third Year',
            description: 'Advanced core subjects and specialization electives',
            semesters: {
                5: {
                    name: 'Semester 5',
                    subjects: [
                        { id: 'cn', name: 'Computer Networks', code: 'CS401', icon: '🌐', resources: [] },
                        { id: 'se', name: 'Software Engineering', code: 'CS402', icon: '📋', resources: [] },
                        { id: 'daa', name: 'Design & Analysis of Algorithms', code: 'CS403', icon: '⚡', resources: [] },
                        { id: 'ai', name: 'Artificial Intelligence', code: 'CS404', icon: '🧠', resources: [] },
                        { id: 'web', name: 'Web Technologies', code: 'CS405', icon: '🕸️', resources: [] },
                    ]
                },
                6: {
                    name: 'Semester 6',
                    subjects: [
                        { id: 'cd', name: 'Compiler Design', code: 'CS501', icon: '🔄', resources: [] },
                        { id: 'cns', name: 'Cryptography & Network Security', code: 'CS502', icon: '🔒', resources: [] },
                        { id: 'ml', name: 'Machine Learning', code: 'CS503', icon: '🤖', resources: [] },
                        { id: 'dc', name: 'Distributed Computing', code: 'CS504', icon: '☁️', resources: [] },
                    ]
                }
            }
        },
        4: {
            name: 'Fourth Year',
            description: 'Specialization electives and final year project',
            semesters: {
                7: {
                    name: 'Semester 7',
                    subjects: [
                        { id: 'dl', name: 'Deep Learning', code: 'CS601', icon: '🧠', resources: [] },
                        { id: 'nlp', name: 'Natural Language Processing', code: 'CS602', icon: '💬', resources: [] },
                        { id: 'cloud', name: 'Cloud Computing', code: 'CS603', icon: '☁️', resources: [] },
                        { id: 'tic', name: 'Data Science & Big Data', code: 'CS604', icon: '📊', resources: [] },
                    ]
                },
                8: {
                    name: 'Semester 8',
                    subjects: [
                        { id: 'blockchain', name: 'Blockchain Technology', code: 'CS701', icon: '⛓️', resources: [] },
                        { id: 'tic2', name: 'Internet of Things', code: 'CS702', icon: '📱', resources: [] },
                        { id: 'project', name: 'Final Year Project', code: 'CS703', icon: '🎓', resources: [] },
                        { id: 'ethics', name: 'Professional Ethics & IPR', code: 'HU701', icon: '⚖️', resources: [] },
                    ]
                }
            }
        }
    }
};

/**
 * Flatten all subjects for search
 */
export function getAllSubjects() {
    const subjects = [];
    for (const [yearNum, year] of Object.entries(NEXSTUDY_DATA.years)) {
        for (const [semNum, semester] of Object.entries(year.semesters)) {
            for (const subject of semester.subjects) {
                subjects.push({
                    ...subject,
                    year: parseInt(yearNum),
                    semester: parseInt(semNum),
                    yearName: year.name,
                    semesterName: semester.name,
                });
            }
        }
    }
    return subjects;
}

/**
 * Flatten all resources for search
 */
export function getAllResources() {
    const resources = [];
    const subjects = getAllSubjects();
    for (const subject of subjects) {
        if (subject.resources && subject.resources.length > 0) {
            for (const resource of subject.resources) {
                resources.push({
                    ...resource,
                    subjectId: subject.id,
                    subjectName: subject.name,
                    year: subject.year,
                    semester: subject.semester,
                });
            }
        }
    }
    return resources;
}
