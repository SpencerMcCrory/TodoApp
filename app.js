//initializing the Database
const dbManager = new IndexedDBManager("todoDB", "todos");
window.onload = async () => {
  //this makes all the current items in the database render off first load
  try {
    await dbManager.init();
    refreshTodoList();
  } catch (error) {
    console.error("IndexedDB initialization failed:", error);
  }
};

// Event Listener to Form Submission:
document.getElementById("todo-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const newTodoInput = document.getElementById("new-todo");
  const text = newTodoInput.value.trim();
  if (text) {
    addTodo(text);
    newTodoInput.value = "";
  }
});

//Function to Add Todo, I add the todo text along with completion status of false
async function addTodo(text) {
  try {
    await dbManager.add({ text, completed: false });
    refreshTodoList();
  } catch (error) {
    console.error("Failed to add todo:", error);
  }
}

//Function to Refresh Todo List
async function refreshTodoList() {
  try {
    const todos = await dbManager.getAll();
    renderTodos(todos);
  } catch (error) {
    console.error("Failed to refresh todo list:", error);
  }
}

//Function that renders all the elements and some event listeners for the elements (delete,edit/save)
function renderTodos(todos) {
  const listElement = document.getElementById("todo-list");
  listElement.innerHTML = ""; // Clear the list of any past renders

  //build the todo
  todos.forEach((todo) => {
    let todoID = todo.id;
    const li = document.createElement("li");

    const todoDiv = document.createElement("div"); //everything in the li will be within this div
    todoDiv.classList.add("todo-item"); // Add a class for styling

    const editContainer = document.createElement("div"); //this will contain the edit input textbox and needed to keep the textbox left
    editContainer.style.display = "none"; // Initially hidden, since edit has not been selected
    editContainer.classList.add("edit-container"); // Add a class for styling

    const editInput = document.createElement("input"); //creating the hidden edit input
    editInput.type = "text";
    editInput.value = todo.text;
    editInput.placeholder = "Please enter a todo.";
    editInput.classList.add("editInput");

    const todoText = document.createElement("span"); //creating the todo text inside the li
    todoText.textContent = todo.text;
    todoText.className = "todo-text";

    const editDeleteDiv = document.createElement("div"); //div that will contain the CRUD features (needed for positioning)
    editDeleteDiv.classList.add("buttonContainer");

    const deleteButton = document.createElement("button");
    deleteButton.className = "deleteButton";
    deleteButton.textContent = "Delete";

    //The event listener goes back to what the state of the scope was when the event listener was created
    deleteButton.addEventListener("click", () => {
      deleteTodo(todoID); // Pass the 'id' to the deleteTodo function
    });

    const editButton = document.createElement("button");
    editButton.className = "editButton";
    editButton.textContent = "Edit";

    // Event listener for the edit/save button
    // When the edit/save is selected it will perform an action based on if the current text of the button is save or edit
    editButton.addEventListener("click", () => {
      if (editButton.textContent === "Edit") {
        // Switch to edit mode
        editButton.textContent = "Save";
        todoText.style.display = "none";
        editContainer.style.display = "block"; // Show the edit container
      } else {
        // Save mode (Save button was clicked)
        let updatedText = editInput.value;
        todoText.textContent = updatedText;
        todoText.textContent.trim();

        //making sure user entered something
        if (todoText.textContent != "") {
          editInput.style.backgroundColor = "none";
          editButton.textContent = "Edit";
          todoText.style.display = "inline-block";
          // Update the text in indexeddb database
          updateTodoText(todoID, updatedText);
          refreshTodoList();
          editContainer.style.display = "none"; // Hide the edit container
        } else {
          editInput.style.backgroundColor = "pink"; // User didn't input any value, show pink to tell user there is a problem
        }
      }
    });

    const checkBox = document.createElement("input");
    checkBox.type = "checkbox";
    checkBox.className = "todo-checkbox";

    //this way everytime todo's are reloaded, they show they are complete or not
    if (todo.completed == true) {
      li.classList.add("complete");
      checkBox.checked = true;
    }

    // event listener for the complete checkbox, adds a complete class to the todo li if checked, otherwise removes it
    checkBox.addEventListener("change", () => {
      let stateOfCheckBox = checkBox.checked;
      if (stateOfCheckBox) {
        li.classList.add("complete");
        todoCompleted(todoID, true);
      } else {
        li.classList.remove("complete");
        todoCompleted(todoID, false);
      }
    });

    editContainer.appendChild(editInput);
    editDeleteDiv.appendChild(editButton);
    editDeleteDiv.appendChild(deleteButton);

    todoDiv.appendChild(checkBox);
    todoDiv.appendChild(todoText);
    todoDiv.appendChild(editContainer);
    todoDiv.appendChild(editDeleteDiv);

    li.appendChild(todoDiv);

    listElement.appendChild(li);
  });
}

// Function to update the todo text by pass ing the ID and updated text
async function updateTodoText(id, newText) {
  try {
    await dbManager.update(id, { text: newText });
  } catch (error) {
    console.error("Failed to update todo text:", error);
  }
}

//Function to delete the todo then refresh list
async function deleteTodo(id) {
  try {
    await dbManager.delete(id);
    refreshTodoList();
  } catch (error) {
    console.log(`error with deleting id: ${id}`);
  }
}
//updating the status of a todo to either completed or not *in the database*
async function todoCompleted(id, stateOfCheckBox) {
  if (stateOfCheckBox) {
    try {
      await dbManager.update(id, { completed: true });
    } catch (error) {
      console.error("Failed to update todo completed:", error);
    }
  } else {
    try {
      await dbManager.update(id, { completed: false });
    } catch (error) {
      console.error("Failed to update todo completed:", error);
    }
  }
}
