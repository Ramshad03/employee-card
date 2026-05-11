const NOTIF_API = 'http://localhost:3000/api';

function getReadNotifs() {
  try {
    return JSON.parse(localStorage.getItem('readNotifications') || '{}');
  } catch { return {}; }
}

function saveReadNotif(id) {
  const read = getReadNotifs();
  read[id] = true;
  localStorage.setItem('readNotifications', JSON.stringify(read));
}

async function loadNotifications() {
  try {
    const [empRes, vehRes] = await Promise.all([
      fetch(`${NOTIF_API}/employees`),
      fetch(`${NOTIF_API}/vehicles`)
    ]);
    const employees = await empRes.json();
    const vehicles = await vehRes.json();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const notifications = [];

    function getDaysLeft(dateStr) {
      if (!dateStr || dateStr === 'null') return null;
      const d = new Date(dateStr);
      if (isNaN(d)) return null;
      d.setHours(0, 0, 0, 0);
      return Math.round((d - today) / (1000 * 60 * 60 * 24));
    }

    function getColorInfo(daysLeft) {
      if (daysLeft === null) return null;
      if (daysLeft < 0)   return { color: '#e94560', level: 'red' };
      if (daysLeft <= 45) return { color: '#e67e22', level: 'orange' };
      if (daysLeft <= 90) return { color: '#f1c40f', level: 'yellow' };
      return null;
    }

    function formatDays(daysLeft) {
      if (daysLeft < 0)   return `expired ${Math.abs(daysLeft)} day${Math.abs(daysLeft) !== 1 ? 's' : ''} ago`;
      if (daysLeft === 0) return 'expires today';
      return `expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`;
    }

    // Employee visa notifications
    employees.forEach(emp => {
      if (!emp.visaDate || emp.visaDate === 'null') return;
      const daysLeft = getDaysLeft(emp.visaDate);
      const ci = getColorInfo(daysLeft);
      if (!ci) return;
      // ID includes level so escalating status (yellow→orange→red) re-triggers as unread
      const id = `emp_visa_${emp.id}_${ci.level}`;
      notifications.push({ id, icon: '👤', color: ci.color, message: `${emp.name}'s visa ${formatDays(daysLeft)}`, daysLeft });
    });

    // Vehicle mulkiya notifications
    vehicles.forEach(v => {
      if (!v.mulkiyaNumber) return;
      const daysLeft = getDaysLeft(v.mulkiyaExpiryDate);
      const ci = getColorInfo(daysLeft);
      if (!ci) return;
      const id = `veh_mulkiya_${v.id}_${ci.level}`;
      notifications.push({ id, icon: '🚗', color: ci.color, message: `${v.name} — Mulkiya ${formatDays(daysLeft)}`, daysLeft });
    });

    // Vehicle insurance notifications
    vehicles.forEach(v => {
      if (!v.insuranceExpiry) return;
      const daysLeft = getDaysLeft(v.insuranceExpiry);
      const ci = getColorInfo(daysLeft);
      if (!ci) return;
      const id = `veh_insurance_${v.id}_${ci.level}`;
      notifications.push({ id, icon: '🚗', color: ci.color, message: `${v.name} — Insurance ${formatDays(daysLeft)}`, daysLeft });
    });

    // Sort: most urgent first
    notifications.sort((a, b) => a.daysLeft - b.daysLeft);

    renderNotifications(notifications);
  } catch (e) {
    // Server may not be running — fail silently
  }
}

function renderNotifications(notifications) {
  const badge = document.getElementById('notifBadge');
  const list = document.getElementById('notifList');
  if (!badge || !list) return;

  if (notifications.length === 0) {
    badge.style.display = 'none';
    list.innerHTML = '<div class="notif-empty">✓ All documents are up to date</div>';
    return;
  }

  const read = getReadNotifs();
  const unreadCount = notifications.filter(n => !read[n.id]).length;
  updateBadge(unreadCount);

  list.innerHTML = notifications.map(n => {
    const isUnread = !read[n.id];
    return `
      <div class="notif-item${isUnread ? ' notif-unread' : ''}" onclick="markAsRead('${n.id}', this)">
        <span class="notif-dot" style="background:${n.color};"></span>
        <span class="notif-text">${n.icon} ${n.message}</span>
        ${isUnread ? '<span class="notif-new-pill">NEW</span>' : ''}
      </div>`;
  }).join('');
}

function updateBadge(count) {
  const badge = document.getElementById('notifBadge');
  if (!badge) return;
  if (count <= 0) {
    badge.style.display = 'none';
  } else {
    badge.textContent = count > 99 ? '99+' : count;
    badge.style.display = 'flex';
  }
}

function markAsRead(id, el) {
  if (!el.classList.contains('notif-unread')) return;
  saveReadNotif(id);
  el.classList.remove('notif-unread');
  const pill = el.querySelector('.notif-new-pill');
  if (pill) pill.remove();
  const badge = document.getElementById('notifBadge');
  if (badge) {
    const current = parseInt(badge.textContent) || 0;
    updateBadge(current - 1);
  }
}

function toggleNotifPanel() {
  const panel = document.getElementById('notifPanel');
  if (panel) panel.classList.toggle('open');
}

document.addEventListener('click', (e) => {
  const wrapper = document.getElementById('notifWrapper');
  if (wrapper && !wrapper.contains(e.target)) {
    const panel = document.getElementById('notifPanel');
    if (panel) panel.classList.remove('open');
  }
});

document.addEventListener('DOMContentLoaded', loadNotifications);
