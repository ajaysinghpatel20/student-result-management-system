const STORAGE_KEY = 'srr_students';
let students = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

const form = document.getElementById('student-form');
const table = document.getElementById('results-table');
const tbody = document.getElementById('results-body');
const emptyState = document.getElementById('empty-state');
const searchInput = document.getElementById('search');
const summary = document.getElementById('summary');
const statCount = document.getElementById('stat-count');
const statAvg = document.getElementById('stat-avg');
const statTopper = document.getElementById('stat-topper');

// Grade boundaries — tweak these if your college uses a different scale
function calcGrade(percentage) {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C';
  if (percentage >= 40) return 'D';
  return 'F';
}

function computeResult(student) {
  const marks = [student.sub1, student.sub2, student.sub3, student.sub4, student.sub5];
  const total = marks.reduce((sum, m) => sum + m, 0);
  const percentage = total / marks.length;
  const grade = calcGrade(percentage);
  // Passing rule: at least 33 in every subject AND overall percentage of 40+
  const passed = marks.every(m => m >= 33) && percentage >= 40;
  return { total, percentage, grade, passed };
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
}

function render() {
  const query = searchInput.value.trim().toLowerCase();
  const filtered = query
    ? students.filter(s => s.rollNo.toLowerCase().includes(query))
    : students;

  tbody.innerHTML = '';

  filtered.forEach(student => {
    const { total, percentage, grade, passed } = computeResult(student);
    const row = document.createElement('tr');
    row.className = passed ? 'pass' : 'fail';
    row.innerHTML = `
      <td>${student.rollNo}</td>
      <td>${student.name}</td>
      <td>${student.sub1}</td>
      <td>${student.sub2}</td>
      <td>${student.sub3}</td>
      <td>${student.sub4}</td>
      <td>${student.sub5}</td>
      <td>${total}</td>
      <td>${percentage.toFixed(1)}%</td>
      <td>${grade}</td>
      <td class="${passed ? 'status-pass' : 'status-fail'}">${passed ? 'Pass' : 'Fail'}</td>
      <td><button class="delete-btn" data-roll="${student.rollNo}">Remove</button></td>
    `;
    tbody.appendChild(row);
  });

  const hasStudents = students.length > 0;
  table.hidden = !hasStudents;
  emptyState.hidden = hasStudents;

  updateSummary();
}

function updateSummary() {
  if (students.length === 0) {
    summary.hidden = true;
    return;
  }
  summary.hidden = false;

  const results = students.map(s => ({ ...s, ...computeResult(s) }));
  const avg = results.reduce((sum, r) => sum + r.percentage, 0) / results.length;
  const topper = results.reduce((top, r) => (r.percentage > top.percentage ? r : top), results[0]);

  statCount.textContent = students.length;
  statAvg.textContent = avg.toFixed(1) + '%';
  statTopper.textContent = `${topper.name} (${topper.percentage.toFixed(1)}%)`;
}

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const rollNo = document.getElementById('rollNo').value.trim();
  const name = document.getElementById('name').value.trim();
  const sub1 = Number(document.getElementById('sub1').value);
  const sub2 = Number(document.getElementById('sub2').value);
  const sub3 = Number(document.getElementById('sub3').value);
  const sub4 = Number(document.getElementById('sub4').value);
  const sub5 = Number(document.getElementById('sub5').value);

  if (students.some(s => s.rollNo === rollNo)) {
    alert('A student with this roll number already exists.');
    return;
  }

  students.push({ rollNo, name, sub1, sub2, sub3, sub4, sub5 });
  save();
  render();
  form.reset();
  document.getElementById('rollNo').focus();
});

tbody.addEventListener('click', (e) => {
  if (e.target.classList.contains('delete-btn')) {
    const roll = e.target.dataset.roll;
    students = students.filter(s => s.rollNo !== roll);
    save();
    render();
  }
});

searchInput.addEventListener('input', render);

render();