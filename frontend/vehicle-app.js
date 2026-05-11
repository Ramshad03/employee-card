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

// ===== LOAD VEHICLES =====
async function loadVehicles() {
  const res = await fetch(VAPI);
  const vehicles = await res.json();
  renderVehicleCards(vehicles);

  document.getElementById('searchInput').addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    const filtered = vehicles.filter(v =>
      (v.name || '').toLowerCase().includes(q) ||
      (v.vehicleId || '').toLowerCase().includes(q) ||
      (v.plate || '').toLowerCase().includes(q) ||
      (v.driver || '').toLowerCase().includes(q)
    );
    renderVehicleCards(filtered);
  });
}

// ===== RENDER CARDS =====
function renderVehicleCards(vehicles) {
  const grid = document.getElementById('vehicleGrid');
  if (!vehicles.length) {
    grid.innerHTML = '<p style="color:#888; text-align:center; margin-top:40px;">No vehicles found.</p>';
    return;
  }

  grid.innerHTML = vehicles.map(v => {
    const statusColor = getVehicleStatusColor(v.status);
    const photoHTML = v.photo
      ? `<img src="${v.photo}" alt="${v.name}" style="width:100px; height:70px; object-fit:cover; border-radius:8px; border:3px solid ${statusColor};" />`
      : `<div style="width:100px; height:70px; border-radius:8px; background:${statusColor}; display:flex; align-items:center; justify-content:center; font-size:28px;">🚗</div>`;

    return `
      <div class="employee-card">
        <div class="card-photo">
          ${photoHTML}
        </div>
        <div class="card-info">
          <h3 style="font-size:18px; font-weight:700; color:#1a1a2e; margin:0 0 4px 0;">${v.vehicleId || ''}</h3>
          <p style="font-size:15px; font-weight:600; color:#1a1a2e; margin:0 0 4px 0;">${v.name || ''}</p>
          <p style="font-size:13px; color:#999; margin:0;">${v.plate || ''}</p>
        </div>
        <div class="card-actions">
          <button class="btn-edit" onclick="openEditVehicleModal('${v.id}')">✏️ Edit</button>
          <button class="btn-delete" onclick="deleteVehicle('${v.id}')">🗑️ Delete</button>
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

// ===== OPEN ADD MODAL =====
function openAddVehicleModal() {
  document.getElementById('vehicleModalTitle').textContent = 'Add Vehicle';
  document.getElementById('vehicleForm').reset();
  document.getElementById('vehicleId').value = '';
  document.getElementById('vehCropContainer').style.display = 'none';
  document.getElementById('vehCroppedPreview').style.display = 'none';
  document.getElementById('vehCustomFieldsContainer').innerHTML = '';
  vehCroppedBlob = null;
  if (vehCropper) { vehCropper.destroy(); vehCropper = null; }
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
  document.getElementById('vehDriver').value = v.driver || '';
  document.getElementById('vehRegDate').value = v.regDate || '';
  document.getElementById('vehInsuranceExpiry').value = v.insuranceExpiry || '';
  document.getElementById('vehStatus').value = v.status || 'Active';

  // Load existing photo preview
  const preview = document.getElementById('vehCroppedPreview');
  if (v.photo) {
    preview.src = v.photo;
    preview.style.display = 'block';
  } else {
    preview.style.display = 'none';
  }

  // Load custom fields
  const container = document.getElementById('vehCustomFieldsContainer');
  container.innerHTML = '';
  if (v.customFields) {
    v.customFields.forEach(f => {
      addVehicleCustomField(f.label, f.value);
    });
  }

  document.getElementById('vehicleModalOverlay').classList.add('active');
}

// ===== CLOSE MODAL =====
function closeVehicleModal() {
  document.getElementById('vehicleModalOverlay').classList.remove('active');
  vehCroppedBlob = null;
  if (vehCropper) { vehCropper.destroy(); vehCropper = null; }
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
    insuranceExpiry: document.getElementById('vehInsuranceExpiry').value,
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

// ===== DELETE VEHICLE =====
async function deleteVehicle(id) {
  if (!confirm('Delete this vehicle?')) return;
  await fetch(`${VAPI}/${id}`, { method: 'DELETE' });
  loadVehicles();
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
      const headers = ['Vehicle ID', 'Name', 'Plate', 'Type', 'Driver', 'Reg Date', 'Insurance Expiry', 'Status'];
      const rows = vehicles.map(v => [
        v.vehicleId, v.name, v.plate, v.type, v.driver, v.regDate, v.insuranceExpiry, v.status
      ]);
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
  loadVehicles();
});