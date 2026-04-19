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

    // Render custom fields on card
    let customFieldsHTML = '';
    if (emp.customFields && emp.customFields.length > 0) {
      emp.customFields.forEach(cf => {
        if (cf.label && cf.value) {
          customFieldsHTML += `<p class="custom-field"><span>${cf.label}:</span> ${cf.value}</p>`;
        }
      });
    }

    card.innerHTML = `
      <img src="${imgSrc}" alt="${emp.name}" />
      <h3>${emp.name}</h3>
      <p class="role">${emp.role || ''}</p>
      <p class="department">${emp.department || ''}</p>
      <p class="email">${emp.email || ''}</p>
      <p class="phone">${emp.phone || ''}</p>
      ${customFieldsHTML}
      <div class="card-actions">
        <button class="btn-edit" onclick="openEditModal('${emp.id}')">Edit</button>
        <button class="btn-delete" onclick="deleteEmployee('${emp.id}')">Delete</button>
      </div>
    `;
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
  document.getElementById('empName').value = emp.name || '';
  document.getElementById('empRole').value = emp.role || '';
  document.getElementById('empEmail').value = emp.email || '';
  document.getElementById('empPhone').value = emp.phone || '';
  document.getElementById('empDepartment').value = emp.department || '';
  document.getElementById('cropContainer').style.display = 'none';
  document.getElementById('croppedPreview').style.display = 'none';
  clearCustomFields();

  // Load existing custom fields
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

// ===== CONVERT BLOB TO BASE64 =====
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// ===== GET PHOTO AS BASE64 =====
async function getPhotoBase64() {
  if (croppedBlob) return await blobToBase64(croppedBlob);
  const empPhoto = document.getElementById('empPhoto');
  if (empPhoto && empPhoto.files && empPhoto.files[0]) {
    return await blobToBase64(empPhoto.files[0]);
  }
  return null;
}

// ===== ADD / EDIT EMPLOYEE FORM SUBMIT =====
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
        name: document.getElementById('empName').value,
        role: document.getElementById('empRole').value,
        email: document.getElementById('empEmail').value,
        phone: document.getElementById('empPhone').value,
        department: document.getElementById('empDepartment').value,
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

// ===== DELETE EMPLOYEE =====
async function deleteEmployee(id) {
  if (!confirm('Are you sure you want to delete this employee?')) return;
  await fetch(`${API}/employees/${id}`, { method: 'DELETE' });
  loadEmployees();
}

// ===== EXPORT CSV =====
function exportCSV() {
  window.location.href = `${API}/employees/export`;
}

// ===== LOAD ON PAGE READY =====
document.addEventListener('DOMContentLoaded', () => {
  initCropper();
  initSearch();
  initForm();
  if (document.getElementById('employeeGrid')) {
    loadEmployees();
  }
});