import { format, parseISO } from 'date-fns';
import './styles.css';

class Todo {
    constructor(title, description, dueDate, priority) {
        this.id = Date.now().toString();
        this.title = title;
        this.description = description;
        this.dueDate = dueDate;
        this.priority = priority;
        this.completed = false;
    }

    formatDate() {
        return format(parseISO(this.dueDate), 'PP');
    }
}

class Project {
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
class ProjectManager {
  constructor() {
      this.projects = this.loadProjects();
      
      // Create default project if no projects exist
      if (this.projects.length === 0) {
          this.createProject('Default Project');
      }
  }

  getDefaultProject() {
      return this.projects.length > 0 
          ? this.projects[0] 
          : this.createProject('Default Project');
  }

  createProject(name) {
      const newProject = new Project(name);
      this.projects.push(newProject);
      this.saveProjects();
      return newProject;
  }

  deleteProject(projectId) {
      // Prevent deleting the last project
      if (this.projects.length > 1) {
          this.projects = this.projects.filter(project => project.id !== projectId);
          this.saveProjects();
      } else {
          throw new Error("Cannot delete the last project");
      }
  }

  saveProjects() {
      try {
          const projectsToSave = this.projects.map(project => ({
              id: project.id,
              name: project.name,
              todos: project.todos.map(todo => ({
                  id: todo.id,
                  title: todo.title,
                  description: todo.description,
                  dueDate: todo.dueDate,
                  priority: todo.priority,
                  completed: todo.completed
              }))
          }));
          
          localStorage.setItem('todoProjects', JSON.stringify(projectsToSave));
      } catch (error) {
          console.error('Error saving projects to localStorage:', error);
      }
  }

  loadProjects() {
      try {
          const storedProjects = localStorage.getItem('todoProjects');
          if (storedProjects) {
              const parsedProjects = JSON.parse(storedProjects);
              return parsedProjects.map(projectData => {
                  const project = new Project(projectData.name);
                  project.id = projectData.id;
                  
                  // Reconstruct todos
                  project.todos = projectData.todos.map(todoData => {
                      const todo = new Todo(
                          todoData.title, 
                          todoData.description, 
                          todoData.dueDate, 
                          todoData.priority
                      );
                      todo.id = todoData.id;
                      todo.completed = todoData.completed;
                      return todo;
                  });
                  
                  return project;
              });
          }
          return [];
      } catch (error) {
          console.error('Error loading projects from localStorage:', error);
          return [];
      }
  }
}


class TodoApp {
    constructor() {
        this.projectManager = new ProjectManager();
        this.currentProject = this.projectManager.getDefaultProject();
        this.initializeEventListeners();
        this.renderProjects();
        this.renderProjectList();
        this.renderTodos();
    }

    initializeEventListeners() {
        const todoForm = document.getElementById('todo-form');
        const projectForm = document.getElementById('project-form');
        const projectSelect = document.getElementById('project-select');
        const projectListContainer = document.getElementById('project-list');
        const todoDetailModal = document.getElementById('todo-detail-modal');
        const todoDetailClose = document.getElementById('todo-detail-close');
        
        todoForm.addEventListener('submit', this.handleTodoSubmit.bind(this));
        projectForm.addEventListener('submit', this.handleProjectSubmit.bind(this));
        projectSelect.addEventListener('change', this.handleProjectChange.bind(this));
        
        todoDetailClose.addEventListener('click', () => {
            todoDetailModal.style.display = 'none';
        });

        // Event delegation for project list and todo details
        projectListContainer.addEventListener('click', this.handleProjectListClick.bind(this));
        document.getElementById('todo-container').addEventListener('click', this.handleTodoClick.bind(this));

        document.getElementById('project-list').addEventListener('click', (event) => {
          const deleteButton = event.target.closest('.delete-project-btn');
          if (deleteButton) {
              const projectElement = deleteButton.closest('.project-item');
              const projectId = projectElement.dataset.projectId;
              
              if (this.projectManager.projects.length > 1) {
                  // Remove the project
                  this.projectManager.deleteProject(projectId);
                  
                  // Rerender projects and select default
                  this.renderProjects();
                  this.renderProjectList();
                  this.currentProject = this.projectManager.getDefaultProject();
                  this.renderTodos();
              } else {
                  alert('Cannot delete the last project');
              }
          }
      });
    }

    

    handleProjectListClick(event) {
        const projectElement = event.target.closest('.project-item');
        if (projectElement) {
            const projectId = projectElement.dataset.projectId;
            this.currentProject = this.projectManager.projects.find(p => p.id === projectId);
            this.renderTodos();
        }
    }

    handleTodoClick(event) {
        const todoElement = event.target.closest('.todo-item');
        const detailButton = event.target.closest('.todo-detail-btn');
        const deleteButton = event.target.closest('.todo-delete-btn');

        if (todoElement && detailButton) {
            const todoId = todoElement.dataset.todoId;
            this.showTodoDetails(todoId);
        } else if (todoElement && deleteButton) {
            const todoId = todoElement.dataset.todoId;
            this.deleteTodo(todoId);
        }
    }

    showTodoDetails(todoId) {
      const todo = this.currentProject.todos.find(t => t.id === todoId);
      if (todo) {
          const modal = document.getElementById('todo-detail-modal');
          const modalContent = document.getElementById('todo-detail-content');
          
          modalContent.innerHTML = `
              <h2>${todo.title}</h2>
              <p><strong>Description:</strong> ${todo.description}</p>
              <p><strong>Due Date:</strong> ${todo.formatDate()}</p>
              <label for="todo-priority">Priority:</label>
              <select id="todo-priority">
                  <option value="low" ${todo.priority === 'low' ? 'selected' : ''}>Low</option>
                  <option value="medium" ${todo.priority === 'medium' ? 'selected' : ''}>Medium</option>
                  <option value="high" ${todo.priority === 'high' ? 'selected' : ''}>High</option>
              </select>
              <p><strong>Status:</strong> ${todo.completed ? 'Completed' : 'Incomplete'}</p>
              <button id="save-todo-changes">Save Changes</button>
          `;
          
          modal.style.display = 'block';
  
          // Add event listener for saving changes
          document.getElementById('save-todo-changes').addEventListener('click', () => {
              const newPriority = document.getElementById('todo-priority').value;
              todo.priority = newPriority;
              this.projectManager.saveProjects();
              this.renderTodos();
              modal.style.display = 'none';
          });
      }
  }

    handleTodoSubmit(event) {
        event.preventDefault();
        const title = document.getElementById('title').value;
        const description = document.getElementById('description').value;
        const dueDate = document.getElementById('due-date').value;
        const priority = document.getElementById('priority').value;

        const newTodo = new Todo(title, description, dueDate, priority);
        this.currentProject.addTodo(newTodo);
        this.projectManager.saveProjects();
        this.renderTodos();
        event.target.reset();
    }

    handleProjectSubmit(event) {
        event.preventDefault();
        const projectName = document.getElementById('project-name').value;
        this.projectManager.createProject(projectName);
        this.renderProjects();
        this.renderProjectList();
        event.target.reset();
    }

    handleProjectChange(event) {
        const selectedProjectId = event.target.value;
        this.currentProject = this.projectManager.projects.find(
            project => project.id === selectedProjectId
        );
        this.renderTodos();
    }

    renderProjects() {
        const projectSelect = document.getElementById('project-select');
        projectSelect.innerHTML = '';

        this.projectManager.projects.forEach(project => {
            const option = document.createElement('option');
            option.value = project.id;
            option.textContent = project.name;
            option.selected = project === this.currentProject;
            projectSelect.appendChild(option);
        });
    }

    renderProjectList() {
      const projectListContainer = document.getElementById('project-list');
      projectListContainer.innerHTML = '';
  
      this.projectManager.projects.forEach(project => {
          const projectElement = document.createElement('div');
          projectElement.classList.add('project-item');
          projectElement.dataset.projectId = project.id;
          projectElement.innerHTML = `
              <div class="project-header">
                  <h3>${project.name}</h3>
                  <button class="delete-project-btn">🗑️ Delete</button>
              </div>
              <p>Todos: ${project.todos.length}</p>
          `;
          projectListContainer.appendChild(projectElement);
      });
  }

    renderTodos() {
        const todoContainer = document.getElementById('todo-container');
        todoContainer.innerHTML = '';

        this.currentProject.todos.forEach(todo => {
            const todoElement = document.createElement('div');
            todoElement.classList.add('todo-item');
            todoElement.dataset.todoId = todo.id;
            
            // Color-code based on priority
            const priorityColors = {
                'low': 'green',
                'medium': 'orange',
                'high': 'red'
            };

            todoElement.innerHTML = `
                <div class="todo-summary" style="color: ${priorityColors[todo.priority] || 'black'}">
                    <span>${todo.title}</span>
                    <span>${todo.formatDate()}</span>
                    <button class="todo-detail-btn">Details</button>
                    <button class="todo-delete-btn">Delete</button>
                </div>
            `;
            todoContainer.appendChild(todoElement);
        });
    }

    deleteTodo(todoId) {
        this.currentProject.removeTodo(todoId);
        this.projectManager.saveProjects();
        this.renderTodos();
    }

    deleteProject(projectId) {
      // Prevent deleting the last project
      if (this.projects.length > 1) {
          this.projects = this.projects.filter(project => project.id !== projectId);
          this.saveProjects();
          return true;
      }
      return false;
  }
}



window.todoApp = new TodoApp();