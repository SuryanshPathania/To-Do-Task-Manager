document.addEventListener("DOMContentLoaded", () => {
    const taskInput = document.getElementById("taskInput");
    const addTaskButton = document.getElementById("addTaskButton");
    const taskList = document.getElementById("taskList");
    const noTasksMessage = document.getElementById("noTasksMessage");
    const searchBar = document.getElementById("searchBar");
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

    function renderTasks(filter = "all") {
        taskList.innerHTML = "";
        let filteredTasks = tasks.filter(task => {
            if (filter === "completed") return task.completed;
            if (filter === "active") return !task.completed;
            return true;
        });

        const searchTerm = searchBar.value.toLowerCase();
        filteredTasks = filteredTasks.filter(task => task.text.toLowerCase().includes(searchTerm));

        filteredTasks.forEach(task => createTaskElement(task));
        noTasksMessage.style.display = filteredTasks.length ? "none" : "block";
    }

    function createTaskElement(task) {
        const taskItem = document.createElement("li");
        taskItem.setAttribute("draggable", "true");
        taskItem.dataset.id = task.id;

        const taskText = document.createElement("span");
        taskText.textContent = task.text;
        taskText.classList.toggle("completed", task.completed);

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.addEventListener("click", () => editTask(task.id));

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", () => deleteTask(task.id));

        const completeButton = document.createElement("button");
        completeButton.textContent = task.completed ? "Unmark" : "Mark as completed";
        completeButton.addEventListener("click", () => toggleCompleteTask(task.id));

        taskItem.append(taskText, editButton, deleteButton, completeButton);
        taskList.appendChild(taskItem);

        // Drag-and-drop functionality
        taskItem.addEventListener("dragstart", e => {
            e.dataTransfer.setData("text/plain", task.id);
        });

        taskItem.addEventListener("dragover", e => {
            e.preventDefault();
            const draggingTask = document.querySelector(".dragging");
            taskList.insertBefore(draggingTask, taskItem);
        });

        taskItem.addEventListener("drop", () => reorderTasks());
    }

    function addTask() {
        const text = taskInput.value.trim();
        if (!text) return;
        const newTask = { id: Date.now().toString(), text, completed: false };
        tasks.push(newTask);
        saveTasks();
        taskInput.value = "";
        renderTasks();
    }

    function deleteTask(id) {
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
        renderTasks();
    }

    function toggleCompleteTask(id) {
        const task = tasks.find(task => task.id === id);
        if (task) task.completed = !task.completed;
        saveTasks();
        renderTasks();
    }

    function editTask(id) {
        const task = tasks.find(task => task.id === id);
        if (!task) return;
        const newText = prompt("Edit task:", task.text);
        if (newText !== null) {
            task.text = newText.trim();
            saveTasks();
            renderTasks();
        }
    }

    function reorderTasks() {
        const reorderedTasks = [...taskList.children].map(item => tasks.find(task => task.id === item.dataset.id));
        tasks = reorderedTasks;
        saveTasks();
    }

    function saveTasks() {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }

    addTaskButton.addEventListener("click", addTask);
    searchBar.addEventListener("input", () => renderTasks());
    document.getElementById("showAll").addEventListener("click", () => renderTasks("all"));
    document.getElementById("showCompleted").addEventListener("click", () => renderTasks("completed"));
    document.getElementById("showActive").addEventListener("click", () => renderTasks("active"));

    renderTasks();  // Initial render
});
