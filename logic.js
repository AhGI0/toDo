// App state
let todos = [];
let filter = 'all';
let nextId = 1;

// DOM elements (will be initialized when DOM is ready)
let todoInput, addButton, todoList, statsText, emptyState, filterButtons;

// localStorage functions
function saveTodos() {
    localStorage.setItem('todoMagic_todos', JSON.stringify(todos));
    localStorage.setItem('todoMagic_nextId', nextId.toString());
}

function loadTodos() {
    const savedTodos = localStorage.getItem('todoMagic_todos');
    const savedNextId = localStorage.getItem('todoMagic_nextId');
    
    if (savedTodos) {
        todos = JSON.parse(savedTodos);
    }
    if (savedNextId) {
        nextId = parseInt(savedNextId);
    }
    
    renderTodos();
    updateStats();
}

// Main functions
function addTodo() {
    const text = todoInput.value.trim();
    if (!text) return;

    const newTodo = {
        id: nextId++,
        text: text,
        completed: false,
        isNew: true
    };

    todos.unshift(newTodo);
    todoInput.value = '';
    saveTodos();
    
    // Remove the "new" flag after animation
    setTimeout(() => {
        const todo = todos.find(t => t.id === newTodo.id);
        if (todo) {
            todo.isNew = false;
            renderTodos();
        }
    }, 300);

    renderTodos();
    updateStats();
}

function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveTodos();
        renderTodos();
        updateStats();
    }
}

function deleteTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.isDeleting = true;
        renderTodos();
        
        setTimeout(() => {
            todos = todos.filter(t => t.id !== id);
            saveTodos();
            renderTodos();
            updateStats();
        }, 300);
    }
}

function setFilter(newFilter) {
    filter = newFilter;
    
    // Update active filter button
    filterButtons.forEach(button => {
        button.classList.toggle('active', button.dataset.filter === filter);
    });
    
    renderTodos();
    updateEmptyState();
}

function getFilteredTodos() {
    if (filter === 'active') return todos.filter(todo => !todo.completed);
    if (filter === 'completed') return todos.filter(todo => todo.completed);
    return todos;
}

function renderTodos() {
    const filteredTodos = getFilteredTodos();
    
    todoList.innerHTML = filteredTodos.map(todo => `
        <div class="todo-item ${todo.completed ? 'completed' : ''} ${todo.isNew ? 'slide-in' : ''} ${todo.isDeleting ? 'slide-out' : ''}" data-id="${todo.id}">
            <div class="todo-content">
                <div class="todo-inner">
                    <button class="toggle-button ${todo.completed ? 'checked' : ''}" onclick="toggleTodo(${todo.id})">
                        ${todo.completed ? '✓' : '○'}
                    </button>
                    <span class="todo-text">${todo.text}</span>
                    <button class="delete-button" onclick="deleteTodo(${todo.id})">
                        🗑️
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    updateEmptyState();
}

function updateStats() {
    const activeCount = todos.filter(todo => !todo.completed).length;
    const completedCount = todos.filter(todo => todo.completed).length;
    
    statsText.textContent = `${activeCount} active, ${completedCount} completed`;
}

function updateEmptyState() {
    const filteredTodos = getFilteredTodos();
    const isEmpty = filteredTodos.length === 0;
    
    emptyState.classList.toggle('hidden', !isEmpty);
    
    if (isEmpty) {
        const emptyText = emptyState.querySelector('.empty-text');
        if (filter === 'completed') {
            emptyText.textContent = 'No completed tasks yet';
        } else if (filter === 'active') {
            emptyText.textContent = 'No active tasks';
        } else {
            emptyText.textContent = 'No tasks yet. Add one above!';
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    todoInput = document.getElementById('todoInput');
    addButton = document.getElementById('addButton');
    todoList = document.getElementById('todoList');
    statsText = document.getElementById('statsText');
    emptyState = document.getElementById('emptyState');
    filterButtons = document.querySelectorAll('.filter-button');

    // Event listeners
    addButton.addEventListener('click', addTodo);
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTodo();
        }
    });

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            setFilter(button.dataset.filter);
        });
    });

    // Load saved todos and initialize
    loadTodos();
    updateStats();
    updateEmptyState();
});