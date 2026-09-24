/**
 * DecodeLabs Project 3: Engineering Standards & Architecture
 * 1. IPO Loop: Strict separation of Input (Listeners), Process (State), and Output (DOM Mutation).
 * 2. Security: Uses document.createElement & textContent to completely eliminate XSS vulnerabilities.
 * 3. Decoupling: Uses js- hooks for functional bindings and is- prefixes for UI states[cite: 1].
 * 4. Advanced Mechanics: Persistence via localStorage + Event Delegation for dynamically created items[cite: 1].
 */

// ==========================================
// 1. STATE MANAGEMENT (Application Memory)
// ==========================================
const STORAGE_KEYS = {
  TASKS: 'decodelabs_tasks_p3',
  THEME: 'decodelabs_theme_p3'
};

let state = {
  tasks: JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS)) || [],
  filter: 'all', // 'all' | 'pending' | 'completed'
  isDarkMode: JSON.parse(localStorage.getItem(STORAGE_KEYS.THEME)) || false
};

// State Persistence Helper
function persistState() {
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(state.tasks));
  localStorage.setItem(STORAGE_KEYS.THEME, JSON.stringify(state.isDarkMode));
}

// ==========================================
// 2. DOM REFERENCES (Node Targets)
// ==========================================
const DOM = {
  themeToggleBtn: document.querySelector('.js-theme-toggle'),
  themeLabel: document.querySelector('.js-theme-label'),
  taskForm: document.querySelector('.js-task-form'),
  taskInput: document.querySelector('.js-task-input'),
  taskList: document.querySelector('.js-task-list'),
  filterGroup: document.querySelector('.js-filter-group'),
  filterBtns: document.querySelectorAll('.js-filter-btn'),
  statTotal: document.querySelector('.js-stat-total'),
  statPending: document.querySelector('.js-stat-pending'),
  emptyState: document.querySelector('.js-empty-state')
};

// ==========================================
// 3. RENDERERS & MUTATORS (Output Phase)
// ==========================================

// Safe Node Factory (Prevents XSS Security Vulnerabilities)[cite: 1]
function createTaskNode(task) {
  const li = document.createElement('li');
  li.className = `task-item ${task.completed ? 'is-completed' : ''}`;
  li.dataset.id = task.id;

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = task.completed;
  checkbox.className = 'js-task-checkbox';
  checkbox.setAttribute('aria-label', 'Toggle task completion');

  const span = document.createElement('span');
  span.className = 'task-item__text';
  span.textContent = task.title; // Safe text assignment[cite: 1]

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'btn btn-delete js-task-delete';
  deleteBtn.textContent = 'Delete';

  li.append(checkbox, span, deleteBtn);
  return li;
}

// Core Rendering Engine
function render() {
  // Update Theme State
  document.body.classList.toggle('is-dark-mode', state.isDarkMode);
  DOM.themeLabel.textContent = state.isDarkMode ? 'Light Mode' : 'Dark Mode';

  // Filter Logic (Process Phase)[cite: 1]
  const filteredTasks = state.tasks.filter(task => {
    if (state.filter === 'pending') return !task.completed;
    if (state.filter === 'completed') return task.completed;
    return true;
  });

  // Clear existing markup efficiently
  DOM.taskList.textContent = '';

  // Append Nodes using Document Fragment for Optimal Rendering Performance
  const fragment = document.createDocumentFragment();
  filteredTasks.forEach(task => {
    fragment.appendChild(createTaskNode(task));
  });
  DOM.taskList.appendChild(fragment);

  // Update Statistics Counters
  DOM.statTotal.textContent = state.tasks.length;
  DOM.statPending.textContent = state.tasks.filter(t => !t.completed).length;

  // Manage Empty State Visibility
  DOM.emptyState.classList.toggle('is-visible', filteredTasks.length === 0);

  // Sync Active Filter UI State
  DOM.filterBtns.forEach(btn => {
    const isTarget = btn.dataset.filter === state.filter;
    btn.classList.toggle('is-active', isTarget);
  });
}

// ==========================================
// 4. LOGIC ACTUATORS (Process Phase)
// ==========================================

function handleAddTask(e) {
  e.preventDefault();
  const title = DOM.taskInput.value.trim();
  if (!title) return;

  const newTask = {
    id: Date.now().toString(),
    title: title,
    completed: false
  };

  state.tasks.push(newTask);
  persistState();
  render();

  DOM.taskInput.value = '';
  DOM.taskInput.focus();
}

function handleListClick(e) {
  const target = e.target;
  const taskItem = target.closest('.task-item');
  if (!taskItem) return;

  const taskId = taskItem.dataset.id;

  // Toggle Completion logic
  if (target.classList.contains('js-task-checkbox')) {
    state.tasks = state.tasks.map(task => 
      task.id === taskId ? { ...task, completed: target.checked } : task
    );
    persistState();
    render();
  }

  // Delete Task logic
  if (target.classList.contains('js-task-delete')) {
    state.tasks = state.tasks.filter(task => task.id !== taskId);
    persistState();
    render();
  }
}

function handleFilterClick(e) {
  const filterBtn = e.target.closest('.js-filter-btn');
  if (!filterBtn) return;

  state.filter = filterBtn.dataset.filter;
  render();
}

function handleThemeToggle() {
  state.isDarkMode = !state.isDarkMode;
  persistState();
  render();
}

// ==========================================
// 5. EVENT LISTENERS (Input Phase)
// ==========================================

function init() {
  // Bind form submission[cite: 1]
  DOM.taskForm.addEventListener('submit', handleAddTask);

  // Event Delegation on dynamic list container[cite: 1]
  DOM.taskList.addEventListener('click', handleListClick);

  // Filter clicks binding[cite: 1]
  DOM.filterGroup.addEventListener('click', handleFilterClick);

  // Theme toggle binding[cite: 1]
  DOM.themeToggleBtn.addEventListener('click', handleThemeToggle);

  // Initial Execution
  render();
}

// Initialize Application once DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);