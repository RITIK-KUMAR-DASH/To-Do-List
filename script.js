// Corrected JavaScript for To-Do List

document.addEventListener('DOMContentLoaded', function () {
    const taskInput = document.getElementById('new-task');
    const addBtn = document.getElementById('add-btn');
    const taskList = document.getElementById('task-list');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const totalTasksEl = document.getElementById('total-tasks');
    const completedTasksEl = document.getElementById('completed-tasks');
    const themeButtons = document.querySelectorAll('.theme-btn');
    const priorityOptions = document.querySelectorAll('.priority-option');
    const modeToggle = document.getElementById('mode-toggle');
    const prioritySelector = document.getElementById('priority-selector');
    const prioritySlider = document.getElementById('priority-slider');
    const taskDateInput = document.getElementById('task-date');
    const taskTimeInput = document.getElementById('task-time');

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let currentFilter = 'all';
    let currentPriority = 'medium';
    let currentTheme = 'purple-blue';
    let darkMode = localStorage.getItem('darkMode') !== 'false';

    function init() {
        setTheme(darkMode ? 'dark' : 'light');

        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const time = now.toTimeString().slice(0, 5);

        taskDateInput.value = today;
        taskTimeInput.value = time;

        renderTasks();
        updateStats();
        setupEventListeners();
        updatePrioritySlider();
    }

    function setupEventListeners() {
        addBtn.addEventListener('click', addTask);
        taskInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') addTask();
        });
        filterButtons.forEach(button => {
            button.addEventListener('click', function () {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                currentFilter = this.dataset.filter;
                renderTasks();
            });
        });
        themeButtons.forEach(button => {
            button.addEventListener('click', function () {
                themeButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                currentTheme = this.dataset.theme;
                applyColorTheme(currentTheme);
            });
        });
        priorityOptions.forEach(option => {
            option.addEventListener('click', function () {
                priorityOptions.forEach(opt => opt.classList.remove('selected'));
                this.classList.add('selected');
                currentPriority = this.dataset.priority.toLowerCase();
                updatePrioritySlider();
            });
        });
        modeToggle.addEventListener('click', toggleDarkMode);
        window.addEventListener('resize', updatePrioritySlider);
    }

    function toggleDarkMode() {
        darkMode = !darkMode;
        localStorage.setItem('darkMode', darkMode);
        setTheme(darkMode ? 'dark' : 'light');
    }

    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        modeToggle.innerHTML = theme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    }

    function applyColorTheme(theme) {
        const themes = {
            'purple-blue': ['#8a2be2', '#5f1d9e', '#00c6fb'],
            'red-yellow': ['#ff4d4d', '#d63031', '#fdcb6e'],
            'purple-pink': ['#6c5ce7', '#5649d2', '#e84393'],
            'orange-yellow': ['#e17055', '#d63031', '#fdcb6e']
        };

        const [primary, primaryDark, secondary] = themes[theme] || themes['purple-blue'];

        document.documentElement.style.setProperty('--primary', primary);
        document.documentElement.style.setProperty('--primary-dark', primaryDark);
        document.documentElement.style.setProperty('--secondary', secondary);

        function hexToRgb(hex) {
            const bigint = parseInt(hex.slice(1), 16);
            return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
        }

        const primaryRgb = hexToRgb(primary).join(', ');
        const secondaryRgb = hexToRgb(secondary).join(', ');
        document.documentElement.style.setProperty('--primary-rgb', primaryRgb);
        document.documentElement.style.setProperty('--secondary-rgb', secondaryRgb);
        updatePrioritySlider();
    }

    function addTask() {
        const taskText = taskInput.value.trim();
        if (!taskText) {
            animateInputError();
            return;
        }

        const date = taskDateInput.value;
        const time = taskTimeInput.value;
        let formattedDate = '';

        if (date) {
            const dateObj = new Date(date);
            formattedDate = dateObj.toLocaleDateString('en-US', {
                weekday: 'short', month: 'short', day: 'numeric'
            });
            if (time) formattedDate += ` at ${time}`;
        }

        const newTask = {
            id: Date.now(),
            text: taskText,
            completed: false,
            priority: currentPriority,
            dueDate: date,
            dueTime: time,
            formattedDate
        };

        tasks.unshift(newTask);
        saveTasks();
        renderTasks();
        updateStats();
        taskInput.value = '';
    }

    function animateInputError() {
        taskInput.style.borderColor = 'var(--danger)';
        taskInput.animate([
            { transform: 'translateX(0)' },
            { transform: 'translateX(-5px)' },
            { transform: 'translateX(5px)' },
            { transform: 'translateX(0)' }
        ], { duration: 200 });
        setTimeout(() => taskInput.style.borderColor = 'var(--card-border)', 1000);
    }

    function renderTasks() {
        taskList.innerHTML = '';
        const filtered = tasks.filter(task => currentFilter === 'all' ||
            (currentFilter === 'active' && !task.completed) ||
            (currentFilter === 'completed' && task.completed));

        if (!filtered.length) {
            const msg = document.createElement('div');
            msg.className = 'empty-state';
            msg.innerHTML = `
                <i class="fas fa-tasks"></i>
                <h3>No tasks found</h3>
                <p>${currentFilter === 'completed' ? 'Complete tasks to see them here.' : 'Add your first task!'}</p>`;
            taskList.appendChild(msg);
            return;
        }

        filtered.forEach(task => {
            const el = document.createElement('div');
            el.className = `task ${task.completed ? 'completed' : ''}`;
            el.dataset.id = task.id;

            el.innerHTML = `
                <div class="priority-indicator priority-${task.priority}"></div>
                <label class="checkbox-container">
                    <input type="checkbox" ${task.completed ? 'checked' : ''}>
                    <span class="checkmark"></span>
                </label>
                <div class="task-content">
                    ${task.text}
                    ${task.formattedDate ? `<div class="task-meta"><span>${task.formattedDate}</span></div>` : ''}
                </div>
                <div class="task-actions">
                    <button class="task-btn complete-btn"><i class="fas ${task.completed ? 'fa-undo' : 'fa-check'}"></i></button>
                    <button class="task-btn delete-btn"><i class="fas fa-trash"></i></button>
                </div>`;

            const checkbox = el.querySelector('input[type="checkbox"]');
            const completeBtn = el.querySelector('.complete-btn');
            const deleteBtn = el.querySelector('.delete-btn');

            checkbox.addEventListener('change', () => toggleTaskComplete(task.id));
            completeBtn.addEventListener('click', () => toggleTaskComplete(task.id));
            deleteBtn.addEventListener('click', () => deleteTask(task.id));

            taskList.appendChild(el);
        });
    }

    function toggleTaskComplete(id) {
        const task = tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            saveTasks();
            renderTasks();
            updateStats();
        }
    }

    function deleteTask(id) {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        renderTasks();
        updateStats();
    }

    function updateStats() {
        totalTasksEl.textContent = `${tasks.length} tasks`;
        completedTasksEl.textContent = `${tasks.filter(t => t.completed).length} completed`;
    }

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function updatePrioritySlider() {
        const selected = document.querySelector('.priority-option.selected');
        if (!selected) return;

        const optionRect = selected.getBoundingClientRect();
        const containerRect = prioritySelector.getBoundingClientRect();
        const left = optionRect.left - containerRect.left - 3;
        prioritySlider.style.transform = `translateX(${left}px)`;
    }

    init();
});
