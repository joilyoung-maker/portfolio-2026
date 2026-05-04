// @ts-check
/**
 * Weight Training Tracker - Logic
 * 이 파일은 TypeScript 규칙을 준수하며 작성되었습니다.
 */

document.addEventListener('DOMContentLoaded', () => {
    // ---------------------------------------------------------
    // 1. State Management
    // ---------------------------------------------------------
    /** @type {Date} */
    let currentDate = new Date();
    /** @type {Object} */
    let workouts = JSON.parse(localStorage.getItem('workouts') || '{}');
    /** @type {string | null} */
    let editingId = null;
    
    const favoriteExercises = [
        { category: 'Pull', exercises: ['Seated Row', 'Lat Pulldown', 'Face Pull', 'Biceps Curl'] },
        { category: 'Push', exercises: ['Barbell Bench Press', 'Chest Press', 'Shoulder Press', 'Straight Bar Pushdown', 'Incline Press'] },
        { category: 'Leg', exercises: ['Leg Press', 'Leg Extension', 'Bulgarian Split Squat', 'Hip Adduction'] }
    ];

    // ---------------------------------------------------------
    // 2. DOM Elements
    // ---------------------------------------------------------
    const prevDateBtn = document.getElementById('prev-date-btn');
    const nextDateBtn = document.getElementById('next-date-btn');
    const currentDateText = document.getElementById('current-date-text');
    const currentDateSub = document.getElementById('current-date-sub');
    
    const calendarView = document.getElementById('calendar-view');
    const openCalendarBtn = document.getElementById('open-calendar-btn');
    const closeCalendarBtn = document.getElementById('close-calendar-btn');
    const calPrevBtn = document.getElementById('cal-prev-btn');
    const calNextBtn = document.getElementById('cal-next-btn');
    const calendarTitle = document.getElementById('calendar-title');
    const calendarGrid = document.getElementById('calendar-grid');
    const monthlyVolumeText = document.getElementById('monthly-volume-text');
    let currentCalDate = new Date();
    
    const historyView = document.getElementById('history-view');
    const openHistoryBtn = document.getElementById('open-history-btn');
    const closeHistoryBtn = document.getElementById('close-history-btn');
    const historyTableBody = document.getElementById('history-table-body');
    
    const favoritesListContainer = document.getElementById('favorites-list');
    const workoutForm = document.getElementById('workout-form');
    const submitBtn = document.getElementById('submit-btn');
    const submitBtnText = submitBtn.querySelector('span');
    const submitBtnIcon = submitBtn.querySelector('i');
    
    const nameInput = document.getElementById('exercise-name');
    const weightInput = document.getElementById('exercise-weight');
    const setsInput = document.getElementById('exercise-sets');
    const repsInput = document.getElementById('exercise-reps');
    
    const workoutList = document.getElementById('workout-list');
    const emptyState = document.getElementById('empty-state');
    const totalVolumeEl = document.getElementById('total-volume');

    // ---------------------------------------------------------
    // 3. Utility Functions
    // ---------------------------------------------------------
    function escapeHTML(str) {
        const p = document.createElement('p');
        p.appendChild(document.createTextNode(str));
        return p.innerHTML;
    }

    function formatDateKey(date) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }

    function saveData() {
        localStorage.setItem('workouts', JSON.stringify(workouts));
    }

    function resetEditState() {
        editingId = null;
        if (submitBtnText) submitBtnText.textContent = '기록 추가';
        if (submitBtnIcon) submitBtnIcon.className = 'fas fa-plus';
        
        // @ts-ignore
        nameInput.value = '';
        // @ts-ignore
        weightInput.value = '';
        // @ts-ignore
        setsInput.value = '';
        // @ts-ignore
        repsInput.value = '';
    }

    // ---------------------------------------------------------
    // 4. Render Functions
    // ---------------------------------------------------------
    function updateDateDisplay() {
        const today = new Date();
        const isToday = 
            currentDate.getDate() === today.getDate() &&
            currentDate.getMonth() === today.getMonth() &&
            currentDate.getFullYear() === today.getFullYear();
            
        const dayStrs = ['일', '월', '화', '수', '목', '금', '토'];
        
        if (currentDateText) {
            if (isToday) {
                currentDateText.textContent = '오늘';
            } else {
                currentDateText.textContent = `${currentDate.getMonth() + 1}월 ${currentDate.getDate()}일 (${dayStrs[currentDate.getDay()]})`;
            }
        }
        
        if (currentDateSub) {
            const y = currentDate.getFullYear();
            const m = String(currentDate.getMonth() + 1).padStart(2, '0');
            const d = String(currentDate.getDate()).padStart(2, '0');
            currentDateSub.textContent = `${y}. ${m}. ${d}`;
        }
        
        renderWorkouts();
    }

    function renderTags() {
        if (!favoritesListContainer) return;
        favoritesListContainer.innerHTML = '';
        favoriteExercises.forEach(group => {
            const groupDiv = document.createElement('div');
            groupDiv.className = 'flex items-start gap-2 mb-2';
            
            const label = document.createElement('div');
            label.className = 'text-[10px] font-bold text-slate-400 mt-1.5 w-8 flex-shrink-0';
            label.textContent = group.category.toUpperCase();
            groupDiv.appendChild(label);
            
            const scrollDiv = document.createElement('div');
            scrollDiv.className = 'flex flex-wrap gap-1.5';
            
            group.exercises.forEach(ex => {
                const btn = document.createElement('button');
                btn.type = 'button';
                const catClass = group.category.toLowerCase();
                let colorClass = 'bg-slate-100 text-slate-600';
                
                if (catClass === 'pull') colorClass = 'bg-emerald-100 text-emerald-700';
                else if (catClass === 'push') colorClass = 'bg-orange-100 text-orange-700';
                else if (catClass === 'leg') colorClass = 'bg-sky-100 text-sky-700';

                btn.className = `px-2.5 py-1 rounded-full text-xs font-bold transition-transform active:scale-95 ${colorClass}`;
                btn.textContent = ex;
                btn.addEventListener('click', () => {
                    // @ts-ignore
                    nameInput.value = ex;
                    // @ts-ignore
                    weightInput.focus();
                });
                scrollDiv.appendChild(btn);
            });
            
            groupDiv.appendChild(scrollDiv);
            favoritesListContainer.appendChild(groupDiv);
        });
    }

    function renderWorkouts() {
        if (!workoutList) return;
        workoutList.innerHTML = '';
        const key = formatDateKey(currentDate);
        const todaysWorkouts = workouts[key] || [];
        
        let totalVolume = 0;
        
        if (todaysWorkouts.length === 0) {
            if (emptyState) {
                emptyState.classList.add('flex');
                emptyState.classList.remove('hidden');
            }
        } else {
            if (emptyState) {
                emptyState.classList.remove('flex');
                emptyState.classList.add('hidden');
            }
            
            todaysWorkouts.forEach(workout => {
                const li = document.createElement('li');
                li.className = 'flex items-center justify-between p-2.5 bg-white border border-slate-100 rounded-xl hover:shadow-sm transition-all group';
                li.dataset.id = workout.id;
                
                const vol = workout.weight * workout.sets * workout.reps;
                totalVolume += vol;
                
                li.innerHTML = `
                    <div class="flex flex-col flex-1 min-w-0 pr-2">
                        <span class="font-bold text-sm text-slate-800 truncate">${escapeHTML(workout.name)}</span>
                        <div class="flex gap-1 mt-0.5">
                            <span class="px-1.5 py-0.5 bg-slate-50 text-slate-500 rounded text-[9px] font-bold">${workout.weight}kg</span>
                            <span class="px-1.5 py-0.5 bg-slate-50 text-slate-500 rounded text-[9px] font-bold">${workout.sets}세트</span>
                            <span class="px-1.5 py-0.5 bg-slate-50 text-slate-500 rounded text-[9px] font-bold">${workout.reps}회</span>
                        </div>
                    </div>
                    <div class="flex gap-0.5">
                        <button class="edit-btn p-1.5 text-slate-300 hover:text-indigo-500 transition-colors" aria-label="수정">
                            <i class="fas fa-edit text-xs"></i>
                        </button>
                        <button class="delete-btn p-1.5 text-slate-300 hover:text-rose-500 transition-colors" aria-label="삭제">
                            <i class="fas fa-trash-alt text-xs"></i>
                        </button>
                    </div>
                `;
                
                workoutList.appendChild(li);
            });
        }
        
        if (totalVolumeEl) totalVolumeEl.textContent = `총 볼륨: ${totalVolume.toLocaleString()} kg`;
    }

    // ---------------------------------------------------------
    // 5. Calendar Functions
    // ---------------------------------------------------------
    function renderCalendar() {
        if (!calendarGrid || !calendarTitle || !monthlyVolumeText) return;
        const year = currentCalDate.getFullYear();
        const month = currentCalDate.getMonth();
        
        calendarTitle.textContent = `${year}년 ${month + 1}월`;
        calendarGrid.innerHTML = '';
        
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const startingDay = firstDayOfMonth.getDay();
        const totalDays = lastDayOfMonth.getDate();
        
        let monthlyVolume = 0;
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        
        for (let i = 0; i < startingDay; i++) {
            const div = document.createElement('div');
            div.className = 'opacity-20 flex items-center justify-center aspect-square text-sm';
            div.textContent = (prevMonthLastDay - startingDay + i + 1).toString();
            calendarGrid.appendChild(div);
        }
        
        const today = new Date();
        for (let i = 1; i <= totalDays; i++) {
            const dateObj = new Date(year, month, i);
            const dateStr = formatDateKey(dateObj);
            const dayWorkouts = workouts[dateStr];
            
            const div = document.createElement('div');
            div.className = 'aspect-square flex items-center justify-center font-semibold rounded-xl bg-slate-50 cursor-pointer hover:bg-slate-100 transition-all text-sm';
            div.textContent = i.toString();
            
            if (dateObj.getDate() === today.getDate() && dateObj.getMonth() === today.getMonth() && dateObj.getFullYear() === today.getFullYear()) {
                div.classList.add('border-2', 'border-slate-800');
            }
            
            if (dateObj.getDate() === currentDate.getDate() && dateObj.getMonth() === currentDate.getMonth() && dateObj.getFullYear() === currentDate.getFullYear()) {
                div.classList.add('bg-slate-800', 'text-white');
            }
            
            if (dayWorkouts && dayWorkouts.length > 0) {
                if (!div.classList.contains('bg-slate-800')) {
                    div.classList.add('bg-emerald-100', 'text-emerald-800');
                }
                dayWorkouts.forEach(w => {
                    monthlyVolume += (w.weight * w.sets * w.reps);
                });
            }
            
            div.addEventListener('click', () => {
                currentDate = new Date(year, month, i);
                resetEditState();
                updateDateDisplay();
                if (calendarView) calendarView.classList.add('hidden');
            });
            
            calendarGrid.appendChild(div);
        }
        
        monthlyVolumeText.textContent = `${monthlyVolume.toLocaleString()} kg`;
    }

    // ---------------------------------------------------------
    // 6. Event Listeners
    // ---------------------------------------------------------
    prevDateBtn?.addEventListener('click', () => {
        currentDate.setDate(currentDate.getDate() - 1);
        resetEditState();
        updateDateDisplay();
    });

    nextDateBtn?.addEventListener('click', () => {
        currentDate.setDate(currentDate.getDate() + 1);
        resetEditState();
        updateDateDisplay();
    });

    workoutForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        // @ts-ignore
        const name = nameInput.value.trim();
        // @ts-ignore
        let weight = parseFloat(weightInput.value);
        // @ts-ignore
        const sets = parseInt(setsInput.value);
        // @ts-ignore
        const reps = parseInt(repsInput.value);
        
        if (isNaN(weight)) weight = 0;
        if (!name || isNaN(sets) || isNaN(reps)) return;
        
        const key = formatDateKey(currentDate);
        if (editingId) {
            const index = workouts[key].findIndex(w => w.id === editingId);
            if (index !== -1) {
                workouts[key][index] = { id: editingId, name, weight, sets, reps };
            }
            resetEditState();
        } else {
            if (!workouts[key]) workouts[key] = [];
            workouts[key].push({ id: Date.now().toString(), name, weight, sets, reps });
        }
        
        saveData();
        renderWorkouts();
        // @ts-ignore
        weightInput.value = ''; setsInput.value = ''; repsInput.value = ''; nameInput.focus();
    });
    
    workoutList?.addEventListener('click', (e) => {
        const target = e.target;
        // @ts-ignore
        const deleteBtn = target.closest('.delete-btn');
        // @ts-ignore
        const editBtn = target.closest('.edit-btn');
        
        if (deleteBtn) {
            if (!confirm('이 기록을 삭제하시겠습니까?')) return;
            const item = deleteBtn.closest('.workout-item');
            const id = item.dataset.id;
            const key = formatDateKey(currentDate);
            workouts[key] = workouts[key].filter(w => w.id !== id);
            if (workouts[key].length === 0) delete workouts[key];
            saveData();
            renderWorkouts();
        } else if (editBtn) {
            const item = editBtn.closest('.workout-item');
            const id = item.dataset.id;
            const key = formatDateKey(currentDate);
            const workout = workouts[key].find(w => w.id === id);
            if (workout) {
                // @ts-ignore
                nameInput.value = workout.name; weightInput.value = workout.weight;
                // @ts-ignore
                setsInput.value = workout.sets; repsInput.value = workout.reps;
                editingId = id;
                if (submitBtnText) submitBtnText.textContent = '기록 수정';
                if (submitBtnIcon) submitBtnIcon.className = 'fas fa-check';
                // @ts-ignore
                weightInput.focus(); workoutForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    });

    openCalendarBtn?.addEventListener('click', () => { currentCalDate = new Date(currentDate); renderCalendar(); calendarView?.classList.remove('hidden'); });
    closeCalendarBtn?.addEventListener('click', () => calendarView?.classList.add('hidden'));
    openHistoryBtn?.addEventListener('click', () => {
        if (!historyTableBody) return;
        historyTableBody.innerHTML = '';
        const all = [];
        for (const [date, list] of Object.entries(workouts)) {
            // @ts-ignore
            list.forEach(w => all.push({ date, ...w }));
        }
        // @ts-ignore
        all.sort((a, b) => new Date(b.date) - new Date(a.date));
        // @ts-ignore
        all.forEach(w => {
            const tr = document.createElement('tr');
            tr.className = 'border-b border-slate-50';
            tr.innerHTML = `<td class="p-3 text-center text-xs text-slate-400">${w.date.substring(2).replace(/-/g, '.')}</td><td class="p-3 text-left font-bold text-slate-700">${escapeHTML(w.name)}</td><td class="p-3 text-center text-sm font-bold text-slate-600">${w.weight}</td><td class="p-3 text-center text-sm font-bold text-slate-600">${w.sets}</td><td class="p-3 text-center text-sm font-bold text-slate-600">${w.reps}</td>`;
            historyTableBody.appendChild(tr);
        });
        historyView?.classList.remove('hidden');
    });
    closeHistoryBtn?.addEventListener('click', () => historyView?.classList.add('hidden'));

    // Init
    updateDateDisplay();
    renderTags();
});
