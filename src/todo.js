export class Todo {
    constructor(title, description, dueDate, priority) {
        this.id = Date.now().toString();
        this.title = title;
        this.description = description;
        this.dueDate = dueDate;
        this.priority = priority;
        this.completed = false;
    }
}

export class Project {
    constructor(name) {
        this.id = Date.now().toString();
        this.name = name;
        this.todos = [];
    }

    addTodo(todo) {
        this.todos.push(todo);
    }

    removeTodo(todoId) {
        this.todos = this.todos.filter(todo => todo.id !== todoId);
    }
}

export class ProjectManager {
    constructor() {
        this.projects = this.loadProjects();

        if (this.projects.length === 0) {
            this.createProject('Default Project');
        }
    }

    getDefaultProject() {
        return this.projects.length > 0 ? this.projects[0] : this.createProject('Default Project');
    }

    createProject(name) {
        const newProject = new Project(name);
        this.projects.push(newProject);
        this.saveProjects();
        return newProject;
    }

    deleteProject(projectId) {
        if (this.projects.length > 1) {
            this.projects = this.projects.filter(project => project.id !== projectId);
            this.saveProjects();
        } else {
            throw new Error('Cannot delete the last project');
        }
    }

    saveProjects() {
        localStorage.setItem('todoProjects', JSON.stringify(this.projects));
    }

    loadProjects() {
        const storedProjects = localStorage.getItem('todoProjects');
        return storedProjects ? JSON.parse(storedProjects).map(data => {
            const project = new Project(data.name);
            project.id = data.id;
            project.todos = data.todos.map(todoData => {
                const todo = new Todo(todoData.title, todoData.description, todoData.dueDate, todoData.priority);
                todo.id = todoData.id;
                todo.completed = todoData.completed;
                return todo;
            });
            return project;
        }) : [];
    }
}
