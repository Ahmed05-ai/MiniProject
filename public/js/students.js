/**
 * Admin Student Management Controller
 * Smart Campus Student Management System
 * 
 * Features:
 * - Real-time synchronized Student CRUD operations
 * - Live search & department/semester filter
 * - Safe deletion with referential integrity protection (Archival)
 * - CSV and JSON data export
 */

let allStudentsCache = [];
let currentEditingStudentId = null;

document.addEventListener('DOMContentLoaded', () => {
    initAdminStudents();
});

async function initAdminStudents() {
    loadDepartmentsFilter();
    await loadAdminDashboardStats();
    await loadStudentsTable();

    // Setup Real-time SSE listener
    if (window.CampusStore) {
        CampusStore.subscribe('student:updated', (updated) => {
            console.log('⚡ Admin table updating from live SSE for student:', updated.full_name);
            loadStudentsTable();
            loadAdminDashboardStats();
        });

        CampusStore.subscribe('student:created', () => {
            loadStudentsTable();
            loadAdminDashboardStats();
        });

        CampusStore.subscribe('student:deleted', () => {
            loadStudentsTable();
            loadAdminDashboardStats();
        });
    }

    // Attach search and filter events
    const searchInput = document.getElementById('student-search-input');
    if (searchInput) {
        let debounceTimer;
        searchInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                loadStudentsTable();
            }, 300);
        });
    }

    const deptFilter = document.getElementById('student-dept-filter');
    if (deptFilter) {
        deptFilter.addEventListener('change', () => {
            loadStudentsTable();
        });
    }
}

/**
 * Load Admin Dynamic Top Statistics
 */
async function loadAdminDashboardStats() {
    try {
        const data = await API.get('/dashboard/admin');
        if (data.success && data.stats) {
            setElem('admin-total-students', data.stats.totalStudents);
            setElem('admin-total-faculty', data.stats.totalFaculty);
            setElem('admin-total-departments', data.stats.totalDepartments);
            setElem('admin-total-notices', data.stats.totalNotices);
        }
    } catch (e) {
        console.warn('Could not load admin stats:', e);
    }
}

/**
 * Load Departments into filter and modal dropdowns
 */
async function loadDepartmentsFilter() {
    try {
        const data = await API.get('/departments');
        if (data.success && data.departments) {
            const filter = document.getElementById('student-dept-filter');
            const modalSelect = document.getElementById('admin-edit-dept-select');
            const addSelect = document.getElementById('add-dept-select');

            const optionsHtml = data.departments.map(d => `
                <option value="${d.id}">${d.code} - ${d.name}</option>
            `).join('');

            if (filter) {
                filter.innerHTML = `<option value="">All Departments</option>` + optionsHtml;
            }
            if (modalSelect) modalSelect.innerHTML = optionsHtml;
            if (addSelect) addSelect.innerHTML = optionsHtml;
        }
    } catch (e) {
        console.warn('Error loading departments filter:', e);
    }
}

/**
 * Load authoritative students into table
 */
async function loadStudentsTable() {
    const search = document.getElementById('student-search-input')?.value.trim() || '';
    const dept = document.getElementById('student-dept-filter')?.value || '';

    try {
        const data = await API.get('/students', { search, department: dept, limit: 100 });
        if (data.success) {
            allStudentsCache = data.students;
            renderStudentsTable(data.students);
        }
    } catch (err) {
        console.error('Failed to load students table:', err);
    }
}

/**
 * Render HTML Table with Actions
 */
function renderStudentsTable(students) {
    const tbody = document.querySelector('#admin-students-table tbody');
    if (!tbody) return;

    if (!students || students.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 30px; color: #94a3b8;">
                    No student records matching your query.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = students.map(st => `
        <tr id="student-row-${st.id}">
            <td><strong>#${st.id}</strong></td>
            <td>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(st.full_name)}&background=2563eb&color=fff&size=32&rounded=true" 
                         style="width: 32px; height: 32px; border-radius: 50%;" alt="${escapeHtml(st.full_name)}">
                    <div>
                        <div style="font-weight: 700; color: #0f172a;">${escapeHtml(st.full_name)}</div>
                        <div style="font-size: 0.78rem; color: #64748b;">${escapeHtml(st.email)}</div>
                    </div>
                </div>
            </td>
            <td><code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-weight: 600;">${escapeHtml(st.enrollment_no)}</code></td>
            <td><span class="status-badge" style="background: #eff6ff; color: #2563eb; font-weight: 600;">${escapeHtml(st.department_code || st.department_name)}</span></td>
            <td>Semester ${st.current_semester || 1}</td>
            <td><span class="status-badge ${st.status === 'Active' ? 'status-active' : 'status-late'}">${st.status}</span></td>
            <td>
                <div style="display: flex; gap: 8px;">
                    <button type="button" class="btn-primary-action" style="padding: 5px 12px; font-size: 0.8rem;" onclick="openEditStudentModal(${st.id})">
                        <i class="fa-solid fa-pen"></i> Edit
                    </button>
                    <button type="button" class="btn-primary-action" style="padding: 5px 12px; font-size: 0.8rem; background: #ef4444;" onclick="confirmDeleteStudent(${st.id}, '${escapeHtml(st.full_name)}')">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

/**
 * Open Edit Student Modal (Admin)
 */
async function openEditStudentModal(id) {
    currentEditingStudentId = id;
    const modal = document.getElementById('admin-edit-modal');
    const errBox = document.getElementById('admin-edit-error');
    if (errBox) errBox.style.display = 'none';

    try {
        const student = await CampusStore.fetchStudentById(id);
        if (!student) throw new Error('Student not found');

        document.getElementById('admin-edit-name').value = student.full_name;
        document.getElementById('admin-edit-enrollment').value = student.enrollment_no;
        document.getElementById('admin-edit-dept-select').value = student.department_id;
        document.getElementById('admin-edit-semester').value = student.current_semester;
        document.getElementById('admin-edit-email').value = student.email;
        document.getElementById('admin-edit-phone').value = student.phone || '';
        document.getElementById('admin-edit-status').value = student.status || 'Active';

        if (modal) modal.style.display = 'flex';
    } catch (e) {
        alert('Could not load student for editing: ' + e.message);
    }
}

/**
 * Save Student Changes (Admin)
 */
async function saveAdminStudentEdit() {
    if (!currentEditingStudentId) return;

    const btn = document.getElementById('admin-save-btn');
    const errBox = document.getElementById('admin-edit-error');
    if (errBox) errBox.style.display = 'none';

    const full_name = document.getElementById('admin-edit-name')?.value.trim();
    const enrollment_no = document.getElementById('admin-edit-enrollment')?.value.trim();
    const department_id = document.getElementById('admin-edit-dept-select')?.value;
    const current_semester = document.getElementById('admin-edit-semester')?.value;
    const email = document.getElementById('admin-edit-email')?.value.trim();
    const phone = document.getElementById('admin-edit-phone')?.value.trim();
    const status = document.getElementById('admin-edit-status')?.value;

    if (!full_name || !enrollment_no || !email) {
        if (errBox) {
            errBox.textContent = 'Name, enrollment number, and email are required.';
            errBox.style.display = 'block';
        }
        return;
    }

    const originalBtn = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Saving...`;

    try {
        const result = await CampusStore.updateStudent(currentEditingStudentId, {
            full_name,
            enrollment_no,
            department_id: parseInt(department_id),
            current_semester: parseInt(current_semester),
            email,
            phone,
            status
        });

        btn.disabled = false;
        btn.innerHTML = originalBtn;
        closeAdminModal('admin-edit-modal');
        showToast('✅ Student updated in database and synchronized across all portals!', 'success');
        await loadStudentsTable();
    } catch (err) {
        btn.disabled = false;
        btn.innerHTML = originalBtn;
        if (errBox) {
            errBox.textContent = err.message || 'Update failed.';
            errBox.style.display = 'block';
        } else {
            alert(err.message);
        }
    }
}

/**
 * Safe Delete with Referential Integrity
 */
async function confirmDeleteStudent(id, name) {
    if (!confirm(`Are you sure you want to remove ${name}?\n\nIf the student has academic, attendance, or fee history, the record will be safely archived without losing historical data.`)) {
        return;
    }

    try {
        const res = await API.delete(`/students/${id}`);
        if (res.success) {
            showToast(res.message, res.archived ? 'warning' : 'success');
            await loadStudentsTable();
            await loadAdminDashboardStats();
        }
    } catch (e) {
        alert('Delete failed: ' + e.message);
    }
}

/**
 * Export triggers
 */
function exportStudentsCSV() {
    window.location.href = '/api/students/export/csv';
}

function exportStudentsJSON() {
    window.location.href = '/api/students/export/json';
}

function closeAdminModal(id) {
    const m = document.getElementById(id);
    if (m) m.style.display = 'none';
}

function setElem(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
}

function showToast(msg, type = 'success') {
    alert(msg);
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
