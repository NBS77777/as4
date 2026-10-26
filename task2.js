const MAX_PROGRESS_TASKS = 3;

const tasks = [
    { id: 1, title: "Design the main menu", tag: "Design", priority: "High", status: "todo", completed: false },
    { id: 2, title: "Create the player character", tag: "Code", priority: "High", status: "progress", completed: false },
    { id: 3, title: "Design game icons", tag: "Design", priority: "Medium", status: "todo", completed: false },
    { id: 4, title: "Test player movement", tag: "Testing", priority: "Medium", status: "todo", completed: false },
    { id: 5, title: "Fix collision bugs", tag: "Code", priority: "High", status: "todo", completed: false },
    { id: 6, title: "Test sound effects", tag: "Testing", priority: "Low", status: "done", completed: true },
    { id: 7, title: "Create the game background", tag: "Design", priority: "Low", status: "todo", completed: false },
    { id: 8, title: "Add enemy movement", tag: "Code", priority: "High", status: "todo", completed: false },
    { id: 9, title: "Test the main menu", tag: "Testing", priority: "Medium", status: "done", completed: true },
    { id: 10, title: "Balance game difficulty", tag: "Code", priority: "Medium", status: "todo", completed: false }
];

const board = document.getElementById("board");
const searchInput = document.getElementById("searchInput");
const tagFilter = document.getElementById("tagFilter");
const sortPriority = document.getElementById("sortPriority");
const message = document.getElementById("message");
const progressText = document.getElementById("progressText");
const progressBar = document.getElementById("progressBar");

const lists = {
    todo: document.getElementById("todoList"),
    progress: document.getElementById("progressList"),
    done: document.getElementById("doneList")
};

const counts = {
    todo: document.getElementById("todoCount"),
    progress: document.getElementById("progressCount"),
    done: document.getElementById("doneCount")
};

function render() {
    for (const list of Object.values(lists)) {
        list.replaceChildren();
    }

    const search = searchInput.value.trim().toLowerCase();
    const selectedTag = tagFilter.value;
    const priorityOrder = { High: 3, Medium: 2, Low: 1 };

    let visibleTasks = [];

    for (const task of tasks) {
        if (
            task.title.toLowerCase().includes(search) &&
            (selectedTag === "all" || task.tag === selectedTag)
        ) {
            visibleTasks.push(task);
        }
    }

    if (sortPriority.value === "high") {
        visibleTasks.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
    } else if (sortPriority.value === "low") {
        visibleTasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    }

    for (const task of visibleTasks) {
        const card = document.createElement("article");
        card.classList.add("task-card");

        const title = document.createElement("h3");
        title.textContent = task.title;

        const tag = document.createElement("p");
        tag.textContent = `Tag: ${task.tag}`;

        const priority = document.createElement("p");
        priority.textContent = `Priority: ${task.priority}`;
        priority.classList.add("priority", `priority-${task.priority.toLowerCase()}`);

        const actions = document.createElement("div");
        actions.classList.add("task-actions");

        const previousButton = document.createElement("button");
        previousButton.textContent = "←";
        previousButton.dataset.action = "previous";
        previousButton.dataset.id = task.id;
        previousButton.setAttribute("aria-label", `Move ${task.title} to previous column`);
        previousButton.disabled = task.status === "todo";

        const nextButton = document.createElement("button");
        nextButton.textContent = "→";
        nextButton.dataset.action = "next";
        nextButton.dataset.id = task.id;
        nextButton.setAttribute("aria-label", `Move ${task.title} to next column`);
        nextButton.disabled = task.status === "done";

        actions.append(previousButton, nextButton);
        card.append(title, tag, priority, actions);
        lists[task.status].append(card);
    }

    for (const status of Object.keys(lists)) {
        let count = 0;

        for (const task of tasks) {
            if (task.status === status) {
                count++;
            }
        }

        counts[status].textContent = count;
    }

    let completedCount = 0;

    for (const task of tasks) {
        if (task.status === "done") {
            completedCount++;
        }
    }

    const progress = Math.round((completedCount / tasks.length) * 100);
    progressText.textContent = `${progress}%`;
    progressBar.style.width = `${progress}%`;

    message.textContent = visibleTasks.length === 0 ? "No tasks found." : "";
}

function moveTask(task, direction) {
    const statuses = ["todo", "progress", "done"];
    const currentIndex = statuses.indexOf(task.status);
    const nextIndex = currentIndex + direction;

    if (nextIndex < 0 || nextIndex >= statuses.length) {
        return;
    }

    const nextStatus = statuses[nextIndex];

    if (nextStatus === "progress") {
        let progressCount = 0;

        for (const item of tasks) {
            if (item.status === "progress") {
                progressCount++;
            }
        }

        if (progressCount >= MAX_PROGRESS_TASKS) {
            message.textContent = "In Progress can contain at most 3 tasks.";
            return;
        }
    }

    task.status = nextStatus;
    task.completed = nextStatus === "done";
    message.textContent = "";
    render();
}

board.addEventListener("click", function (event) {
    const button = event.target.closest("button[data-action]");

    if (button === null || !board.contains(button)) {
        return;
    }

    const taskId = Number(button.dataset.id);
    const task = tasks.find(item => item.id === taskId);

    if (task === undefined) {
        return;
    }

    const direction = button.dataset.action === "next" ? 1 : -1;
    moveTask(task, direction);
});

searchInput.addEventListener("input", render);
tagFilter.addEventListener("change", render);
sortPriority.addEventListener("change", render);

render();
