const VAPI = 'http://localhost:3000/api/vehicles';

// Helper: convert blob to base64
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

let vehCropper = null;
let vehCroppedBlob = null;
let allVehicles = [];
let activeVehicleFilter = 'all';

// ===== LOAD VEHICLES =====
async function loadVehicles() {
  const res = await fetch(VAPI);
  allVehicles = await res.json();
  applyVehicleFilters();
}

function getExpiryStatus(expiryDate) {
  if (!expiryDate) return null;
  const today = new Date(); today.setHours(0,0,0,0);
  const expiry = new Date(expiryDate); expiry.setHours(0,0,0,0);
  const daysLeft = Math.round((expiry - today) / (1000 * 60 * 60 * 24));
  if (daysLeft < 0)   return { key: 'expired', color: '#e94560' };
  if (daysLeft <= 45) return { key: 'expiring', color: '#e67e22' };
  if (daysLeft <= 90) return { key: 'due', color: '#f1c40f' };
  return                     { key: 'active', color: '#27ae60' };
}

function vehicleMatchesFilter(v) {
  const status = v.status || 'Active';
  const mulkiyaStatus = v.mulkiyaNumber ? getExpiryStatus(v.mulkiyaExpiryDate) : null;
  const insuranceStatus = v.insuranceExpiry ? getExpiryStatus(v.insuranceExpiry) : null;

  switch (activeVehicleFilter) {
    case 'active': return status === 'Active';
    case 'in-service': return status === 'In Service';
    case 'maintenance': return status === 'Under Maintenance';
    case 'inactive': return status === 'Inactive';
    case 'mulkiya-expired': return mulkiyaStatus?.key === 'expired';
    case 'insurance-expired': return insuranceStatus?.key === 'expired';
    case 'documents-expiring': return mulkiyaStatus?.key === 'expiring' || insuranceStatus?.key === 'expiring';
    case 'documents-due': return mulkiyaStatus?.key === 'due' || insuranceStatus?.key === 'due';
    default: return true;
  }
}

function applyVehicleFilters() {
  const searchInput = document.getElementById('searchInput');
  const q = searchInput ? searchInput.value.toLowerCase() : '';
  const filtered = allVehicles.filter(v => {
    const customFieldText = (v.customFields || []).map(cf => `${cf.label} ${cf.value}`).join(' ');
    const matchesSearch = !q || [
      v.name, v.vehicleId, v.plate, v.driver, v.type, v.status,
      v.mulkiyaNumber, v.mulkiyaIssueDate, v.mulkiyaExpiryDate,
      v.insuranceProvider, v.insuranceStartDate, v.insuranceExpiry,
      v.regDate,
      customFieldText
    ].some(val => (val || '').toString().toLowerCase().includes(q));
    return matchesSearch && vehicleMatchesFilter(v);
  });
  renderVehicleCards(filtered);
}

function initVehicleSearchFilters() {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', applyVehicleFilters);
  }

  const filterToggle = document.getElementById('vehicleFilterToggle');
  const filterMenu = document.getElementById('vehicleFilterMenu');
  if (filterToggle && filterMenu) {
    filterToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      filterMenu.classList.toggle('active');
    });

    filterMenu.querySelectorAll('button[data-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        activeVehicleFilter = btn.dataset.filter;
        filterMenu.querySelectorAll('button').forEach(item => item.classList.remove('active'));
        btn.classList.add('active');
        filterMenu.classList.remove('active');
        applyVehicleFilters();
      });
    });

    document.addEventListener('click', (e) => {
      if (!filterMenu.contains(e.target) && !filterToggle.contains(e.target)) {
        filterMenu.classList.remove('active');
      }
    });
  }
}

// ===== RENDER CARDS =====
function renderVehicleCards(vehicles) {
  const grid = document.getElementById('vehicleGrid');
  if (!vehicles.length) {
    grid.innerHTML = '<p style="color:#888; text-align:center; margin-top:80px;">No vehicles found.</p>';
    return;
  }

  grid.innerHTML = vehicles.map(v => {
    const statusColor = getVehicleStatusColor(v.status);

    const mulkiyaColor = v.mulkiyaNumber ? getExpiryStatus(v.mulkiyaExpiryDate)?.color : null;
    const insuranceColor = v.insuranceExpiry ? getExpiryStatus(v.insuranceExpiry)?.color : null;

    const bookmarkHTML = `
      ${mulkiyaColor   ? `<div class="v-ribbon left"  style="--r-color:${mulkiyaColor};"><span class="v-ribbon-letter">M</span></div>` : ''}
      ${insuranceColor ? `<div class="v-ribbon right" style="--r-color:${insuranceColor};"><span class="v-ribbon-letter">I</span></div>` : ''}
    `;

    const photoHTML = v.photo
      ? `<img src="${v.photo}" alt="${v.name}" style="width:100%; height:110px; object-fit:cover; border-radius:8px; border:3px solid ${statusColor};" />`
      : `<div style="width:100%; height:110px; border-radius:8px; background:${statusColor}; display:flex; align-items:center; justify-content:center; font-size:48px;">🚗</div>`;

    return `
      <div class="employee-card vehicle-card" onclick="window.location.href='vehicle-detail.html?id=${v.id}'" style="cursor:pointer; position:relative; --status-color:${statusColor};">
        ${bookmarkHTML}
        <div class="card-photo" style="position:relative;">
          ${photoHTML}
        </div>
        <div class="card-info">
          <h3 style="font-size:18px; font-weight:700; color:#1a1a2e; margin:0 0 4px 0;">${v.vehicleId || ''}</h3>
          <p style="font-size:15px; font-weight:700; color:#1a1a2e; margin:0 0 4px 0;">${v.name || ''}</p>
          <p style="font-size:13px; font-weight:700; color:#999; margin:0;">${v.plate || ''}</p>
        </div>
      </div>`;
  }).join('');
}

// ===== STATUS COLOR =====
function getVehicleStatusColor(status) {
  switch (status) {
    case 'Active': return '#27ae60';
    case 'In Service': return '#2980b9';
    case 'Under Maintenance': return '#e67e22';
    case 'Inactive': return '#e94560';
    default: return '#27ae60';
  }
}

// ===== LOAD EMPLOYEES INTO DRIVER SELECT =====
async function loadEmployeesIntoDriverSelect(currentVal = '') {
  const select = document.getElementById('vehDriver');
  if (!select) return;
  try {
    const res = await fetch('http://localhost:3000/api/employees');
    const employees = await res.json();
    select.innerHTML = '<option value="">Select employee...</option>';
    employees.forEach(e => {
      const opt = document.createElement('option');
      opt.value = e.name;
      opt.textContent = `${e.name} (${e.employeeId || ''})`;
      if (e.name === currentVal) opt.selected = true;
      select.appendChild(opt);
    });
  } catch(err) {}
}

// ===== OPEN ADD MODAL =====
async function openAddVehicleModal() {
  document.getElementById('vehicleModalTitle').textContent = 'Add Vehicle';
  document.getElementById('vehicleForm').reset();
  document.getElementById('vehicleId').value = '';
  document.getElementById('vehCropContainer').style.display = 'none';
  document.getElementById('vehCroppedPreview').style.display = 'none';
  document.getElementById('vehCustomFieldsContainer').innerHTML = '';
  vehCroppedBlob = null;
  if (vehCropper) { vehCropper.destroy(); vehCropper = null; }
  await loadEmployeesIntoDriverSelect('');
  document.getElementById('vehicleModalOverlay').classList.add('active');
}

// ===== OPEN EDIT MODAL =====
async function openEditVehicleModal(id) {
  const res = await fetch(`${VAPI}/${id}`);
  const v = await res.json();

  document.getElementById('vehicleModalTitle').textContent = 'Edit Vehicle';
  document.getElementById('vehicleId').value = v.id;
  document.getElementById('vehVehicleId').value = v.vehicleId || '';
  document.getElementById('vehName').value = v.name || '';
  document.getElementById('vehPlate').value = v.plate || '';
  document.getElementById('vehType').value = v.type || '';
  await loadEmployeesIntoDriverSelect(v.driver || '');
  document.getElementById('vehRegDate').value = v.regDate || '';
  document.getElementById('vehInsuranceProvider').value = v.insuranceProvider || '';
  document.getElementById('vehPolicyNumber').value = v.policyNumber || '';
  document.getElementById('vehInsuranceStartDate').value = v.insuranceStartDate || '';
  document.getElementById('vehInsuranceExpiry').value = v.insuranceExpiry || '';
  document.getElementById('vehMulkiyaNumber').value = v.mulkiyaNumber || '';
  document.getElementById('vehMulkiyaIssueDate').value = v.mulkiyaIssueDate || '';
  document.getElementById('vehMulkiyaExpiryDate').value = v.mulkiyaExpiryDate || '';
  document.getElementById('vehStatus').value = v.status || 'Active';



  const preview = document.getElementById('vehCroppedPreview');
  if (v.photo) { preview.src = v.photo; preview.style.display = 'block'; }
  else { preview.style.display = 'none'; }

  document.getElementById('vehCropContainer').style.display = 'none';
  vehCroppedBlob = null;
  if (vehCropper) { vehCropper.destroy(); vehCropper = null; }

  const container = document.getElementById('vehCustomFieldsContainer');
  container.innerHTML = '';
  if (v.customFields) {
    v.customFields.forEach(f => addVehicleCustomField(f.label, f.value));
  }

  document.getElementById('vehicleModalOverlay').classList.add('active');
}

// ===== CLOSE MODAL =====
function closeVehicleModal() {
  document.getElementById('vehicleModalOverlay').classList.remove('active');
  vehCroppedBlob = null;
  if (vehCropper) { vehCropper.destroy(); vehCropper = null; }
}

// ===== CUSTOM FIELDS =====
function addVehicleCustomField(label = '', value = '') {
  const container = document.getElementById('vehCustomFieldsContainer');
  const div = document.createElement('div');
  div.className = 'custom-field-row form-group';
  div.style.display = 'flex';
  div.style.gap = '8px';
  div.style.alignItems = 'center';
  div.innerHTML = `
    <input type="text" class="custom-label" placeholder="Field name" value="${label}" style="flex:1;" />
    <input type="text" class="custom-value" placeholder="Value" value="${value}" style="flex:2;" />
    <button type="button" onclick="this.parentElement.remove()" style="background:#e94560; color:#fff; border:none; border-radius:6px; padding:6px 10px; cursor:pointer;">✕</button>
  `;
  container.appendChild(div);
}

// ===== EXPORT CSV =====
function exportVehicleCSV() {
  fetch(VAPI)
    .then(r => r.json())
    .then(vehicles => {
      if (!vehicles.length) return alert('No vehicles to export.');
      const headers = ['Vehicle ID', 'Name', 'Plate', 'Type', 'Driver', 'Fines', 'Reg Date', 'Insurance Expiry', 'Status'];
      const rows = vehicles.map(v => {
        const finesSummary = (v.fines && v.fines.length > 0)
          ? v.fines.map(f => `OMR ${f.amount} (${f.driver || '—'}) [${f.paid ? 'Paid' : 'Pending'}]`).join(' | ')
          : 'None';
        return [
          v.vehicleId, v.name, v.plate, v.type, v.driver, finesSummary, v.regDate, v.insuranceExpiry, v.status
        ];
      });
      const csv = [headers, ...rows].map(r => r.map(c => `"${c || ''}"`).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'vehicles.csv';
      a.click();
    });
}

// ===== IMAGE CROPPER =====
function initVehicleCropper() {
  const vehPhoto = document.getElementById('vehPhoto');
  if (vehPhoto) {
    vehPhoto.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const cropImage = document.getElementById('vehCropImage');
        cropImage.onload = () => {
          if (vehCropper) vehCropper.destroy();
          vehCropper = new Cropper(cropImage, {
            aspectRatio: 16 / 9,
            viewMode: 1,
            movable: true,
            zoomable: true,
          });
        };
        cropImage.src = ev.target.result;
        document.getElementById('vehCropContainer').style.display = 'block';
        document.getElementById('vehCroppedPreview').style.display = 'none';
      };
      reader.readAsDataURL(file);
    });
  }

  const cropBtn = document.getElementById('vehCropBtn');
  if (cropBtn) {
    cropBtn.addEventListener('click', () => {
      if (!vehCropper) return;
      const canvas = vehCropper.getCroppedCanvas({ width: 400, height: 250 });
      canvas.toBlob((blob) => {
        vehCroppedBlob = blob;
        const preview = document.getElementById('vehCroppedPreview');
        preview.src = URL.createObjectURL(blob);
        preview.style.display = 'block';
        document.getElementById('vehCropContainer').style.display = 'none';
        vehCropper.destroy();
        vehCropper = null;
      }, 'image/jpeg', 0.9);
    });
  }
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  initVehicleCropper();
  initVehicleSearchFilters();
  loadVehicles();

  const params = new URLSearchParams(window.location.search);
  const editId = params.get('edit');
  if (editId) {
    setTimeout(() => openEditVehicleModal(editId), 500);
  }

  // ===== SAVE VEHICLE =====
  document.getElementById('vehicleForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    let photoUrl = '';
    if (vehCroppedBlob) {
      const base64 = await blobToBase64(vehCroppedBlob);
      const uploadRes = await fetch('http://localhost:3000/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64 })
      });
      const uploadData = await uploadRes.json();
      photoUrl = uploadData.photoUrl;
      vehCroppedBlob = null;
    }

    const customFields = [];
    document.querySelectorAll('.custom-field-row').forEach(row => {
      const label = row.querySelector('.custom-label').value.trim();
      const value = row.querySelector('.custom-value').value.trim();
      if (label) customFields.push({ label, value });
    });

    const id = document.getElementById('vehicleId').value;
    const payload = {
      vehicleId: document.getElementById('vehVehicleId').value.trim(),
      name: document.getElementById('vehName').value.trim(),
      plate: document.getElementById('vehPlate').value.trim(),
      type: document.getElementById('vehType').value,
      driver: document.getElementById('vehDriver').value.trim(),
      regDate: document.getElementById('vehRegDate').value,
      insuranceProvider: document.getElementById('vehInsuranceProvider').value.trim(),
      policyNumber: document.getElementById('vehPolicyNumber').value.trim(),
      insuranceStartDate: document.getElementById('vehInsuranceStartDate').value,
      insuranceExpiry: document.getElementById('vehInsuranceExpiry').value,
      mulkiyaNumber: document.getElementById('vehMulkiyaNumber').value,
      mulkiyaIssueDate: document.getElementById('vehMulkiyaIssueDate').value,
      mulkiyaExpiryDate: document.getElementById('vehMulkiyaExpiryDate').value,
      status: document.getElementById('vehStatus').value,
      customFields
    };

    if (photoUrl) payload.photo = photoUrl;

    const method = id ? 'PUT' : 'POST';
    const url = id ? `${VAPI}/${id}` : VAPI;

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    closeVehicleModal();
    loadVehicles();
  });
});
