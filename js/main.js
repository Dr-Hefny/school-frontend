const API_BASE_URL = 'https://rostomschool-dr-eb6d.up.railway.app';
function showToast(m, t = 'success') { const x = document.getElementById('toast'); if (!x) return; x.innerHTML = `<i class="fa-solid ${t === 'success' ? 'fa-circle-check' : 'fa-triangle-exclamation'}"></i> ${m}`; x.style.background = t === 'success' ? '#059669' : '#dc2626'; x.style.display = 'flex'; setTimeout(() => x.style.display = 'none', 3500); }
function logout() { localStorage.removeItem('adminSession'); window.location.replace('login.html'); }

function switchTab(t) {
  document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(s => s.classList.add('hidden'));
  const tb = document.getElementById(`tab-${t}`); if (tb) tb.classList.add('active');
  const sc = document.getElementById(`section-${t}`); if (sc) sc.classList.remove('hidden');
  const titles = { users: 'النظام', results: 'الكنترول', attendance: 'الغياب', library: 'المكتبة', news: 'الأخبار', schedules: 'الجداول', messages: 'البريد', myprofile: 'ملفي الأكاديمي', mylibrary: 'مكتبتي', myschedules: 'جدولي' };
  const tEl = document.getElementById('topbarTitle'); if (tEl) tEl.innerText = titles[t];

  if (t === 'users') loadUsers(); if (t === 'results') loadResults(); if (t === 'attendance') loadAtt();
  if (t === 'library') loadLib(); if (t === 'news') loadAdminNews(); if (t === 'schedules') loadAdminSch(); if (t === 'messages') loadMsgs();
}

// Student Portal Specific Loader
async function loadStudentData() {
  const session = JSON.parse(localStorage.getItem('adminSession'));
  try {
    const r1 = await fetch(`${API_BASE_URL}/api/results/${session.emailOrCode}`);
    if (r1.ok) {
      const d = await r1.json();
      document.getElementById('spName').innerText = d.name; document.getElementById('spCode').innerText = d.code; document.getElementById('spGrade').innerText = d.grade || 'عام';
      document.getElementById('spAr').innerText = d.ar || 0; document.getElementById('spEn').innerText = d.en || 0; document.getElementById('spMa').innerText = d.ma || 0; document.getElementById('spSc').innerText = d.sc || 0; document.getElementById('spSo').innerText = d.so || 0; document.getElementById('spTotal').innerText = d.total || 0;
    }
    const r2 = await fetch(`${API_BASE_URL}/api/attendance/${session.emailOrCode}`); const att = await r2.json(); document.getElementById('spAbsence').innerText = att.length;

    // Load Library for this student
    const r3 = await fetch(`${API_BASE_URL}/api/library`); const libs = await r3.json();
    const myGrade = document.getElementById('spGrade').innerText;
    const myLibs = libs.filter(l => l.category === 'عام' || l.category === myGrade);
    const lf = document.getElementById('studentLibraryFeed');
    lf.innerHTML = myLibs.length ? myLibs.map(l => `<div class="news-card" style="border-color:var(--success);text-align:center;"><span class="badge" style="background:#dcfce7;color:#15803d;margin-bottom:10px;">${l.category}</span><h3 style="margin-bottom:15px;color:var(--primary-dark);">${l.title}</h3><a href="${l.link}" class="btn-primary w-100"><i class="fa-solid fa-download"></i> تحميل</a></div>`).join('') : '<p>لا توجد مواد علمية حالياً.</p>';

    // Load Schedules
    const r4 = await fetch(`${API_BASE_URL}/api/schedules`); const schs = await r4.json();
    const mySchs = schs.filter(s => s.className === myGrade);
    const sf = document.getElementById('studentSchedulesFeed');
    sf.innerHTML = mySchs.length ? mySchs.map(s => `<div class="news-card" style="border-color:var(--warning);text-align:center;"><h3 style="margin-bottom:15px;color:var(--primary-dark);">${s.className}</h3><a href="${s.link}" target="_blank" class="btn-primary w-100"><i class="fa-solid fa-eye"></i> عرض الجدول</a></div>`).join('') : '<p>لم يتم رفع جدول لك بعد.</p>';

  } catch (e) { console.log(e); showToast('خطأ في جلب بيانات الطالب', 'error'); }
}

// Simple Export to CSV V7
window.exportCSV = async function (endpoint, filename) {
  try {
    const res = await fetch(API_BASE_URL + endpoint); const data = await res.json();
    if (!data.length) return showToast('لا توجد بيانات للتصدير', 'error');

    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(obj => Object.values(obj).map(v => `"${v}"`).join(',')).join('\n');
    const csv = '\uFEFF' + headers + '\n' + rows;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename + '.csv'; a.click();
    showToast('تم التصدير بنجاح');
  } catch (err) { showToast('حدث خطأ أثناء التصدير', 'error'); }
}

const crForm = document.getElementById('checkResultForm'); // Public checker
if (crForm) crForm.addEventListener('submit', async e => {
  e.preventDefault(); const c = document.getElementById('searchCode').value;
  try {
    const r1 = await fetch(`${API_BASE_URL}/api/results/${c}`);
    if (!r1.ok) return showToast('لا توجد بيانات لهذا الكود المرجعي', 'error');
    const data = await r1.json();
    document.getElementById('resName').innerText = data.name; document.getElementById('resCode').innerText = data.code; document.getElementById('resGrade').innerText = data.grade || 'عام';
    document.getElementById('resAr').innerText = data.ar || 0; document.getElementById('resEn').innerText = data.en || 0;
    document.getElementById('resMa').innerText = data.ma || 0; document.getElementById('resSc').innerText = data.sc || 0;
    document.getElementById('resSo').innerText = data.so || 0; document.getElementById('resTotal').innerText = data.total || 0;

    const r2 = await fetch(`${API_BASE_URL}/api/attendance/${c}`); const att = await r2.json();
    document.getElementById('resAbsence').innerText = att.length;
    document.getElementById('resCard').style.display = 'block'; showToast('تم استخراج الشهادة بنجاح');
  } catch (err) { showToast('فشل الاتصال بالخادم الرئيسي', 'error'); }
});

async function _get(end, tBodyId, mapper) { const r = await fetch(API_BASE_URL + end); const d = await r.json(); const tb = document.getElementById(tBodyId); if (tb) tb.innerHTML = d.map(mapper).join(''); }
async function _del(end, id, cb) { await fetch(`${API_BASE_URL}${end}/${id}`, { method: 'DELETE' }); cb(); showToast('تم الحذف'); }
async function _post(end, formId, dataMap, cb) {
  const f = document.getElementById(formId); if (!f) return;
  f.addEventListener('submit', async e => {
    e.preventDefault();
    const res = await fetch(API_BASE_URL + end, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dataMap()) });
    if (res.ok) { showToast('تمت العملية بنجاح'); f.reset(); cb(); } else { const err = await res.json(); showToast(err.error || 'حدث خطأ', 'error'); }
  });
}

const session = JSON.parse(localStorage.getItem('adminSession'));
const isStaff = session && (session.role === 'admin' || session.role === 'affairs');

_post('/api/results', 'addResultForm', () => ({ code: document.getElementById('rCode').value, name: document.getElementById('rName').value, grade: document.getElementById('rGrade').value, ar: parseInt(document.getElementById('rAr').value), en: parseInt(document.getElementById('rEn').value), ma: parseInt(document.getElementById('rMa').value), sc: parseInt(document.getElementById('rSc').value), so: parseInt(document.getElementById('rSo').value) }), loadResults);
_post('/api/attendance', 'addAttForm', () => ({ code: document.getElementById('aCode').value, date: document.getElementById('aDate').value, reason: document.getElementById('aReason').value || '--' }), loadAtt);
_post('/api/library', 'addLibForm', () => ({ title: document.getElementById('lTitle').value, category: document.getElementById('lCategory').value, link: document.getElementById('lLink').value }), loadLib);
_post('/api/news', 'addNewsForm', () => ({ title: document.getElementById('newsTitle').value, content: document.getElementById('newsContent').value }), loadAdminNews);
_post('/api/schedules', 'addScheduleForm', () => ({ className: document.getElementById('schClass').value, link: document.getElementById('schLink').value }), loadAdminSch);
if (document.getElementById('contactForm')) _post('/api/messages', 'contactForm', () => ({ name: document.getElementById('cName').value, phone: document.getElementById('cPhone').value, message: document.getElementById('cMessage').value }), () => { });

function loadUsers() { _get('/api/users', 'usersTableBody', u => `<tr><td style="font-weight:bold;">${u.name}</td><td>${u.emailOrCode}</td><td><span class="badge" style="background:#e2e8f0;color:#334155">${u.role}</span></td><td>${u.role !== 'admin' ? `<button onclick="_del('/api/users',${u.id},loadUsers)" class="btn-sm btn-danger-sm"><i class="fa-solid fa-trash"></i></button>` : '-'}</td></tr>`); }
function loadResults() { _get('/api/results', 'resultsTableBody', r => `<tr><td style="font-weight:bold;">${r.code}</td><td>${r.name}</td><td>${r.grade || '-'}</td><td><span class="badge" style="background:#dcfce7;color:#16a34a;font-size:1rem;">${r.total}</span></td>${isStaff ? `<td><button onclick="_del('/api/results','${r.code}',loadResults)" class="btn-sm btn-danger-sm affairs-only"><i class="fa-solid fa-eraser"></i> مسح</button></td>` : ''}</tr>`); }
function loadAtt() { _get('/api/attendance', 'attTableBody', a => `<tr><td style="font-weight:bold;">${a.code}</td><td>${a.date}</td><td>${a.reason}</td>${isStaff ? `<td><button onclick="_del('/api/attendance',${a.id},loadAtt)" class="btn-sm btn-danger-sm affairs-only">مسح</button></td>` : ''}</tr>`); }
function loadLib() { _get('/api/library', 'libTableBody', l => `<tr><td style="font-weight:bold;">${l.title}</td><td><span class="badge" style="background:#fef3c7;color:#d97706;">${l.category}</span></td>${session && session.role === 'admin' ? `<td><button onclick="_del('/api/library',${l.id},loadLib)" class="btn-sm btn-danger-sm admin-only">حذف</button></td>` : ''}</tr>`); }
function loadAdminNews() { _get('/api/news', 'newsTableBody', n => `<tr><td>${n.date}</td><td style="font-weight:bold;">${n.title}</td><td><button onclick="_del('/api/news',${n.id},loadAdminNews)" class="btn-sm btn-danger-sm admin-only">حذف</button></td></tr>`); }
function loadAdminSch() { _get('/api/schedules', 'schedulesTableBody', s => `<tr><td style="font-weight:bold;">${s.className}</td>${isStaff ? `<td><button onclick="_del('/api/schedules',${s.id},loadAdminSch)" class="btn-sm btn-danger-sm affairs-only">حذف</button></td>` : ''}</tr>`); }
function loadMsgs() { _get('/api/messages', 'messagesTableBody', m => `<tr><td style="font-weight:bold;">${m.name}</td><td>${m.phone}</td><td>${m.message}</td><td><button onclick="_del('/api/messages',${m.id},loadMsgs)" class="btn-sm btn-danger-sm"><i class="fa-solid fa-check"></i> إنهاء</button></td></tr>`); }

function loadPublicNews() { _get('/api/news', 'publicNewsFeed', n => `<div class="news-card"><div class="news-card-header"><div class="news-card-icon"><i class="fa-solid fa-bullhorn"></i></div><div><div class="news-date">${n.date}</div><div class="news-title">${n.title}</div></div></div><div class="news-content">${n.content}</div></div>`); }

// Public library loader for library.html
window.filterLibrary = function (cat) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  if (event && event.target) event.target.classList.add('active');
  fetch(API_BASE_URL + '/api/library').then(r => r.json()).then(data => {
    const feed = document.getElementById('publicLibraryFeed');
    if (!feed) return;
    let fData = data; if (cat !== 'الكل') fData = data.filter(x => x.category === cat || x.category === 'عام');
    if (fData.length === 0) { feed.innerHTML = '<p style="text-align:center;width:100%;font-weight:bold;color:gray;">لا توجد مواد علمية متاحة لهذا القسم حالياً.</p>'; return; }
    feed.innerHTML = fData.map(l => `<div class="news-card" style="border-right-color:var(--success);text-align:center;"><span class="badge" style="background:#dcfce7;color:#15803d;margin-bottom:15px;">${l.category}</span><h3 style="color:var(--primary-dark);font-size:1.3rem;margin-bottom:15px;">${l.title}</h3><a href="${l.link}" class="btn-outline" style="border-color:var(--success);color:var(--success)!important;"><i class="fa-solid fa-cloud-arrow-down"></i> تحميل الملف PDF</a></div>`).join('');
  });
};

// Public schedule loader for schedules.html
window.loadPublicSchedules = function () {
  fetch(API_BASE_URL + '/api/schedules').then(r => r.json()).then(data => {
    const feed = document.getElementById('publicSchedulesFeed');
    if (!feed) return;
    if (data.length === 0) feed.innerHTML = '<p>لا توجد جداول حاليا.</p>';
    else feed.innerHTML = data.map(s => `<div class="news-card" style="text-align:center;"><i class="fa-regular fa-calendar-check" style="font-size:3rem;color:var(--warning);margin-bottom:15px;display:block;"></i><h3 style="color:var(--primary-dark);margin-bottom:15px;">${s.className}</h3><a href="${s.link}" target="_blank" class="btn-primary w-100" style="width:100%"><i class="fa-solid fa-eye"></i> عرض أو تحميل الجدول</a></div>`).join('');
  });
}

const alf = document.getElementById('adminLoginForm');
if (alf) alf.addEventListener('submit', async e => {
  e.preventDefault(); const res = await fetch(`${API_BASE_URL}/api/users/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ emailOrCode: document.getElementById('loginId').value, password: document.getElementById('loginPass').value }) });
  if (res.ok) { const data = await res.json(); localStorage.setItem('adminSession', JSON.stringify(data.user)); window.location.href = 'dashboard.html'; } else showToast('البيانات غير صحيحة', 'error');
});
