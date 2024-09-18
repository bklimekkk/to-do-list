let addItemInput = document.getElementById("add-item-input");
let calendarInput = document.getElementById("calendar-input");
let itemsContainer = document.getElementById("items-container");
let addItemBtn = document.getElementById("add-item-btn");
let errorSection = document.getElementById("error-section");
let filterSection = document.getElementById("filter-section"); 
let clearTasksBtn = document.getElementById("clear-tasks-btn");
let clearCompletedBtn = document.getElementById("clear-completed-btn");

let arrayOfActivityNames = JSON.parse(localStorage.getItem("activityNames")) || [];
if (arrayOfActivityNames.length !== 0) {
    clearTasksBtn.classList.remove("hide");
} 
itemsContainer.innerHTML = localStorage.getItem("items") || "";
itemsContainer.querySelectorAll('.item').forEach((item) => {
    let activityNameElement = item.querySelector('.activity-name');
    let checkboxElement = item.querySelector('.task-checkbox');
    let task = arrayOfActivityNames.find(task => task.name === activityNameElement.innerText);
    if(task.checked) {
        checkboxElement.checked = true;
    } else {
        checkboxElement.checked = false;
    }
});
filterSection.innerHTML = localStorage.getItem("filterOptions") || "";

if(arrayOfActivityNames.some(task => task.checked === true)) {
    clearCompletedBtn.classList.remove("hide");
}

addItemBtn.addEventListener('click', () => {
    let activityName = addItemInput.value;
    let dueTime = calendarInput.value;
    
    if (activityName === '') {
        errorSection.classList.remove("hide");
        errorSection.innerText = "You must enter activity name";
        return;
    } else if (arrayOfActivityNames.some(activity => activity.name === activityName)) {
        errorSection.classList.remove("hide");
        errorSection.innerText = "This activity already exists";
        return;
    } else if(dueTime === "") {
        errorSection.classList.remove("hide");
        errorSection.innerText = "You must enter due date";
        return;
    }

    let formattedDueTime = formatTime(dueTime);
    
    arrayOfActivityNames.push({
        name: activityName,
        date: formattedDueTime,
        checked: false
    });
    
    localStorage.setItem("activityNames", JSON.stringify(arrayOfActivityNames));
    
    if(arrayOfActivityNames.length === 1) {
        filterSection.innerHTML += `
            <input type="text" placeholder="Search item" class="search-item-input" />
            <button class="all-tasks selected-filter">All tasks</button>
            <button class="complete-tasks">Completed tasks</button>
            <button class="incomplete-tasks">Incomplete tasks</button>
        `
        localStorage.setItem("filterOptions", filterSection.innerHTML);
        clearTasksBtn.classList.remove("hide"); 
    }
    
    const taskElement = document.createElement('div');
    taskElement.classList.add('item'); 
    
    taskElement.innerHTML += `
        <div class="non-edit-section">
            <input type="checkbox" class="task-checkbox"/>
            <div class="activity-name">${activityName}</div>
            <div class="due-time">${dueTime}</div>
            <div class="flex"></div>
            <button class="edit-button">Edit</button>
            <button class="delete-button">Delete</button>
        </div>
        <div class="edit-item-section hide">
            <input type="text" placeholder="Enter new name" class="edit-name-input" value="${activityName}"/>
            <input type="datetime-local" class="edit-date-input" value="${dueTime}"/>
            <div class="flex"></div>
            <button class="edit-done-button">Done</button>
        </div>
    `;

    itemsContainer.appendChild(taskElement);
    localStorage.setItem("items", itemsContainer.innerHTML);
    addItemInput.value = "";
    errorSection.classList.add("hide");
});

itemsContainer.addEventListener('click', (event) => {
    if (event.target.classList.contains('edit-button')) {
        let item = event.target.closest('.item');
        let activityNameElement = item.querySelector('.activity-name');
        let dueDateElement = item.querySelector('.due-time');
        let editNameInput = item.querySelector('.edit-name-input');
        let editDateInput = item.querySelector('.edit-date-input');
        let nonEditSection = item.querySelector('.non-edit-section');
        let editItemSection = item.querySelector('.edit-item-section');

        removeActivity(activityNameElement.textContent);

        editNameInput.value = activityNameElement.innerText;
        editDateInput.value = dueDateElement.innerText;
        nonEditSection.classList.add("hide");
        editItemSection.classList.remove("hide");

    } else if (event.target.classList.contains('edit-done-button')) {
        let item = event.target.closest('.item');
        let activityNameElement = item.querySelector('.activity-name');
        let dueDateElement = item.querySelector('.due-time');
        let nonEditSection = item.querySelector('.non-edit-section');
        let editItemSection = item.querySelector('.edit-item-section');
        let editNameInput = item.querySelector('.edit-name-input');
        let editDateInput = item.querySelector('.edit-date-input');
        let newName = editNameInput.value;
        let newDate = editDateInput.value;
        
        if (arrayOfActivityNames.some(activity => activity.name === newName)) {
            errorSection.classList.remove("hide");
            errorSection.innerText = "This activity already exists";
        } else {
            activityNameElement.innerText = newName;
            dueDateElement.innerText = newDate;
            let checkbox = nonEditSection.querySelector('.task-checkbox');
            arrayOfActivityNames.push({
                name: newName,
                date: newDate,
                checked: checkbox.checked ? true : false
            });
            localStorage.setItem("activityNames", JSON.stringify(arrayOfActivityNames));
            nonEditSection.classList.remove("hide");
            editItemSection.classList.add("hide");
            errorSection.classList.add("hide");
            localStorage.setItem("items", itemsContainer.innerHTML);
        }
    } else if (event.target.classList.contains('delete-button')) {
        let item = event.target.closest('.item');
        let activityNameElement = item.querySelector('.activity-name');
        removeActivity(activityNameElement.textContent)
        if(arrayOfActivityNames.length === 0) {
            clearTasksBtn.classList.add("hide");
            clearCompletedBtn.classList.add("hide");
            filterSection.innerHTML = "";
        }
        item.remove();
        localStorage.setItem("items", itemsContainer.innerHTML);
    } else if(event.target.classList.contains('task-checkbox')) {
        let checkbox = event.target; 
        let item = event.target.closest('.item');
        let activityNameElement = item.querySelector('.activity-name');
        let name = activityNameElement.innerText;
        let task = arrayOfActivityNames.find(task => task.name === name);
        if(checkbox.checked) {
            task.checked = true;
            if(clearCompletedBtn.classList.contains("hide")) {
               clearCompletedBtn.classList.remove("hide"); 
            }
        } else {
            task.checked = false;
        }

        if(!arrayOfActivityNames.some(task => task.checked === true)) {
            clearCompletedBtn.classList.add("hide");
        }

        localStorage.setItem("activityNames", JSON.stringify(arrayOfActivityNames));
    }
});

filterSection.addEventListener('click', (event) => {

    let allTasksButton = filterSection.querySelector('.all-tasks');
    let completeTasksButton = filterSection.querySelector('.complete-tasks');
    let incompleteTasksButton = filterSection.querySelector('.incomplete-tasks');
    let searchItemInput = filterSection.querySelector('.search-item-input'); 
    
    let items = document.querySelectorAll('.item');
    
    if(event.target.classList.contains("all-tasks")) {
        searchItemInput.value = "";
        allTasksButton.classList.add("selected-filter");
        completeTasksButton.classList.remove("selected-filter");
        incompleteTasksButton.classList.remove("selected-filter");
        items.forEach((item) => {
            let checkbox = item.querySelector('.task-checkbox');
            checkbox.disabled = false; 
            item.classList.remove("hide");
        });
    } else if(event.target.classList.contains("complete-tasks")) {
        searchItemInput.value = "";
        allTasksButton.classList.remove("selected-filter");
        completeTasksButton.classList.add("selected-filter");
        incompleteTasksButton.classList.remove("selected-filter");
        items.forEach((item) => {
            let checkbox = item.querySelector('.task-checkbox');
            checkbox.disabled = true;
            if (!checkbox.checked) {
                item.classList.add("hide");
            } else {
                item.classList.remove("hide");
            }
        });
    } else if(event.target.classList.contains("incomplete-tasks")) {
        searchItemInput.value = "";
        allTasksButton.classList.remove("selected-filter");
        completeTasksButton.classList.remove("selected-filter");
        incompleteTasksButton.classList.add("selected-filter");
        items.forEach((item) => {
            let checkbox = item.querySelector('.task-checkbox');
            checkbox.disabled = true;
            if (checkbox.checked) {
                item.classList.add("hide");
            } else {
                item.classList.remove("hide");
            }
        })
    }
});

filterSection.addEventListener('input', (event) => {
    if(event.target.classList.contains("search-item-input")) {
        let searchItemInputValue = event.target.value;
        let items = itemsContainer.querySelectorAll('.item');
        items.forEach((item) => {
            let activityName = item.querySelector('.activity-name').innerText;
            if(activityName.includes(searchItemInputValue) || searchItemInputValue === "") {
                item.classList.remove("hide");
            } else {
                item.classList.add("hide");
            }
        });
    }
});

clearTasksBtn.addEventListener('click', () => {
    arrayOfActivityNames = [];
    itemsContainer.innerHTML = "";
    filterSection.innerHTML = "";
    clearCompletedBtn.classList.add("hide");
    localStorage.clear();
    clearTasksBtn.classList.add("hide");
});

clearCompletedBtn.addEventListener('click', () => {
    let items = itemsContainer.querySelectorAll('.item');
    items.forEach((item) => { 
        let checkbox = item.querySelector('.task-checkbox');
        let activityName = item.querySelector('.activity-name').innerText;
        if(checkbox.checked) {
            item.remove();
            removeActivity(activityName);
        }
    });

    if(arrayOfActivityNames.length === 0) {
        clearTasksBtn.classList.add("hide");
        filterSection.innerHTML = "";
    }

    clearCompletedBtn.classList.add("hide");
    localStorage.setItem("items", itemsContainer.innerHTML);
    localStorage.setItem("activityNames", JSON.stringify(arrayOfActivityNames));
});

function removeActivity(name) {
    const index = arrayOfActivityNames.findIndex(activity => activity.name === name);
    if (index > -1) {
        arrayOfActivityNames.splice(index, 1);
        localStorage.setItem("activityNames", JSON.stringify(arrayOfActivityNames));
    }
}

function formatTime(dueTime) {
    let date = new Date(dueTime);
    
    let year = date.getFullYear();
    let month = String(date.getMonth() + 1).padStart(2, '0');
    let day = String(date.getDate()).padStart(2, '0');
    let hours = String(date.getHours()).padStart(2, '0');
    let minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}`;
}