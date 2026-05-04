import './style.css';

interface Workout {
    id: string;
    name: string;
    weight: number;
    sets: number;
    reps: number;
}

interface WorkoutData {
    [date: string]: Workout[];
}

interface FavoriteExercise {
    category: string;
    exercises: string[];
}

document.addEventListener('DOMContentLoaded', () => {
    // ---------------------------------------------------------
    // 1. State Management
    // ---------------------------------------------------------
    let currentDate = new Date();
    let workouts: WorkoutData = JSON.parse(localStorage.getItem('workouts') || '{}');
    let editingId: string | null = null;
    
    const favoriteExercises: FavoriteExercise[] = [
        { category: 'Pull', exercises: ['Seated Row', 'Lat Pulldown', 'Face Pull', 'Biceps Curl'] },
        { category: 'Push', exercises: ['Barbell Bench Press', 'Chest Press', 'Shoulder Press', 'Straight Bar Pushdown', 'Incline Press'] },
        { category: 'Leg', exercises: ['Leg Press', 'Leg Extension', 'Bulgarian Split Squat', 'Hip Adduction'] }
    ];

    // ---------------------------------------------------------
    // 2. DOM Elements
    // ---------------------------------------------------------
    const prevDateBtn = document.getElementById('prev-date-btn') as HTMLButtonElement;
    const nextDateBtn = document.getElementById('next-date-btn') as HTMLButtonElement;
    const currentDateText = document.getElementById('current-date-text') as HTMLHeadingElement;
    const currentDateSub = document.getElementById('current-date-sub') as HTMLSpanElement;
    
    // Calendar DOM
    const calendarView = document.getElementById('calendar-view') as HTMLDivElement;
    const openCalendarBtn = document.getElementById('open-calendar-btn') as HTMLButtonElement;
    const closeCalendarBtn = document.getElementById('close-calendar-btn') as HTMLButtonElement;
    const calPrevBtn = document.getElementById('cal-prev-btn') as HTMLButtonElement;
    const calNextBtn = document.getElementById('cal-next-btn') as HTMLButtonElement;
    const calendarTitle = document.getElementById('calendar-title') as HTMLHeadingElement;
    const calendarGrid = document.getElementById('calendar-grid') as HTMLDivElement;
    const monthlyVolumeText = document.getElementById('monthly-volume-text') as HTMLSpanElement;
    let currentCalDate = new Date();
    
    // History DOM
    const historyView = document.getElementById('history-view') as HTMLDivElement;
    const openHistoryBtn = document.getElementById('open-history-btn') as HTMLButtonElement;
    const closeHistoryBtn = document.getElementById('close-history-btn') as HTMLButtonElement;
    const historyTableBody = document.getElementById('history-table-body') as HTMLTableSectionElement;
    
    const favoritesListContainer = document.getElementById('favorites-list') as HTMLDivElement;
    const workoutForm = document.getElementById('workout-form') as HTMLFormElement;
    const submitBtn = document.getElementById('submit-btn') as HTMLButtonElement;
    const submitBtnText = submitBtn.querySelector('span') as HTMLSpanElement;
    const submitBtnIcon = submitBtn.querySelector('i') as HTMLElement;
    
    const nameInput = document.getElementById('exercise-name') as HTMLInputElement;
    const weightInput = document.getElementById('exercise-weight') as HTMLInputElement;
    const setsInput = document.getElementById('exercise-sets') as HTMLInputElement;
    const repsInput = document.getElementById('exercise-reps') as HTMLInputElement;
    
    const workoutList = document.getElementById('workout-list') as HTMLUListElement;
    const emptyState = document.getElementById('empty-state') as HTMLDivElement;
    const totalVolumeEl = document.getElementById('total-volume') as HTMLSpanElement;

    // ---------------------------------------------------------
    // 3. Utility Functions
    // ---------------------------------------------------------
    function escapeHTML(str: string): string {
        const p = document.createElement('p');
        p.appendChild(document.createTextNode(str));
        return p.innerHTML;
    }

    function formatDateKey(date: Date): string {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }

    function saveData(): void {
        localStorage.setItem('workouts', JSON.stringify(workouts));
    }

    function resetEditState(): void {
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
    function openCalendar(): void {
        currentCalDate = new Date(currentDate);
        renderCalendar();
        calendarView.classList.remove('hidden');
    }

    function closeCalendar(): void {
        calendarView.classList.add('hidden');
    }

    function renderCalendar(): void {
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
            div.className = 'calendar-date opacity-20 cursor-default';
            div.textContent = (prevMonthLastDay - startingDay + i + 1).toString();
            calendarGrid.appendChild(div);
        }
        
        const today = new Date();
        
        for (let i = 1; i <= totalDays; i++) {
            const dateObj = new Date(year, month, i);
            const dateStr = formatDateKey(dateObj);
            const dayWorkouts = workouts[dateStr];
            
            const div = document.createElement('div');
            div.className = 'calendar-date aspect-square flex items-center justify-center font-semibold rounded-xl bg-slate-50 cursor-pointer hover:bg-slate-100 transition-all';
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
                closeCalendar();
            });
            
            calendarGrid.appendChild(div);
        }
        
        const totalCells = startingDay + totalDays;
        const remainingCells = 42 - totalCells;
        for (let i = 1; i <= remainingCells; i++) {
            const div = document.createElement('div');
            div.className = 'calendar-date opacity-20 cursor-default';
            div.textContent = i.toString();
            calendarGrid.appendChild(div);
        }
        
        monthlyVolumeText.textContent = `${monthlyVolume.toLocaleString()} kg`;
    }

    // ---------------------------------------------------------
    // 4.5 History Functions
    // ---------------------------------------------------------
    function openHistory(): void {
        renderHistory();
        historyView.classList.remove('hidden');
    }

    function closeHistory(): void {
        historyView.classList.add('hidden');
    }

    function renderHistory(): void {
        historyTableBody.innerHTML = '';
        
        const allWorkouts: (Workout & { date: string })[] = [];
        for (const [dateStr, dailyWorkouts] of Object.entries(workouts)) {
            dailyWorkouts.forEach(workout => {
                allWorkouts.push({
                    date: dateStr,
                    ...workout
                });
            });
        }
        
        allWorkouts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        if (allWorkouts.length === 0) {
            historyTableBody.innerHTML = '<tr><td colspan="5" class="p-8 text-slate-400">기록이 없습니다.</td></tr>';
            return;
        }
        
        allWorkouts.forEach(workout => {
            const tr = document.createElement('tr');
            tr.className = 'border-b border-slate-100';
            const displayDate = workout.date.substring(2).replace(/-/g, '.');
            
            tr.innerHTML = `
                <td class="p-3 text-center text-xs text-slate-500">${displayDate}</td>
                <td class="p-3 text-left font-semibold text-slate-700">${escapeHTML(workout.name)}</td>
                <td class="p-3 text-center text-sm font-medium text-slate-600">${workout.weight}</td>
                <td class="p-3 text-center text-sm font-medium text-slate-600">${workout.sets}</td>
                <td class="p-3 text-center text-sm font-medium text-slate-600">${workout.reps}</td>
            `;
            historyTableBody.appendChild(tr);
        });
    }

    // ---------------------------------------------------------
    // 5. Render Functions
    // ---------------------------------------------------------
    function updateDateDisplay(): void {
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

    function renderTags(): void {
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
                    nameInput.value = ex;
                    weightInput.focus();
                });
                scrollDiv.appendChild(btn);
            });
            
            groupDiv.appendChild(scrollDiv);
            favoritesListContainer.appendChild(groupDiv);
        });
    }

    function renderWorkouts(): void {
        workoutList.innerHTML = '';
        const key = formatDateKey(currentDate);
        const todaysWorkouts = workouts[key] || [];
        
        let totalVolume = 0;
        
        if (todaysWorkouts.length === 0) {
            emptyState.classList.add('flex');
            emptyState.classList.remove('hidden');
        } else {
            emptyState.classList.remove('flex');
            emptyState.classList.add('hidden');
            
            todaysWorkouts.forEach(workout => {
                const li = document.createElement('li');
                li.className = 'flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl hover:shadow-sm transition-all group';
                li.dataset.id = workout.id;
                
                const vol = workout.weight * workout.sets * workout.reps;
                totalVolume += vol;
                
                li.innerHTML = `
                    <div class="flex flex-col flex-1 min-w-0 pr-4">
                        <span class="font-bold text-slate-800 truncate">${escapeHTML(workout.name)}</span>
                        <div class="flex gap-1.5 mt-1">
                            <span class="px-1.5 py-0.5 bg-slate-50 text-slate-500 rounded text-[10px] font-bold">${workout.weight}kg</span>
                            <span class="px-1.5 py-0.5 bg-slate-50 text-slate-500 rounded text-[10px] font-bold">${workout.sets}세트</span>
                            <span class="px-1.5 py-0.5 bg-slate-50 text-slate-500 rounded text-[10px] font-bold">${workout.reps}회</span>
                        </div>
                    </div>
                    <div class="flex gap-1">
                        <button class="edit-btn p-2 text-slate-300 hover:text-indigo-500 transition-colors" aria-label="수정">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-btn p-2 text-slate-300 hover:text-rose-500 transition-colors" aria-label="삭제">
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

    workoutForm.addEventListener('submit', (e: Event) => {
        e.preventDefault();
        
        const name = nameInput.value.trim();
        let weight = parseFloat(weightInput.value);
        const sets = parseInt(setsInput.value);
        const reps = parseInt(repsInput.value);
        
        if (isNaN(weight)) weight = 0;
        
        if (!name || isNaN(sets) || isNaN(reps)) return;
        
        if (editingId) {
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
            const key = formatDateKey(currentDate);
            if (!workouts[key]) {
                workouts[key] = [];
            }
            
            const newWorkout: Workout = {
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
        
        weightInput.value = '';
        setsInput.value = '';
        repsInput.value = '';
        nameInput.focus();
    });
    
    workoutList.addEventListener('click', (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const deleteBtn = target.closest('.delete-btn');
        const editBtn = target.closest('.edit-btn');
        
        if (deleteBtn) {
            if (!confirm('이 기록을 삭제하시겠습니까?')) return;
            
            const item = deleteBtn.closest('.workout-item') as HTMLElement;
            const id = item.dataset.id!;
            const key = formatDateKey(currentDate);
            
            workouts[key] = workouts[key].filter(w => w.id !== id);
            
            if (workouts[key].length === 0) {
                delete workouts[key];
            }
            
            saveData();
            renderWorkouts();
        } else if (editBtn) {
            const item = editBtn.closest('.workout-item') as HTMLElement;
            const id = item.dataset.id!;
            const key = formatDateKey(currentDate);
            const workout = workouts[key].find(w => w.id === id);
            
            if (workout) {
                nameInput.value = workout.name;
                weightInput.value = workout.weight.toString();
                setsInput.value = workout.sets.toString();
                repsInput.value = workout.reps.toString();
                
                editingId = id;
                submitBtnText.textContent = '기록 수정';
                submitBtnIcon.className = 'fas fa-check';
                
                weightInput.focus();
                workoutForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    });

    openCalendarBtn.addEventListener('click', openCalendar);
    closeCalendarBtn.addEventListener('click', closeCalendar);
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
