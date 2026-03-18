/**
 * NexStudy Admin — Core Functionality
 */

import { NEXSTUDY_DATA } from '../modules/data.js';

// Global state
let allResources = [];
let resourceTypes = [];
let customSubjects = [];
let bulkFiles = [];

const $ = id => document.getElementById(id);

export function initAdmin() {
    initAuth();
    initTabs();
    initCascadingDropdowns();
    initFileSelection();
    initResourceManagement();
    initSettingsManagement();
}

/* ================================================================
   AUTH & INITIAL DATA
================================================================ */
function initAuth() {
    firebase.auth().onAuthStateChanged(async (user) => {
        if (user) {
            $('loginScreen').style.display = 'none';
            $('adminPanel').style.display = 'block';
            $('userEmail').textContent = user.email;
            
            // Sequential loading
            await loadResourceTypes();
            await loadCustomSubjects();
            renderTypeDropdowns();
            renderResourceTypeList();
            renderCustomSubjectsList();
            
            await loadResources();
            renderDashboard();
        } else {
            $('loginScreen').style.display = 'block';
            $('adminPanel').style.display = 'none';
        }
    });

    $('loginBtn').addEventListener('click', async () => {
        const email = $('email').value.trim();
        const pass = $('password').value;
        const btn = $('loginBtn');
        const err = $('loginError');

        err.style.display = 'none';
        if (!email || !pass) return showError(err, 'Enter email and password.');

        btn.disabled = true;
        btn.innerHTML = '<span class="loading-spinner"></span>';

        try {
            await firebase.auth().signInWithEmailAndPassword(email, pass);
        } catch (e) {
            showError(err, e.message);
        } finally {
            btn.disabled = false;
            btn.textContent = 'Sign In';
        }
    });

    $('logoutBtn').addEventListener('click', () => firebase.auth().signOut());
}

/* ================================================================
   RESOURCE TYPES
================================================================ */
async function loadResourceTypes() {
    try {
        const snap = await db.collection('resource_types').get();
        let typesFromDb = [];
        snap.forEach(doc => typesFromDb.push({ ...doc.data(), docId: doc.id }));

        if (typesFromDb.length === 0) {
            // Seed defaults if empty
            const defaults = [
                { id: 'notes', name: 'Lecture Notes', icon: '📄' },
                { id: 'handwritten', name: 'Handwritten', icon: '✏️' },
                { id: 'pyq', name: 'PYQ Papers', icon: '📝' },
                { id: 'syllabus', name: 'Syllabus', icon: '📋' }
            ];
            const addPromises = defaults.map(d => db.collection('resource_types').add(d));
            await Promise.all(addPromises);
            const newSnap = await db.collection('resource_types').get();
            newSnap.forEach(doc => typesFromDb.push({ ...doc.data(), docId: doc.id }));
        }
        resourceTypes = typesFromDb;
    } catch (e) { console.error('Load types error:', e); }
}

function renderTypeDropdowns() {
    const opts = resourceTypes.map(t => `<option value="${t.id}">${t.icon} ${t.name}</option>`).join('');
    $('resType').innerHTML = opts;
    $('editType').innerHTML = opts;
    $('filterType').innerHTML = '<option value="">All Types</option>' + opts;
}

function renderResourceTypeList() {
    const list = $('resourceTypeList');
    list.innerHTML = resourceTypes.map(t => {
        const escapedName = t.name.replace(/['"]/g, "");
        return `
            <div class="settings-list-item">
                <div>
                    <span class="item-label">${t.icon} ${t.name}</span>
                    <span class="item-meta" style="margin-left:8px;">${t.id}</span>
                </div>
                <button class="btn-icon delete" title="Delete type" 
                    data-docid="${t.docId}" data-name="${escapedName}"
                    style="width:28px; height:28px; font-size:0.8rem;">✕</button>
            </div>
        `}).join('');
    
    // Add event listeners for delete buttons
    list.querySelectorAll('.delete').forEach(btn => {
        btn.onclick = () => deleteType(btn.dataset.docid, btn.dataset.name);
    });
}

async function deleteType(docId, name) {
    if (!docId) { alert("Missing Document ID."); return; }
    if (!confirm(`Delete resource type "${name}"?`)) return;
    try {
        await db.collection('resource_types').doc(docId).delete();
        resourceTypes = resourceTypes.filter(t => t.docId !== docId);
        renderTypeDropdowns();
        renderResourceTypeList();
    } catch (e) { alert(e.message); }
}

/* ================================================================
   CUSTOM SUBJECTS
================================================================ */
async function loadCustomSubjects() {
    try {
        const snap = await db.collection('custom_subjects').get();
        customSubjects = [];
        snap.forEach(doc => customSubjects.push({ docId: doc.id, ...doc.data() }));

        customSubjects.forEach(cs => {
            const year = NEXSTUDY_DATA.years[cs.year];
            if (!year) return;
            const sem = year.semesters[cs.semester];
            if (!sem) return;
            if (!sem.subjects.find(s => s.id === cs.id)) {
                sem.subjects.push({ id: cs.id, name: cs.name, code: cs.code, icon: cs.icon, resources: [] });
            }
        });
    } catch (e) { console.error('Load subjects error:', e); }
}

function renderCustomSubjectsList() {
    const list = $('customSubjectsList');
    if (customSubjects.length === 0) {
        list.innerHTML = '<p style="color:var(--text-muted); font-size:0.85rem;">No custom subjects added yet.</p>';
        return;
    }
    const ordinals = { 1: '1st', 2: '2nd', 3: '3rd', 4: '4th' };
    list.innerHTML = customSubjects.map(s => {
        const escapedName = s.name.replace(/['"]/g, "");
        return `
            <div class="settings-list-item">
                <div>
                    <span class="item-label">${s.icon} ${s.name}</span>
                    <span class="item-meta" style="margin-left:8px;">${ordinals[s.year]} Year • Sem ${s.semester} • ${s.code}</span>
                </div>
                <button class="btn-icon delete" title="Delete subject" 
                    data-docid="${s.docId}" data-id="${s.id}" data-name="${escapedName}" 
                    data-year="${s.year}" data-sem="${s.semester}"
                    style="width:28px; height:28px; font-size:0.8rem;">✕</button>
            </div>
        `}).join('');

    list.querySelectorAll('.delete').forEach(btn => {
        btn.onclick = () => deleteCustomSubject(btn.dataset.docid, btn.dataset.id, btn.dataset.name, btn.dataset.year, btn.dataset.sem);
    });
}

async function deleteCustomSubject(docId, id, name, year, sem) {
    if (!docId) { alert("Missing Document ID."); return; }
    if (!confirm(`Delete custom subject "${name}"?`)) return;
    try {
        await db.collection('custom_subjects').doc(docId).delete();
        customSubjects = customSubjects.filter(c => c.docId !== docId);
        const semObj = NEXSTUDY_DATA.years[year]?.semesters[sem];
        if (semObj) {
            semObj.subjects = semObj.subjects.filter(s => s.id !== id);
            $('resYear').dispatchEvent(new Event('change'));
        }
        renderCustomSubjectsList();
    } catch (e) { alert(e.message); }
}

/* ================================================================
   DROPDOWNS & NAVIGATION
================================================================ */
function initCascadingDropdowns() {
    const handleYearChange = (yearEl, semEl, subEl) => {
        const y = yearEl.value;
        semEl.innerHTML = '<option value="">Select Semester</option>';
        if (subEl) subEl.innerHTML = '<option value="">Select Subject</option>';
        if (y && NEXSTUDY_DATA.years[y]) {
            for (const [n, s] of Object.entries(NEXSTUDY_DATA.years[y].semesters)) {
                semEl.innerHTML += `<option value="${n}">${s.name}</option>`;
            }
        }
    };

    const handleSemChange = (yearEl, semEl, subEl) => {
        const y = yearEl.value, s = semEl.value;
        subEl.innerHTML = '<option value="">Select Subject</option>';
        if (y && s && NEXSTUDY_DATA.years[y]?.semesters[s]) {
            for (const subj of NEXSTUDY_DATA.years[y].semesters[s].subjects) {
                subEl.innerHTML += `<option value="${subj.id}">${subj.name} (${subj.code})</option>`;
            }
        }
    };

    $('newSubjYear').addEventListener('change', () => handleYearChange($('newSubjYear'), $('newSubjSem')));
    $('resYear').addEventListener('change', () => handleYearChange($('resYear'), $('resSemester'), $('resSubject')));
    $('resSemester').addEventListener('change', () => handleSemChange($('resYear'), $('resSemester'), $('resSubject')));
}

function initTabs() {
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            $('tab-' + tab.dataset.tab).classList.add('active');
        });
    });
}

/* ================================================================
   FILE SELECTION
================================================================ */
function initFileSelection() {
    const uploadZone = $('uploadZone');
    const fileInput = $('fileInput');

    fileInput.addEventListener('change', (e) => {
        addFiles(Array.from(e.target.files));
        fileInput.value = '';
    });

    uploadZone.addEventListener('dragover', e => { e.preventDefault(); uploadZone.classList.add('dragover'); });
    uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('dragover'));
    uploadZone.addEventListener('drop', e => {
        e.preventDefault(); uploadZone.classList.remove('dragover');
        addFiles(Array.from(e.dataTransfer.files));
    });

    window.removeFile = (idx) => {
        bulkFiles.splice(idx, 1);
        renderBulkList();
    };
}

function addFiles(files) {
    for (const f of files) {
        if (f.size > 50 * 1024 * 1024) { alert(`${f.name} is too large (max 50 MB)`); continue; }
        const nameWithoutExt = f.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
        const title = nameWithoutExt.charAt(0).toUpperCase() + nameWithoutExt.slice(1);
        bulkFiles.push({ file: f, title });
    }
    renderBulkList();
}

function renderBulkList() {
    const el = $('bulkFileList');
    if (bulkFiles.length === 0) { el.innerHTML = ''; return; }

    el.innerHTML = bulkFiles.map((bf, i) => `
        <div class="bulk-file-item">
            <span class="file-icon">📄</span>
            <div class="file-details">
                <div class="fname">${bf.file.name}</div>
                <div class="fsize">${formatSize(bf.file.size)}</div>
            </div>
            <input type="text" class="file-title-input" value="${bf.title}" placeholder="Title" onchange="window.updateBulkTitle(${i}, this.value)">
            <button class="remove-file" onclick="removeFile(${i})">✕</button>
        </div>
    `).join('');
}

window.updateBulkTitle = (idx, val) => { bulkFiles[idx].title = val; };

/* ================================================================
   RESOURCE MANAGEMENT (UPLOAD/EDIT/DELETE)
================================================================ */
function initResourceManagement() {
    // Add Resource (Single/Bulk)
    $('addResourceBtn').addEventListener('click', async () => {
        const errEl = $('addError'), succEl = $('addSuccess'), btn = $('addResourceBtn');
        errEl.style.display = 'none'; succEl.style.display = 'none';

        const year = $('resYear').value, semester = $('resSemester').value;
        const subjectId = $('resSubject').value, type = $('resType').value;

        if (!year || !semester || !subjectId) return showError(errEl, 'Select year, semester, and subject.');
        if (bulkFiles.length === 0) return showError(errEl, 'Select at least one file.');

        const subjectData = NEXSTUDY_DATA.years[year]?.semesters[semester]?.subjects.find(s => s.id === subjectId);
        const subjectName = subjectData ? subjectData.name : subjectId;

        btn.disabled = true;
        $('uploadProgress').classList.add('active');

        let done = 0, errors = [];
        for (const bf of bulkFiles) {
            if (!bf.title.trim()) bf.title = bf.file.name.replace(/\.[^/.]+$/, '');
            $('progressText').textContent = `Uploading ${done + 1} of ${bulkFiles.length}: ${bf.file.name}`;
            
            try {
                const cloud = await uploadToCloudinary(bf.file, pct => $('progressFill').style.width = pct + '%');
                await db.collection('resources').add({
                    year: parseInt(year), semester: parseInt(semester),
                    subjectId, subjectName, title: bf.title, type,
                    desc: '', fileUrl: cloud.secure_url,
                    size: formatSize(cloud.bytes),
                    format: (cloud.format || bf.file.name.split('.').pop()).toUpperCase(),
                    originalName: bf.file.name,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                });
                done++;
            } catch (e) { errors.push(bf.file.name + ': ' + e.message); }
        }

        $('uploadProgress').classList.remove('active');
        btn.disabled = false;
        bulkFiles = []; renderBulkList();

        if (errors.length > 0) showError(errEl, `Failed: ${errors.join(', ')}`);
        showSuccess(succEl, `✅ ${done} resource(s) uploaded!`);
        await loadResources();
        renderDashboard();
    });

    // Search & Filter
    $('searchResources')?.addEventListener('input', renderResourceList);
    $('filterYear').addEventListener('change', renderResourceList);
    $('filterType').addEventListener('change', renderResourceList);

    // Edit Modal
    window.openEditModal = (r) => {
        $('editId').value = r.id;
        $('editTitle').value = r.title || '';
        $('editType').value = r.type || 'notes';
        $('editDesc').value = r.desc || '';
        $('editError').style.display = 'none';
        $('editModal').classList.add('active');
    };

    $('saveEditBtn').addEventListener('click', async () => {
        const id = $('editId').value, title = $('editTitle').value.trim();
        const type = $('editType').value, desc = $('editDesc').value.trim();
        if (!title) return showError($('editError'), 'Title is required.');

        $('saveEditBtn').disabled = true;
        $('saveEditBtn').innerHTML = '<span class="loading-spinner"></span>';
        try {
            await db.collection('resources').doc(id).update({ title, type, desc });
            const r = allResources.find(x => x.id === id);
            if (r) { Object.assign(r, { title, type, desc }); }
            renderResourceList(); renderDashboard();
            $('editModal').classList.remove('active');
        } catch (e) { showError($('editError'), e.message); }
        $('saveEditBtn').disabled = false;
        $('saveEditBtn').textContent = 'Save Changes';
    });

    $('editModal').addEventListener('click', e => { if (e.target === $('editModal')) $('editModal').classList.remove('active'); });

    window.deleteResource = async (id, title) => {
        if (!confirm(`Delete "${title}"?`)) return;
        try {
            await db.collection('resources').doc(id).delete();
            allResources = allResources.filter(r => r.id !== id);
            renderResourceList(); renderDashboard();
        } catch (e) { alert('Error: ' + e.message); }
    };
}

async function loadResources() {
    try {
        const snap = await db.collection('resources').orderBy('createdAt', 'desc').get();
        allResources = [];
        snap.forEach(doc => allResources.push({ id: doc.id, ...doc.data() }));
        renderResourceList();
    } catch (e) {
        $('resourceList').innerHTML = `<div class="empty-state"><p>${e.message}</p></div>`;
    }
}

function renderResourceList() {
    const search = ($('searchResources')?.value || '').toLowerCase();
    const yearF = $('filterYear').value, typeF = $('filterType').value;

    let list = allResources.filter(r => {
        const matchesYear = !yearF || r.year === parseInt(yearF);
        const matchesType = !typeF || r.type === typeF;
        const matchesSearch = !search || (r.title || '').toLowerCase().includes(search) || (r.subjectName || '').toLowerCase().includes(search);
        return matchesYear && matchesType && matchesSearch;
    });

    if (list.length === 0) {
        $('resourceList').innerHTML = `<div class="empty-state"><p>No resources found.</p></div>`;
        return;
    }

    const typeMap = {}; resourceTypes.forEach(t => typeMap[t.id] = `${t.icon} ${t.name}`);
    const ord = { 1: '1st', 2: '2nd', 3: '3rd', 4: '4th' };

    $('resourceList').innerHTML = list.map(r => `
        <div class="resource-list-item">
            <div class="resource-list-info">
                <h4>${r.title}</h4>
                <p>${ord[r.year] || r.year} Year • Sem ${r.semester} • ${r.subjectName || r.subjectId} • ${typeMap[r.type] || r.type}${r.size ? ' • ' + r.size : ''}</p>
            </div>
            <div class="resource-list-actions">
                <a href="${r.fileUrl || '#'}" target="_blank" class="btn-icon">🔗</a>
                <button class="btn-icon edit" onclick='window.openEditModal(${JSON.stringify(r).replace(/'/g, "&#39;")})'>✏️</button>
                <button class="btn-icon delete" onclick="window.deleteResource('${r.id}','${(r.title || '').replace(/'/g, "\\'")}')">🗑️</button>
            </div>
        </div>
    `).join('');
}

/* ================================================================
   SETTINGS (TYPES & SUBJECTS)
================================================================ */
function initSettingsManagement() {
    // Add Type
    $('addTypeBtn').addEventListener('click', async () => {
        const name = $('newTypeName').value.trim(), icon = $('newTypeIcon').value.trim() || '📎';
        if (!name) return showError($('typeError'), 'Enter a name.');
        const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
        if (resourceTypes.find(t => t.id === id)) return showError($('typeError'), 'Exists.');

        $('addTypeBtn').disabled = true;
        try {
            const docRef = await db.collection('resource_types').add({ id, name, icon });
            resourceTypes.push({ id, name, icon, docId: docRef.id });
            renderTypeDropdowns(); renderResourceTypeList();
            $('newTypeName').value = ''; $('newTypeIcon').value = '';
            showSuccess($('typeSuccess'), `✅ "${name}" added!`);
        } catch (e) { showError($('typeError'), e.message); }
        $('addTypeBtn').disabled = false;
        $('addTypeBtn').textContent = 'Add Type';
    });

    // Add Subject
    $('addSubjectBtn').addEventListener('click', async () => {
        const year = parseInt($('newSubjYear').value), semester = parseInt($('newSubjSem').value);
        const name = $('newSubjName').value.trim(), code = $('newSubjCode').value.trim(), icon = $('newSubjIcon').value.trim() || '📖';
        if (!year || !semester || !name || !code) return showError($('subjError'), 'Fill all.');

        const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
        $('addSubjectBtn').disabled = true;
        try {
            const docRef = await db.collection('custom_subjects').add({ id, name, code, icon, year, semester });
            customSubjects.push({ id, name, code, icon, year, semester, docId: docRef.id });
            const sem = NEXSTUDY_DATA.years[year]?.semesters[semester];
            if (sem) { sem.subjects.push({ id, name, code, icon, resources: [] }); $('resYear').dispatchEvent(new Event('change')); }
            renderCustomSubjectsList();
            $('newSubjName').value = ''; $('newSubjCode').value = '';
            showSuccess($('subjSuccess'), `✅ "${name}" added!`);
        } catch (e) { showError($('subjError'), e.message); }
        $('addSubjectBtn').disabled = false;
        $('addSubjectBtn').textContent = 'Add Subject';
    });
}

/* ================================================================
   DASHBOARD
================================================================ */
function renderDashboard() {
    const total = allResources.length;
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
    const thisWeek = allResources.filter(r => r.createdAt && new Date(r.createdAt.seconds * 1000) >= weekAgo).length;
    const subjects = new Set(allResources.map(r => r.subjectId));
    const types = new Set(allResources.map(r => r.type));

    $('statTotal').textContent = total;
    $('statWeek').textContent = thisWeek;
    $('statSubjects').textContent = subjects.size;
    $('statTypes').textContent = types.size;

    const byYear = { 1: 0, 2: 0, 3: 0, 4: 0 };
    allResources.forEach(r => { if (byYear[r.year] !== undefined) byYear[r.year]++; });
    const ord = { 1: '1st Year', 2: '2nd Year', 3: '3rd Year', 4: '4th Year' };
    $('breakdownYear').innerHTML = Object.entries(byYear).map(([y, c]) => `<div class="breakdown-row"><span>${ord[y]}</span><span>${c}</span></div>`).join('');

    const byType = {};
    allResources.forEach(r => { byType[r.type] = (byType[r.type] || 0) + 1; });
    const typeMap = {}; resourceTypes.forEach(t => typeMap[t.id] = `${t.icon} ${t.name}`);
    $('breakdownType').innerHTML = Object.entries(byType).map(([t, c]) => `<div class="breakdown-row"><span>${typeMap[t] || t}</span><span>${c}</span></div>`).join('') || '<p>No data yet.</p>';
}

/* ================================================================
   UTILS
================================================================ */
function uploadToCloudinary(file, onProgress) {
    return new Promise((resolve, reject) => {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('upload_preset', CLOUDINARY_PRESET);
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/auto/upload`);
        xhr.upload.addEventListener('progress', e => { if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100)); });
        xhr.onload = () => xhr.status === 200 ? resolve(JSON.parse(xhr.responseText)) : reject(new Error('Upload failed'));
        xhr.onerror = () => reject(new Error('Network error'));
        xhr.send(fd);
    });
}

function showError(el, msg) { el.textContent = msg; el.style.display = 'block'; }
function showSuccess(el, msg) { el.textContent = msg; el.style.display = 'block'; setTimeout(() => el.style.display = 'none', 5000); }
function formatSize(b) {
    if (b < 1024) return b + ' B';
    if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' KB';
    return (b / (1024 * 1024)).toFixed(1) + ' MB';
}
