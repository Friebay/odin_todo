export const domController = {
    renderProjects(projectManager, currentProjectId) {
        const projectSelect = document.getElementById('project-select');
        projectSelect.innerHTML = '';

        projectManager.projects.forEach(project => {
            const option = document.createElement('option');
            option.value = project.id;
            option.textContent = project.name;
            option.selected = project.id === currentProjectId;
            projectSelect.appendChild(option);
        });
    },

    renderTodos(currentProject) {
        const todoContainer = document.getElementById('todo-container');
        todoContainer.innerHTML = '';

        currentProject.todos.forEach(todo => {
            const todoElement = document.createElement('div');
            todoElement.classList.add('todo-item');
            todoElement.dataset.todoId = todo.id;

            const priorityColors = {
                low: 'green',
                medium: 'orange',
                high: 'red'
            };

            todoElement.innerHTML = `
                <div class="todo-summary" style="color: ${priorityColors[todo.priority] || 'black'}">
                    <span>${todo.title}</span>
                    <span>${todo.dueDate}</span>
                    <button class="todo-detail-btn">Details</button>
                    <button class="todo-delete-btn">Delete</button>
                </div>
            `;
            todoContainer.appendChild(todoElement);
        });
    }
};
