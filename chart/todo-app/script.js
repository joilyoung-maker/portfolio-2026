document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const form = document.getElementById('todo-form');
    const input = document.getElementById('todo-input');
    const todoList = document.getElementById('todo-list');
    const itemsLeftText = document.getElementById('items-left');
    const clearCompletedBtn = document.getElementById('clear-completed');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const dateDisplay = document.getElementById('date-display');

    // State
    let todos = JSON.parse(localStorage.getItem('todos')) || [];
    let currentFilter = 'all';

    // Retroactively parse dates for existing todos
    let needSave = false;
    todos = todos.map(todo => {
        if (!todo.dueDate) {
            const { dueDate, cleanText } = parseKoreanDate(todo.text);
            if (dueDate) {
                needSave = true;
                return { ...todo, text: cleanText || todo.text, dueDate: dueDate };
            }
        }
        return todo;
    });

    if (needSave) {
        localStorage.setItem('todos', JSON.stringify(todos));
    }

    // 초기 로딩 시 정렬 적용
    todos.sort((a, b) => {
        if (!a.dueDate && b.dueDate) return -1;
        if (a.dueDate && !b.dueDate) return 1;
        if (a.dueDate && b.dueDate) {
            return new Date(a.dueDate) - new Date(b.dueDate);
        }
        return parseInt(a.id) - parseInt(b.id);
    });

    // Initialize
    setTodayDate();
    renderTodos();

    // Event Listeners
    form.addEventListener('submit', addTodo);
    todoList.addEventListener('click', handleTodoAction);
    clearCompletedBtn.addEventListener('click', clearCompleted);
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderTodos();
        });
    });

    // Functions
    function setTodayDate() {
        const options = { month: 'long', day: 'numeric', weekday: 'short' };
        dateDisplay.textContent = new Date().toLocaleDateString('ko-KR', options);
    }

    function saveTodos() {
        todos.sort((a, b) => {
            if (!a.dueDate && b.dueDate) return -1;
            if (a.dueDate && !b.dueDate) return 1;
            if (a.dueDate && b.dueDate) {
                return new Date(a.dueDate) - new Date(b.dueDate);
            }
            return parseInt(a.id) - parseInt(b.id);
        });
        localStorage.setItem('todos', JSON.stringify(todos));
        updateItemsLeft();
    }

    function addTodo(e) {
        e.preventDefault();
        const text = input.value.trim();
        
        if (text) {
            const { dueDate, cleanText } = parseKoreanDate(text);
            const newTodo = {
                id: Date.now().toString(),
                text: cleanText || text,
                dueDate: dueDate,
                completed: false
            };
            
            todos.push(newTodo);
            saveTodos();
            input.value = '';
            
            if (currentFilter !== 'completed') {
                renderTodos();
            }
        }
    }

    function handleTodoAction(e) {
        // Toggle complete
        if (e.target.closest('.checkbox-custom')) {
            const item = e.target.closest('.todo-item');
            const id = item.dataset.id;
            
            todos = todos.map(todo => {
                if (todo.id === id) {
                    return { ...todo, completed: !todo.completed };
                }
                return todo;
            });
            
            saveTodos();
            
            if (currentFilter === 'all') {
                item.classList.toggle('completed');
                renderTodos(); // Re-render to update checkbox icon properly
            } else {
                item.classList.add('fade-out');
                setTimeout(renderTodos, 300);
            }
        }
        
        // Edit
        if (e.target.closest('.edit-btn')) {
            const item = e.target.closest('.todo-item');
            const id = item.dataset.id;
            const todo = todos.find(t => t.id === id);
            
            const contentDiv = item.querySelector('.todo-content');
            contentDiv.innerHTML = `<input type="text" class="edit-input" value="${escapeHTML(todo.text)}">`;
            const input = contentDiv.querySelector('.edit-input');
            input.focus();
            
            const finishEdit = function() {
                const newText = this.value.trim();
                if (newText && newText !== todo.text) {
                    const { dueDate, cleanText } = parseKoreanDate(newText);
                    todo.text = cleanText || newText;
                    if (dueDate) {
                        todo.dueDate = dueDate;
                    }
                    todo.gcalAdded = false;
                    saveTodos();
                }
                renderTodos();
            };
            
            input.addEventListener('blur', finishEdit);
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    input.removeEventListener('blur', finishEdit);
                    finishEdit.call(input);
                }
            });
            return;
        }
        
        // Delete
        if (e.target.closest('.delete-btn')) {
            const item = e.target.closest('.todo-item');
            const id = item.dataset.id;
            
            item.classList.add('fade-out');
            
            setTimeout(() => {
                todos = todos.filter(todo => todo.id !== id);
                saveTodos();
                renderTodos();
            }, 300);
        }
        
        // Google Calendar Add
        if (e.target.closest('.gcal-btn')) {
            const item = e.target.closest('.todo-item');
            const id = item.dataset.id;
            const todo = todos.find(t => t.id === id);
            
            if (todo && todo.dueDate) {
                if (todo.gcalAdded) {
                    if (confirm("앱 내 연동 상태를 해제하시겠습니까?\n(※ 실제 구글 캘린더에 등록된 일정은 직접 지워주셔야 합니다.)")) {
                        todo.gcalAdded = false;
                        saveTodos();
                        renderTodos();
                    }
                    return;
                }

                const dateObj = new Date(todo.dueDate);
                const formatYYYYMMDD = (d) => {
                    const year = d.getFullYear();
                    const month = String(d.getMonth() + 1).padStart(2, '0');
                    const day = String(d.getDate()).padStart(2, '0');
                    return `${year}${month}${day}`;
                };
                
                const startStr = formatYYYYMMDD(dateObj);
                const nextDay = new Date(dateObj);
                nextDay.setDate(dateObj.getDate() + 1);
                const endStr = formatYYYYMMDD(nextDay);
                
                const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(todo.text)}&dates=${startStr}/${endStr}`;
                window.open(gcalUrl, '_blank');
                
                todo.gcalAdded = true;
                saveTodos();
                renderTodos();
            }
        }
    }

    function clearCompleted() {
        const completedItems = todoList.querySelectorAll('.todo-item.completed');
        completedItems.forEach(item => item.classList.add('fade-out'));
        
        setTimeout(() => {
            todos = todos.filter(todo => !todo.completed);
            saveTodos();
            renderTodos();
        }, 300);
    }

    function updateItemsLeft() {
        const activeCount = todos.filter(todo => !todo.completed).length;
        itemsLeftText.textContent = `${activeCount}개 남음`;
    }

    function renderTodoElement(todo, append = false) {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        li.dataset.id = todo.id;
        
        let dateBadge = '';
        let gcalBtn = '';
        if (todo.dueDate) {
            const dateObj = new Date(todo.dueDate);
            const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
            const dd = String(dateObj.getDate()).padStart(2, '0');
            const formattedDate = `${mm}/${dd}(${['일', '월', '화', '수', '목', '금', '토'][dateObj.getDay()]})`;
            dateBadge = `<span class="due-date-badge"><i class="far fa-calendar-alt"></i> ${formattedDate}</span>`;
            
            const btnContent = todo.gcalAdded ? '<span class="g-text">G</span>' : '<i class="fab fa-google"></i>';
            const btnClass = todo.gcalAdded ? 'gcal-btn synced' : 'gcal-btn';
            
            gcalBtn = `
                <button class="${btnClass}" aria-label="Add to Google Calendar" title="${todo.gcalAdded ? '캘린더 연동됨 (다시 추가)' : '구글 캘린더에 추가'}">
                    ${btnContent}
                </button>
            `;
        }
        
        li.innerHTML = `
            <div class="checkbox-wrapper">
                <div class="checkbox-custom">
                    <i class="fas fa-check"></i>
                </div>
            </div>
            <div class="todo-content">
                <span class="todo-text">${escapeHTML(todo.text)}</span>
                <div class="actions">
                    ${gcalBtn}
                    <button class="edit-btn" aria-label="Edit">
                        <i class="fas fa-pencil-alt"></i>
                    </button>
                    <button class="delete-btn" aria-label="Delete">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
                ${dateBadge}
            </div>
        `;
        
        if (append) {
            todoList.appendChild(li);
            // Scroll to bottom
            todoList.scrollTop = todoList.scrollHeight;
        } else {
            todoList.appendChild(li);
        }
    }

    function renderTodos() {
        todoList.innerHTML = '';
        
        let filteredTodos = todos;
        if (currentFilter === 'active') {
            filteredTodos = todos.filter(todo => !todo.completed);
        } else if (currentFilter === 'completed') {
            filteredTodos = todos.filter(todo => todo.completed);
        }
        
        filteredTodos.forEach(todo => renderTodoElement(todo, false));
        updateItemsLeft();
    }

    function escapeHTML(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function parseKoreanDate(text) {
        const today = new Date();
        let dueDate = null;
        let matchedText = '';

        if (text.includes('오늘')) {
            dueDate = new Date(today);
            matchedText = '오늘';
        } else if (text.includes('내일')) {
            dueDate = new Date(today);
            dueDate.setDate(today.getDate() + 1);
            matchedText = '내일';
        } else if (text.includes('모레')) {
            dueDate = new Date(today);
            dueDate.setDate(today.getDate() + 2);
            matchedText = '모레';
        }

        const dateRegex = /(\d{1,2})(?:월\s*|[\/\-])(\d{1,2})(?:일)?/;
        let match = dateRegex.exec(text);
        if (!dueDate && match) {
            dueDate = new Date(today.getFullYear(), parseInt(match[1]) - 1, parseInt(match[2]));
            if (dueDate < today) {
                dueDate.setFullYear(today.getFullYear() + 1);
            }
            matchedText = match[0];
        }

        const weekRegex = /(이번\s*주|다음\s*주)?\s*([월화수목금토일])요일/;
        match = weekRegex.exec(text);
        if (!dueDate && match) {
            const isNextWeek = match[1] && match[1].replace(/\s/g, '') === '다음주';
            const dayStr = match[2];
            const targetDay = ['일', '월', '화', '수', '목', '금', '토'].indexOf(dayStr);
            const currentDay = today.getDay();
            
            dueDate = new Date(today);
            let diff = targetDay - currentDay;
            
            if (isNextWeek) {
                diff += 7;
            } else if (diff <= 0 && !match[1]) {
                diff += 7;
            }
            
            dueDate.setDate(today.getDate() + diff);
            matchedText = match[0];
        }

        if (dueDate) {
            return {
                dueDate: dueDate.toISOString(),
                cleanText: text.replace(matchedText, '').replace(/\s+/g, ' ').trim()
            };
        }
        
        return { dueDate: null, cleanText: text };
    }
});
