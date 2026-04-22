const API = 'http://localhost:3000/api';

let allEmployees = [];
let cropper = null;
let croppedBlob = null;

// ===== FETCH AND RENDER EMPLOYEES =====
async function loadEmployees() {
  const res = await fetch(`${API}/employees`);
  allEmployees = await res.json();
  renderCards(allEmployees);
}

function getStatusColor(emp) {
  if (!emp.joinDate || !emp.leaveDays) return '#e94560';

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const deadline = new Date(emp.joinDate);
  deadline.setDate(deadline.getDate() + 365);

  if (emp.leaveGrantedDate && emp.leaveGrantedDate !== 'null') {
    const grantedDate = new Date(emp.leaveGrantedDate);
    grantedDate.setHours(0, 0, 0, 0);
    const leaveEndDate = new Date(grantedDate);
    leaveEndDate.setDate(leaveEndDate.getDate() + emp.leaveDays);

    // Currently on leave
    if (today >= grantedDate && today < leaveEndDate) return '#888888';

    // Leave finished — count next 365 days
    if (today >= leaveEndDate) {
      const nextDeadline = new Date(leaveEndDate);
      nextDeadline.setDate(nextDeadline.getDate() + 365);
      return today > nextDeadline ? '#e94560' : '#28a745';
    }

    // Leave granted but not started yet — check if 365 days passed
    return today > deadline ? '#e94560' : '#28a745';
  }

  return today > deadline ? '#e94560' : '#28a745';
}


function renderCards(employees) {
  const grid = document.getElementById('employeeGrid');
  grid.innerHTML = '';

  if (employees.length === 0) {
    grid.innerHTML = '<p style="color:#888; padding:20px;">No employees found.</p>';
    return;
  }

  employees.forEach(emp => {
    const card = document.createElement('div');
    card.className = 'employee-card';

    const imgSrc = emp.photo
      ? emp.photo
      : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(emp.name) + '&background=e94560&color=fff&size=128';

    const borderColor = getStatusColor(emp);
    card.innerHTML = `
      <div class="card-photo-wrapper">
        <img src="${imgSrc}" alt="${emp.name}" style="border-color: ${borderColor};" />
      </div>
      <h3 class="emp-id-badge">${emp.employeeId || ''}</h3>
      <h4 class="emp-name">${emp.name}</h4>
      <p class="phone">${emp.phone || ''}</p>
    `;

    card.addEventListener('click', () => {
      window.location.href = `employee-detail.html?id=${emp.id}`;
    });

    grid.appendChild(card);
  });
}

// ===== CUSTOM FIELDS =====
function addCustomField(label = '', value = '') {
  const container = document.getElementById('customFieldsContainer');
  const row = document.createElement('div');
  row.className = 'custom-field-row';
  row.innerHTML = `
    <input type="text" class="cf-label" placeholder="Field name (e.g. Blood Group)" value="${label}" />
    <input type="text" class="cf-value" placeholder="Value (e.g. A+)" value="${value}" />
    <button type="button" class="btn-remove-field" onclick="this.parentElement.remove()">✕</button>
  `;
  container.appendChild(row);
}

function getCustomFields() {
  const rows = document.querySelectorAll('.custom-field-row');
  const fields = [];
  rows.forEach(row => {
    const label = row.querySelector('.cf-label').value.trim();
    const value = row.querySelector('.cf-value').value.trim();
    if (label && value) fields.push({ label, value });
  });
  return fields;
}

function clearCustomFields() {
  document.getElementById('customFieldsContainer').innerHTML = '';
}

// ===== IMAGE CROPPER =====
function initCropper() {
  const empPhoto = document.getElementById('empPhoto');
  if (empPhoto) {
    empPhoto.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const cropImage = document.getElementById('cropImage');
        document.getElementById('cropContainer').style.display = 'block';
        document.getElementById('croppedPreview').style.display = 'none';
        cropImage.src = ev.target.result;
        setTimeout(() => {
          if (cropper) cropper.destroy();
          cropper = new Cropper(cropImage, {
            aspectRatio: 1,
            viewMode: 1,
            movable: true,
            zoomable: true,
            scalable: true,
            cropBoxResizable: true,
          });
        }, 200);
      };
      reader.readAsDataURL(file);
    });
  }

  const cropBtn = document.getElementById('cropBtn');
  if (cropBtn) {
    cropBtn.addEventListener('click', () => {
      if (!cropper) return;
      const canvas = cropper.getCroppedCanvas({ width: 300, height: 300 });
      canvas.toBlob((blob) => {
        croppedBlob = blob;
        const preview = document.getElementById('croppedPreview');
        preview.src = URL.createObjectURL(blob);
        preview.style.display = 'block';
        document.getElementById('cropContainer').style.display = 'none';
        cropper.destroy();
        cropper = null;
      }, 'image/jpeg', 0.9);
    });
  }
}

// ===== SEARCH =====
function initSearch() {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.toLowerCase();
      const filtered = allEmployees.filter(emp =>
        emp.name?.toLowerCase().includes(query) ||
        emp.employeeId?.toLowerCase().includes(query) ||
        emp.role?.toLowerCase().includes(query) ||
        emp.department?.toLowerCase().includes(query)
      );
      renderCards(filtered);
    });
  }
}

// ===== MODAL =====
function openAddModal() {
  document.getElementById('modalTitle').textContent = 'Add Employee';
  document.getElementById('employeeForm').reset();
  document.getElementById('employeeId').value = '';
  document.getElementById('cropContainer').style.display = 'none';
  document.getElementById('croppedPreview').style.display = 'none';
  clearCustomFields();
  croppedBlob = null;
  if (cropper) { cropper.destroy(); cropper = null; }
  document.getElementById('modalOverlay').classList.add('active');
}

function openEditModal(id) {
  const emp = allEmployees.find(e => e.id === id);
  if (!emp) return;
  document.getElementById('modalTitle').textContent = 'Edit Employee';
  document.getElementById('employeeId').value = emp.id;
  document.getElementById('empEmployeeId').value = emp.employeeId || '';
  document.getElementById('empName').value = emp.name || '';
  document.getElementById('empRole').value = emp.role || '';
  document.getElementById('empEmail').value = emp.email || '';
  document.getElementById('empPhone').value = emp.phone || '';
  document.getElementById('empDepartment').value = emp.department || '';
  document.getElementById('empJoinDate').value = emp.joinDate || '';
  document.getElementById('empLeaveDays').value = emp.leaveDays || '';
  document.getElementById('empLeaveGrantedDate').value = emp.leaveGrantedDate || '';
  document.getElementById('cropContainer').style.display = 'none';
  document.getElementById('croppedPreview').style.display = 'none';
  clearCustomFields();
  if (emp.customFields && emp.customFields.length > 0) {
    emp.customFields.forEach(cf => addCustomField(cf.label, cf.value));
  }
  croppedBlob = null;
  if (cropper) { cropper.destroy(); cropper = null; }
  document.getElementById('modalOverlay').classList.add('active');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('active');
  if (cropper) { cropper.destroy(); cropper = null; }
  croppedBlob = null;
  clearCustomFields();
}

// ===== BLOB TO BASE64 =====
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function getPhotoBase64() {
  if (croppedBlob) return await blobToBase64(croppedBlob);
  const empPhoto = document.getElementById('empPhoto');
  if (empPhoto && empPhoto.files && empPhoto.files[0]) {
    return await blobToBase64(empPhoto.files[0]);
  }
  return null;
}

// ===== FORM SUBMIT =====
function initForm() {
  const employeeForm = document.getElementById('employeeForm');
  if (employeeForm) {
    employeeForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const id = document.getElementById('employeeId').value;
      let photoUrl = '';

      const base64 = await getPhotoBase64();
      if (base64) {
        const uploadRes = await fetch(`${API}/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64 })
        });
        const uploadData = await uploadRes.json();
        photoUrl = uploadData.photoUrl;
        croppedBlob = null;
      }

      const employeeData = {
        employeeId: document.getElementById('empEmployeeId').value,
        name: document.getElementById('empName').value,
        role: document.getElementById('empRole').value,
        email: document.getElementById('empEmail').value,
        phone: document.getElementById('empPhone').value,
        department: document.getElementById('empDepartment').value,
        joinDate: document.getElementById('empJoinDate').value,
        leaveDays: parseInt(document.getElementById('empLeaveDays').value) || 0,
        leaveGrantedDate: document.getElementById('empLeaveGrantedDate').value || null,
        customFields: getCustomFields(),
      };

      if (photoUrl) {
        employeeData.photo = photoUrl;
      } else if (id) {
        const existing = allEmployees.find(e => e.id === id);
        if (existing && existing.photo) employeeData.photo = existing.photo;
      }

      if (id) {
        await fetch(`${API}/employees/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(employeeData)
        });
      } else {
        await fetch(`${API}/employees`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(employeeData)
        });
      }

      closeModal();
      loadEmployees();
    });
  }
}

// ===== EXPORT CSV =====
function exportCSV() {
  window.location.href = `${API}/employees/export`;
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  initCropper();
  initSearch();
  initForm();
  if (document.getElementById('employeeGrid')) {
    loadEmployees();
  }
});