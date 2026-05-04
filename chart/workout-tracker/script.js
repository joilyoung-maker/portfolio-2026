document.addEventListener('DOMContentLoaded', () => {
    // ---------------------------------------------------------
    // 1. State Management
    // ---------------------------------------------------------
    let currentDate = new Date();
    let workouts = JSON.parse(localStorage.getItem('workouts')) || {};
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
    
    // Calendar DOM
    const calendarView = document.getElementById('calendar-view');
    const openCalendarBtn = document.getElementById('open-calendar-btn');
    const closeCalendarBtn = document.getElementById('close-calendar-btn');
    const calPrevBtn = document.getElementById('cal-prev-btn');
    const calNextBtn = document.getElementById('cal-next-btn');
    const calendarTitle = document.getElementById('calendar-title');
    const calendarGrid = document.getElementById('calendar-grid');
    const monthlyVolumeText = document.getElementById('monthly-volume-text');
    let currentCalDate = new Date();
    
    // History DOM
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
        submitBtnText.textContent = '기록 추가';
        submitBtnIcon.className = 'fas fa-plus';
        
        nameInput.value = '';
        weightInput.value = '';
        setsInput.value = '';
        repsInput.value = '';
    }

    // ---------------------------------------------------------
    // 4. Calendar Functions
    // ---------------------------------------------------------
    function openCalendar() {
        currentCalDate = new Date(currentDate);
        renderCalendar();
        calendarView.classList.remove('hidden');
    }

    function closeCalendar() {
        calendarView.classList.add('hidden');
    }

    function renderCalendar() {
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
            div.className = 'calendar-date other-month';
            div.textContent = prevMonthLastDay - startingDay + i + 1;
            calendarGrid.appendChild(div);
        }
        
        const today = new Date();
        
        for (let i = 1; i <= totalDays; i++) {
            const dateObj = new Date(year, month, i);
            const dateStr = formatDateKey(dateObj);
            const dayWorkouts = workouts[dateStr];
            
            const div = document.createElement('div');
            div.className = 'calendar-date';
            div.textContent = i;
            
            if (dateObj.getDate() === today.getDate() && dateObj.getMonth() === today.getMonth() && dateObj.getFullYear() === today.getFullYear()) {
                div.classList.add('is-today');
            }
            
            if (dateObj.getDate() === currentDate.getDate() && dateObj.getMonth() === currentDate.getMonth() && dateObj.getFullYear() === currentDate.getFullYear()) {
                div.classList.add('is-selected');
            }
            
            if (dayWorkouts && dayWorkouts.length > 0) {
                div.classList.add('has-workout');
                dayWorkouts.forEach(w => {
                    monthlyVolume += (w.weight * w.sets * w.reps);
                });
            }
            
            div.addEventListener('click', () => {
                currentDate = new Date(year, month, i);
                resetEditState();
                updateDateDisplay();
                closeCalendar();
            });
            
            calendarGrid.appendChild(div);
        }
        
        const totalCells = startingDay + totalDays;
        const remainingCells = 42 - totalCells;
        for (let i = 1; i <= remainingCells; i++) {
            const div = document.createElement('div');
            div.className = 'calendar-date other-month';
            div.textContent = i;
            calendarGrid.appendChild(div);
        }
        
        monthlyVolumeText.textContent = `${monthlyVolume.toLocaleString()} kg`;
    }

    // ---------------------------------------------------------
    // 4.5 History Functions
    // ---------------------------------------------------------
    function openHistory() {
        renderHistory();
        historyView.classList.remove('hidden');
    }

    function closeHistory() {
        historyView.classList.add('hidden');
    }

    function renderHistory() {
        historyTableBody.innerHTML = '';
        
        // Flatten workouts into an array and sort by date descending
        const allWorkouts = [];
        for (const [dateStr, dailyWorkouts] of Object.entries(workouts)) {
            dailyWorkouts.forEach(workout => {
                allWorkouts.push({
                    date: dateStr,
                    ...workout
                });
            });
        }
        
        allWorkouts.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        if (allWorkouts.length === 0) {
            historyTableBody.innerHTML = '<tr><td colspan="5" style="padding: 2rem; color: var(--text-muted);">기록이 없습니다.</td></tr>';
            return;
        }
        
        allWorkouts.forEach(workout => {
            const tr = document.createElement('tr');
            // Format date as YY.MM.DD (e.g., 26.04.26)
            const displayDate = workout.date.substring(2).replace(/-/g, '.');
            
            tr.innerHTML = `
                <td>${displayDate}</td>
                <td>${escapeHTML(workout.name)}</td>
                <td>${workout.weight}</td>
                <td>${workout.sets}</td>
                <td>${workout.reps}</td>
            `;
            historyTableBody.appendChild(tr);
        });
    }

    // ---------------------------------------------------------
    // 5. Render Functions
    // ---------------------------------------------------------
    function updateDateDisplay() {
        const today = new Date();
        const isToday = 
            currentDate.getDate() === today.getDate() &&
            currentDate.getMonth() === today.getMonth() &&
            currentDate.getFullYear() === today.getFullYear();
            
        const dayStrs = ['일', '월', '화', '수', '목', '금', '토'];
        
        if (isToday) {
            currentDateText.textContent = '오늘';
        } else {
            currentDateText.textContent = `${currentDate.getMonth() + 1}월 ${currentDate.getDate()}일 (${dayStrs[currentDate.getDay()]})`;
        }
        
        const y = currentDate.getFullYear();
        const m = String(currentDate.getMonth() + 1).padStart(2, '0');
        const d = String(currentDate.getDate()).padStart(2, '0');
        currentDateSub.textContent = `${y}. ${m}. ${d}`;
        
        renderWorkouts();
    }

    function renderTags() {
        favoritesListContainer.innerHTML = '';
        favoriteExercises.forEach(group => {
            const groupDiv = document.createElement('div');
            groupDiv.className = 'fav-category';
            
            const label = document.createElement('div');
            label.className = 'fav-category-name';
            label.textContent = group.category;
            groupDiv.appendChild(label);
            
            const scrollDiv = document.createElement('div');
            scrollDiv.className = 'tags-scroll';
            
            group.exercises.forEach(ex => {
                const btn = document.createElement('button');
                btn.type = 'button';
                const catClass = group.category.toLowerCase();
                btn.className = `tag-btn tag-${catClass}`;
                btn.textContent = ex;
                btn.addEventListener('click', () => {
                    nameInput.value = ex;
                    weightInput.focus();
                });
                scrollDiv.appendChild(btn);
            });
            
            groupDiv.appendChild(scrollDiv);
            favoritesListContainer.appendChild(groupDiv);
        });
    }

    function renderWorkouts() {
        workoutList.innerHTML = '';
        const key = formatDateKey(currentDate);
        const todaysWorkouts = workouts[key] || [];
        
        let totalVolume = 0;
        
        if (todaysWorkouts.length === 0) {
            emptyState.classList.add('visible');
        } else {
            emptyState.classList.remove('visible');
            
            todaysWorkouts.forEach(workout => {
                const li = document.createElement('li');
                li.className = 'workout-item';
                li.dataset.id = workout.id;
                
                const vol = workout.weight * workout.sets * workout.reps;
                totalVolume += vol;
                
                li.innerHTML = `
                    <div class="item-info">
                        <span class="item-name">${escapeHTML(workout.name)}</span>
                        <div class="item-details">
                            <span class="detail-badge badge-weight">${workout.weight}kg</span>
                            <span class="detail-badge badge-sets">${workout.sets}세트</span>
                            <span class="detail-badge badge-reps">${workout.reps}회</span>
                        </div>
                    </div>
                    <div class="actions-group">
                        <button class="edit-btn" aria-label="수정">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-btn" aria-label="삭제">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                `;
                
                workoutList.appendChild(li);
            });
        }
        
        totalVolumeEl.textContent = `총 볼륨: ${totalVolume.toLocaleString()} kg`;
    }

    // ---------------------------------------------------------
    // 5. Event Listeners
    // ---------------------------------------------------------
    prevDateBtn.addEventListener('click', () => {
        currentDate.setDate(currentDate.getDate() - 1);
        resetEditState();
        updateDateDisplay();
    });

    nextDateBtn.addEventListener('click', () => {
        currentDate.setDate(currentDate.getDate() + 1);
        resetEditState();
        updateDateDisplay();
    });

    workoutForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = nameInput.value.trim();
        let weight = parseFloat(weightInput.value);
        const sets = parseInt(setsInput.value);
        const reps = parseInt(repsInput.value);
        
        if (isNaN(weight)) weight = 0; // 맨몸 운동 기본값 0
        
        if (!name || isNaN(sets) || isNaN(reps)) return;
        
        if (editingId) {
            // Update existing
            const key = formatDateKey(currentDate);
            const index = workouts[key].findIndex(w => w.id === editingId);
            if (index !== -1) {
                workouts[key][index] = {
                    id: editingId,
                    name,
                    weight,
                    sets,
                    reps
                };
            }
            editingId = null;
            submitBtnText.textContent = '기록 추가';
            submitBtnIcon.className = 'fas fa-plus';
        } else {
            // Create new
            const key = formatDateKey(currentDate);
            if (!workouts[key]) {
                workouts[key] = [];
            }
            
            const newWorkout = {
                id: Date.now().toString(),
                name,
                weight,
                sets,
                reps
            };
            
            workouts[key].push(newWorkout);
        }
        
        saveData();
        renderWorkouts();
        
        // Reset numeric inputs
        weightInput.value = '';
        setsInput.value = '';
        repsInput.value = '';
        nameInput.focus();
    });
    
    workoutList.addEventListener('click', (e) => {
        const deleteBtn = e.target.closest('.delete-btn');
        const editBtn = e.target.closest('.edit-btn');
        
        if (deleteBtn) {
            if (!confirm('이 기록을 삭제하시겠습니까?')) return;
            
            const item = deleteBtn.closest('.workout-item');
            const id = item.dataset.id;
            const key = formatDateKey(currentDate);
            
            workouts[key] = workouts[key].filter(w => w.id !== id);
            
            if (workouts[key].length === 0) {
                delete workouts[key];
            }
            
            saveData();
            renderWorkouts();
        } else if (editBtn) {
            const item = editBtn.closest('.workout-item');
            const id = item.dataset.id;
            const key = formatDateKey(currentDate);
            const workout = workouts[key].find(w => w.id === id);
            
            if (workout) {
                nameInput.value = workout.name;
                weightInput.value = workout.weight;
                setsInput.value = workout.sets;
                repsInput.value = workout.reps;
                
                editingId = id;
                submitBtnText.textContent = '기록 수정';
                submitBtnIcon.className = 'fas fa-check';
                
                weightInput.focus();
                
                // Scroll up to form smoothly
                workoutForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    });

    // Calendar listeners
    openCalendarBtn.addEventListener('click', openCalendar);
    closeCalendarBtn.addEventListener('click', closeCalendar);
    
    // History listeners
    openHistoryBtn.addEventListener('click', openHistory);
    closeHistoryBtn.addEventListener('click', closeHistory);
    
    calPrevBtn.addEventListener('click', () => {
        currentCalDate.setMonth(currentCalDate.getMonth() - 1);
        renderCalendar();
    });
    
    calNextBtn.addEventListener('click', () => {
        currentCalDate.setMonth(currentCalDate.getMonth() + 1);
        renderCalendar();
    });

    // ---------------------------------------------------------
    // 7. Initialization
    // ---------------------------------------------------------
    updateDateDisplay();
    renderTags();
});
