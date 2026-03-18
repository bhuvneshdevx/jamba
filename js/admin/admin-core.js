/**
 * NexStudy Admin — Core Panel Functionality
 *
 * NOTE: Authentication (login/logout/onAuthStateChanged) is handled entirely
 * in admin.html as a plain script. This module is dynamically imported only
 * AFTER a successful login, so window.db and window.auth are guaranteed ready.
 */

import { NEXSTUDY_DATA } from '../modules/data.js';
import { supabase } from '../../supabase-config.js';

// ── Module state ──────────────────────────────────────────────────────────────
let allResources   = [];
let resourceTypes  = [];
let customSubjects = [];
let bulkFiles      = [];

const $ = id => document.getElementById(id);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ENTRY POINT  (called by admin.html after login)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function initAdmin() {
    initTabs();
    initCascadingDropdowns();
    initFileSelection();
    initResourceManagement();
    initSettingsManagement();

    await loadResourceTypes();
    await loadCustomSubjects();
    renderTypeDropdowns();
    renderResourceTypeList();
    renderCustomSubjectsList();
    await loadResources();
    renderDashboard();
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TABS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function initTabs() {
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const content = $('tab-' + tab.dataset.tab);
            if (content) content.classList.add('active');
        });
    });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CASCADING DROPDOWNS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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

    if ($('newSubjYear')) $('newSubjYear').addEventListener('change', () => handleYearChange($('newSubjYear'), $('newSubjSem')));
    if ($('resYear'))     $('resYear').addEventListener('change',     () => handleYearChange($('resYear'), $('resSemester'), $('resSubject')));
    if ($('resSemester')) $('resSemester').addEventListener('change', () => handleSemChange($('resYear'), $('resSemester'), $('resSubject')));
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RESOURCE TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function loadResourceTypes() {
    try {
        const { data: snap } = await supabase.from('resource_types').select('*');
        let typesFromDb = [];
        if (snap) snap.forEach(row => typesFromDb.push({ ...row, docId: row.id }));

        if (typesFromDb.length === 0) {
            const defaults = [
                { id: 'notes',       name: 'Lecture Notes', icon: '📄' },
                { id: 'handwritten', name: 'Handwritten',   icon: '✏️' },
                { id: 'pyq',         name: 'PYQ Papers',    icon: '📝' },
                { id: 'syllabus',    name: 'Syllabus',      icon: '📋' },
            ];
            await Promise.all(defaults.map(d => supabase.from('resource_types').insert(d)));
            const { data: newSnap } = await supabase.from('resource_types').select('*');
            if (newSnap) newSnap.forEach(row => typesFromDb.push({ ...row, docId: row.id }));
        }
        resourceTypes = typesFromDb;
    } catch (e) { console.error('Load types error:', e); }
}

function renderTypeDropdowns() {
    const opts = resourceTypes.map(t => `<option value="${t.id}">${t.icon} ${t.name}</option>`).join('');
    if ($('resType'))    $('resType').innerHTML    = opts;
    if ($('editType'))   $('editType').innerHTML   = opts;
    if ($('filterType')) $('filterType').innerHTML = '<option value="">All Types</option>' + opts;
}

function renderResourceTypeList() {
    const list = $('resourceTypeList');
    if (!list) return;
    list.innerHTML = resourceTypes.map(t => {
        const safe = t.name.replace(/['"<>]/g, '');
        return `
            <div class="settings-list-item">
                <div>
                    <span class="item-label">${t.icon} ${t.name}</span>
                    <span class="item-meta" style="margin-left:8px;">${t.id}</span>
                </div>
                <button class="btn-icon delete" data-docid="${t.docId}" data-name="${safe}"
                    style="width:28px;height:28px;font-size:0.8rem;">✕</button>
            </div>`;
    }).join('');

    list.querySelectorAll('.delete').forEach(btn => {
        btn.onclick = () => deleteType(btn.dataset.docid, btn.dataset.name);
    });
}

async function deleteType(docId, name) {
    if (!docId) { alert('Missing Document ID.'); return; }
    if (!confirm(`Delete type "${name}"?`)) return;
    try {
        await supabase.from('resource_types').delete().eq('id', docId);
        resourceTypes = resourceTypes.filter(t => t.docId !== docId);
        renderTypeDropdowns();
        renderResourceTypeList();
    } catch (e) { alert('Error: ' + e.message); }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CUSTOM SUBJECTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function loadCustomSubjects() {
    try {
        const { data: snap } = await supabase.from('custom_subjects').select('*');
        customSubjects = [];
        if (snap) snap.forEach(row => customSubjects.push({ docId: row.id, ...row }));

        customSubjects.forEach(cs => {
            const yr = NEXSTUDY_DATA.years[cs.year];
            if (!yr) return;
            const sem = yr.semesters[cs.semester];
            if (!sem) return;
            if (!sem.subjects.find(s => s.id === cs.id)) {
                sem.subjects.push({ id: cs.id, name: cs.name, code: cs.code, icon: cs.icon, resources: [] });
            }
        });
    } catch (e) { console.error('Load subjects error:', e); }
}

function renderCustomSubjectsList() {
    const list = $('customSubjectsList');
    if (!list) return;
    if (customSubjects.length === 0) {
        list.innerHTML = '<p style="color:var(--text-muted);font-size:0.85rem;">No custom subjects added yet.</p>';
        return;
    }
    const ord = { 1: '1st', 2: '2nd', 3: '3rd', 4: '4th' };
    list.innerHTML = customSubjects.map(s => {
        const safe = s.name.replace(/['"<>]/g, '');
        return `
            <div class="settings-list-item">
                <div>
                    <span class="item-label">${s.icon} ${s.name}</span>
                    <span class="item-meta" style="margin-left:8px;">${ord[s.year]} Year • Sem ${s.semester} • ${s.code}</span>
                </div>
                <button class="btn-icon delete"
                    data-docid="${s.docId}" data-id="${s.id}" data-name="${safe}"
                    data-year="${s.year}" data-sem="${s.semester}"
                    style="width:28px;height:28px;font-size:0.8rem;">✕</button>
            </div>`;
    }).join('');

    list.querySelectorAll('.delete').forEach(btn => {
        btn.onclick = () => deleteCustomSubject(btn.dataset.docid, btn.dataset.id, btn.dataset.name, btn.dataset.year, btn.dataset.sem);
    });
}

async function deleteCustomSubject(docId, id, name, year, sem) {
    if (!docId) { alert('Missing Document ID.'); return; }
    if (!confirm(`Delete subject "${name}"?`)) return;
    try {
        await supabase.from('custom_subjects').delete().eq('id', docId);
        customSubjects = customSubjects.filter(c => c.docId !== docId);
        const semObj = NEXSTUDY_DATA.years[year]?.semesters[sem];
        if (semObj) {
            semObj.subjects = semObj.subjects.filter(s => s.id !== id);
            if ($('resYear')) $('resYear').dispatchEvent(new Event('change'));
        }
        renderCustomSubjectsList();
    } catch (e) { alert('Error: ' + e.message); }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FILE SELECTION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function initFileSelection() {
    const zone  = $('uploadZone');
    const input = $('fileInput');
    if (!zone || !input) return;

    input.addEventListener('change', e => { addFiles(Array.from(e.target.files)); input.value = ''; });
    zone.addEventListener('dragover',  e => { e.preventDefault(); zone.classList.add('dragover'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
    zone.addEventListener('drop', e => { e.preventDefault(); zone.classList.remove('dragover'); addFiles(Array.from(e.dataTransfer.files)); });

    window.removeFile = idx => { bulkFiles.splice(idx, 1); renderBulkList(); };
}

function addFiles(files) {
    for (const f of files) {
        if (f.size > 50 * 1024 * 1024) { alert(`"${f.name}" exceeds the 50 MB limit.`); continue; }
        const title = f.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
        bulkFiles.push({ file: f, title: title.charAt(0).toUpperCase() + title.slice(1) });
    }
    renderBulkList();
}

function renderBulkList() {
    const el = $('bulkFileList');
    if (!el) return;
    el.innerHTML = bulkFiles.length === 0 ? '' : bulkFiles.map((bf, i) => `
        <div class="bulk-file-item">
            <span class="file-icon">📄</span>
            <div class="file-details">
                <div class="fname">${bf.file.name}</div>
                <div class="fsize">${formatSize(bf.file.size)}</div>
            </div>
            <input type="text" class="file-title-input" value="${bf.title.replace(/"/g, '&quot;')}"
                placeholder="Title" onchange="window.updateBulkTitle(${i}, this.value)">
            <button class="remove-file" onclick="removeFile(${i})">✕</button>
        </div>`).join('');
}

window.updateBulkTitle = (idx, val) => { if (bulkFiles[idx]) bulkFiles[idx].title = val; };

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RESOURCE MANAGEMENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function initResourceManagement() {
    const addBtn = $('addResourceBtn');
    if (addBtn) {
        addBtn.addEventListener('click', async () => {
            const errEl = $('addError'), succEl = $('addSuccess');
            errEl.style.display = 'none'; succEl.style.display = 'none';

            const year      = $('resYear').value;
            const semester  = $('resSemester').value;
            const subjectId = $('resSubject').value;
            const type      = $('resType').value;

            if (!year || !semester || !subjectId) return showError(errEl, 'Select year, semester, and subject.');
            if (bulkFiles.length === 0)            return showError(errEl, 'Select at least one file.');

            const subjectData = NEXSTUDY_DATA.years[year]?.semesters[semester]?.subjects.find(s => s.id === subjectId);
            const subjectName = subjectData ? subjectData.name : subjectId;

            addBtn.disabled = true;
            if ($('uploadProgress')) $('uploadProgress').classList.add('active');

            let done = 0, errors = [];
            for (const bf of bulkFiles) {
                if (!bf.title.trim()) bf.title = bf.file.name.replace(/\.[^/.]+$/, '');
                if ($('progressText')) $('progressText').textContent = `Uploading ${done + 1}/${bulkFiles.length}: ${bf.file.name}`;
                try {
                    const cloud = await uploadToCloudinary(bf.file, pct => {
                        if ($('progressFill')) $('progressFill').style.width = pct + '%';
                    });
                    await supabase.from('resources').insert({
                        year: parseInt(year), semester: parseInt(semester),
                        subjectId, subjectName, title: bf.title, type,
                        desc: '', fileUrl: cloud.secure_url,
                        size: formatSize(cloud.bytes),
                        format: (cloud.format || bf.file.name.split('.').pop()).toUpperCase(),
                        originalName: bf.file.name,
                        createdAt: new Date().toISOString(),
                    });
                    done++;
                } catch (e) { console.error('Upload error:', e); errors.push(`${bf.file.name}: ${e.message}`); }
            }

            if ($('uploadProgress')) $('uploadProgress').classList.remove('active');
            addBtn.disabled = false;
            bulkFiles = []; renderBulkList();

            if (errors.length > 0) showError(errEl, `Failed: ${errors.join(', ')}`);
            if (done > 0) showSuccess(succEl, `✅ ${done} resource(s) uploaded!`);
            await loadResources(); renderDashboard();
        });
    }

    $('searchResources')?.addEventListener('input', renderResourceList);
    if ($('filterYear')) $('filterYear').addEventListener('change', renderResourceList);
    if ($('filterType')) $('filterType').addEventListener('change', renderResourceList);

    window.openEditModal = r => {
        if ($('editId'))    $('editId').value    = r.id;
        if ($('editTitle')) $('editTitle').value = r.title  || '';
        if ($('editType'))  $('editType').value  = r.type   || 'notes';
        if ($('editDesc'))  $('editDesc').value  = r.desc   || '';
        if ($('editError')) $('editError').style.display = 'none';
        if ($('editModal')) $('editModal').classList.add('active');
    };

    const saveBtn = $('saveEditBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', async () => {
            const id = $('editId').value, title = $('editTitle').value.trim();
            const type = $('editType').value, desc = $('editDesc').value.trim();
            if (!title) return showError($('editError'), 'Title is required.');
            saveBtn.disabled = true; saveBtn.innerHTML = '<span class="loading-spinner"></span>';
            try {
                await supabase.from('resources').update({ title, type, desc }).eq('id', id);
                const r = allResources.find(x => x.id === id);
                if (r) Object.assign(r, { title, type, desc });
                renderResourceList(); renderDashboard();
                if ($('editModal')) $('editModal').classList.remove('active');
            } catch (e) { showError($('editError'), e.message); }
            saveBtn.disabled = false; saveBtn.textContent = 'Save Changes';
        });
    }

    const modal = $('editModal');
    if (modal) modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('active'); });

    window.deleteResource = async (id, title) => {
        if (!confirm(`Delete "${title}"?`)) return;
        try {
            await supabase.from('resources').delete().eq('id', id);
            allResources = allResources.filter(r => r.id !== id);
            renderResourceList(); renderDashboard();
        } catch (e) { alert('Error: ' + e.message); }
    };
}

async function loadResources() {
    try {
        const { data: snap } = await supabase.from('resources').select('*').order('createdAt', { ascending: false });
        allResources = [];
        if (snap) snap.forEach(row => allResources.push({ id: row.id, ...row }));
        renderResourceList();
    } catch (e) {
        console.error('Load resources error:', e);
        if ($('resourceList')) $('resourceList').innerHTML = `<div class="empty-state"><p>Error: ${e.message}</p></div>`;
    }
}

function renderResourceList() {
    const search = ($('searchResources')?.value || '').toLowerCase();
    const yearF  = $('filterYear')?.value || '';
    const typeF  = $('filterType')?.value || '';

    const list = allResources.filter(r => {
        const matchY = !yearF || r.year === parseInt(yearF);
        const matchT = !typeF || r.type === typeF;
        const matchS = !search || (r.title || '').toLowerCase().includes(search) || (r.subjectName || '').toLowerCase().includes(search);
        return matchY && matchT && matchS;
    });

    const el = $('resourceList');
    if (!el) return;
    if (list.length === 0) { el.innerHTML = '<div class="empty-state"><p>No resources found.</p></div>'; return; }

    const typeMap = {}; resourceTypes.forEach(t => typeMap[t.id] = `${t.icon} ${t.name}`);
    const ord = { 1: '1st', 2: '2nd', 3: '3rd', 4: '4th' };

    el.innerHTML = list.map(r => `
        <div class="resource-list-item">
            <div class="resource-list-info">
                <h4>${r.title}</h4>
                <p>${ord[r.year] || r.year} Year • Sem ${r.semester} • ${r.subjectName || r.subjectId} • ${typeMap[r.type] || r.type}${r.size ? ' • ' + r.size : ''}</p>
            </div>
            <div class="resource-list-actions">
                <a href="${r.fileUrl || '#'}" target="_blank" class="btn-icon" title="Open">🔗</a>
                <button class="btn-icon edit" onclick='window.openEditModal(${JSON.stringify(r).replace(/'/g, "&#39;")})' title="Edit">✏️</button>
                <button class="btn-icon delete" onclick="window.deleteResource('${r.id}','${(r.title || '').replace(/'/g, "\\'")}')">🗑️</button>
            </div>
        </div>`).join('');
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SETTINGS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function initSettingsManagement() {
    const addTypeBtn = $('addTypeBtn');
    if (addTypeBtn) {
        addTypeBtn.addEventListener('click', async () => {
            const name = $('newTypeName').value.trim(), icon = $('newTypeIcon').value.trim() || '📎';
            if (!name) return showError($('typeError'), 'Enter a name.');
            const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
            if (resourceTypes.find(t => t.id === id)) return showError($('typeError'), 'Already exists.');
            addTypeBtn.disabled = true;
            try {
                const { data, error } = await supabase.from('resource_types').insert({ id, name, icon }).select();
                if (error) throw error;
                const ref = data && data.length > 0 ? data[0] : { id: 'temp' };
                resourceTypes.push({ id, name, icon, docId: ref.id });
                renderTypeDropdowns(); renderResourceTypeList();
                $('newTypeName').value = ''; $('newTypeIcon').value = '';
                showSuccess($('typeSuccess'), `✅ "${name}" added!`);
            } catch (e) { showError($('typeError'), e.message); }
            addTypeBtn.disabled = false; addTypeBtn.textContent = 'Add Type';
        });
    }

    const addSubjBtn = $('addSubjectBtn');
    if (addSubjBtn) {
        addSubjBtn.addEventListener('click', async () => {
            const year     = parseInt($('newSubjYear').value);
            const semester = parseInt($('newSubjSem').value);
            const name     = $('newSubjName').value.trim();
            const code     = $('newSubjCode').value.trim();
            const icon     = $('newSubjIcon').value.trim() || '📖';
            if (!year || !semester || !name || !code) return showError($('subjError'), 'Fill all fields.');
            const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
            addSubjBtn.disabled = true;
            try {
                const { data, error } = await supabase.from('custom_subjects').insert({ id, name, code, icon, year, semester }).select();
                if (error) throw error;
                const ref = data && data.length > 0 ? data[0] : { id: 'temp' };
                customSubjects.push({ id, name, code, icon, year, semester, docId: ref.id });
                const sem = NEXSTUDY_DATA.years[year]?.semesters[semester];
                if (sem) { sem.subjects.push({ id, name, code, icon, resources: [] }); if ($('resYear')) $('resYear').dispatchEvent(new Event('change')); }
                renderCustomSubjectsList();
                $('newSubjName').value = ''; $('newSubjCode').value = ''; $('newSubjIcon').value = '';
                showSuccess($('subjSuccess'), `✅ "${name}" added!`);
            } catch (e) { showError($('subjError'), e.message); }
            addSubjBtn.disabled = false; addSubjBtn.textContent = 'Add Subject';
        });
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DASHBOARD
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function renderDashboard() {
    const total   = allResources.length;
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
    const week    = allResources.filter(r => {
        if (!r.createdAt) return false;
        const d = new Date(r.createdAt);
        return d >= weekAgo;
    }).length;
    const subjects = new Set(allResources.map(r => r.subjectId));
    const types    = new Set(allResources.map(r => r.type));

    if ($('statTotal'))    $('statTotal').textContent    = total;
    if ($('statWeek'))     $('statWeek').textContent     = week;
    if ($('statSubjects')) $('statSubjects').textContent = subjects.size;
    if ($('statTypes'))    $('statTypes').textContent    = types.size;

    const byYear = { 1: 0, 2: 0, 3: 0, 4: 0 };
    allResources.forEach(r => { if (byYear[r.year] !== undefined) byYear[r.year]++; });
    const ordY = { 1: '1st Year', 2: '2nd Year', 3: '3rd Year', 4: '4th Year' };
    if ($('breakdownYear')) $('breakdownYear').innerHTML = Object.entries(byYear)
        .map(([y, c]) => `<div class="breakdown-row"><span>${ordY[y]}</span><span>${c}</span></div>`).join('');

    const byType = {}; allResources.forEach(r => { byType[r.type] = (byType[r.type] || 0) + 1; });
    const tMap   = {}; resourceTypes.forEach(t => tMap[t.id] = `${t.icon} ${t.name}`);
    if ($('breakdownType')) $('breakdownType').innerHTML = Object.entries(byType)
        .map(([t, c]) => `<div class="breakdown-row"><span>${tMap[t] || t}</span><span>${c}</span></div>`).join('') || '<p>No data yet.</p>';
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// UTILITIES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function uploadToCloudinary(file, onProgress) {
    return new Promise((resolve, reject) => {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('upload_preset', window.CLOUDINARY_PRESET);
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${window.CLOUDINARY_CLOUD}/auto/upload`);
        xhr.upload.addEventListener('progress', e => {
            if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
        });
        xhr.onload  = () => xhr.status === 200 ? resolve(JSON.parse(xhr.responseText)) : reject(new Error('Upload failed'));
        xhr.onerror = () => reject(new Error('Network error'));
        xhr.send(fd);
    });
}

function showError(el, msg)   { if (!el) return; el.textContent = msg; el.style.display = 'block'; }
function showSuccess(el, msg) { if (!el) return; el.textContent = msg; el.style.display = 'block'; setTimeout(() => el.style.display = 'none', 5000); }
function formatSize(b) {
    if (b < 1024)        return b + ' B';
    if (b < 1048576)     return (b / 1024).toFixed(1) + ' KB';
    return (b / 1048576).toFixed(1) + ' MB';
}
