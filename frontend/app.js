const API = 'http://localhost:3000/api';

let allEmployees = [];
let cropper = null;
let croppedBlob = null;
let webcamStream = null;

// ===== FETCH AND RENDER EMPLOYEES =====
async function loadEmployees() {
  const res = await fetch(`${API}/employees`);
  allEmployees = await res.json();
  renderCards(allEmployees);
}

function getStatusColor(emp) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if on leave → grey
  if (emp.leaveGrantedDate && emp.leaveGrantedDate !== 'null') {
    const grantedDate = new Date(emp.leaveGrantedDate);
    grantedDate.setHours(0, 0, 0, 0);
    let leaveEndDate;
    if (emp.extendLeaveUntil && emp.extendLeaveUntil !== 'null') {
      leaveEndDate = new Date(emp.extendLeaveUntil);
      leaveEndDate.setHours(0, 0, 0, 0);
      leaveEndDate.setDate(leaveEndDate.getDate() + 1);
    } else {
      leaveEndDate = new Date(grantedDate);
      leaveEndDate.setDate(leaveEndDate.getDate() + (emp.leaveDays || 0));
    }
    if (today >= grantedDate && today < leaveEndDate) return '#888888';
  }

  // Visa expiry logic
  if (!emp.visaDate) return '#27ae60';
  const expiry = new Date(emp.visaDate);
  expiry.setHours(0, 0, 0, 0);
  const daysLeft = Math.round((expiry - today) / (1000 * 60 * 60 * 24));

  if (daysLeft < 0)   return '#e94560'; // expired → red
  if (daysLeft <= 45) return '#e67e22'; // 45 days → orange
  if (daysLeft <= 90) return '#f1c40f'; // 3 months → yellow
  return '#27ae60';                     // safe → green
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

// ===== WEBCAM =====
async function openWebcam() {
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  if (isMobile) {
    document.getElementById('empCamera').click();
    return;
  }

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    alert('Your browser does not support camera access. Please use Chrome or Edge.');
    return;
  }

  const modal = document.getElementById('webcamModal');
  if (!modal) {
    alert('Webcam modal not found.');
    return;
  }
  modal.style.display = 'flex';

  try {
    webcamStream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' }
    });
    document.getElementById('webcamVideo').srcObject = webcamStream;
  } catch (err) {
    modal.style.display = 'none';
    if (err.name === 'NotAllowedError') {
      alert('Camera access denied. Please click the 🔒 lock icon in the address bar and set Camera to Allow, then refresh.');
    } else if (err.name === 'NotFoundError') {
      alert('No camera found on this device.');
    } else {
      alert('Camera error: ' + err.message);
    }
  }
}

function closeWebcam() {
  document.getElementById('webcamModal').style.display = 'none';
  if (webcamStream) {
    webcamStream.getTracks().forEach(t => t.stop());
    webcamStream = null;
  }
}

// ===== IMAGE CROPPER =====
function initCropper() {
  function handlePhotoInput(e) {
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
          aspectRatio: 1, viewMode: 1,
          movable: true, zoomable: true,
          scalable: true, cropBoxResizable: true,
        });
      }, 200);
    };
    reader.readAsDataURL(file);
  }

  const empPhoto = document.getElementById('empPhoto');
  if (empPhoto) empPhoto.addEventListener('change', handlePhotoInput);

  const empCamera = document.getElementById('empCamera');
  if (empCamera) empCamera.addEventListener('change', handlePhotoInput);

  // Webcam close
  const webcamCloseBtn = document.getElementById('webcamCloseBtn');
  if (webcamCloseBtn) webcamCloseBtn.addEventListener('click', closeWebcam);

  // Webcam capture
  const webcamCaptureBtn = document.getElementById('webcamCaptureBtn');
  if (webcamCaptureBtn) {
    webcamCaptureBtn.addEventListener('click', () => {
      const video = document.getElementById('webcamVideo');
      const canvas = document.getElementById('webcamCanvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0);
      canvas.toBlob((blob) => {
        closeWebcam();
        const url = URL.createObjectURL(blob);
        const cropImage = document.getElementById('cropImage');
        document.getElementById('cropContainer').style.display = 'block';
        document.getElementById('croppedPreview').style.display = 'none';
        cropImage.src = url;
        setTimeout(() => {
          if (cropper) cropper.destroy();
          cropper = new Cropper(cropImage, {
            aspectRatio: 1, viewMode: 1,
            movable: true, zoomable: true,
            scalable: true, cropBoxResizable: true,
          });
        }, 200);
      }, 'image/jpeg', 0.9);
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
  document.getElementById('empExtendLeaveUntil').value = emp.extendLeaveUntil || '';
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
        extendLeaveUntil: document.getElementById('empExtendLeaveUntil').value || null,
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

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  initCropper();
  initSearch();
  initForm();
  if (document.getElementById('employeeGrid')) {
    loadEmployees();
  }
});