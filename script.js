const addBtn = document.getElementById('add-task');
const input = document.getElementById('task-input');
const columns = document.querySelectorAll('.column');

addBtn.addEventListener('click', () => {
    const text = input.value.trim();
    if (!text) return;
    const task = createTaskElement(text);
    document.getElementById('todo').appendChild(task);
    input.value = '';
});

function createTaskElement(text) {
    const task = document.createElement('div');
    task.className = 'task';
    task.draggable = true;

    const span = document.createElement('span');
    span.textContent = text;

    const delBtn = document.createElement('button');
    delBtn.textContent = '✕';
    delBtn.className = 'delete-btn';
    delBtn.addEventListener('click', () => task.remove());

    task.appendChild(span);
    task.appendChild(delBtn);

    task.addEventListener('dragstart', () => {
        task.classList.add('dragging');
    });

    task.addEventListener('dragend', () => {
        task.classList.remove('dragging');
    });

    return task;
}

columns.forEach(column => {
    column.addEventListener('dragover', e => {
        e.preventDefault();
    });

    column.addEventListener('dragenter', e => {
        e.preventDefault();
        column.classList.add('over');
    });

    column.addEventListener('dragleave', () => {
        column.classList.remove('over');
    });

    column.addEventListener('drop', e => {
        e.preventDefault();
        const task = document.querySelector('.task.dragging');
        if (task) column.appendChild(task);
        column.classList.remove('over');
    });
});
