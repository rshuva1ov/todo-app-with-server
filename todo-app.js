(function () {
  // создаем и возвращаем заголовок приложения
  function createAppTitle(title) {
    let appTitle = document.createElement("h2");
    appTitle.innerHTML = title;
    return appTitle;
  }

  // создаем и возаращаем форму для создания дела
  function createTodoItemForm() {
    let form = document.createElement("form");
    let input = document.createElement("input");
    let buttonWrapper = document.createElement("div");
    let button = document.createElement("button");

    form.classList.add("input-group", "mb-3");
    input.classList.add("form-control");
    input.placeholder = "Введите название нового раздела";
    buttonWrapper.classList.add("input-group-append");
    button.classList.add("btn", "btn-primary");
    button.textContent = "Добавить дело";

    buttonWrapper.append(button);
    form.append(input);
    form.append(buttonWrapper);

    return {
      form,
      input,
      button,
    };
  }

  // создаем и возвращаем список элементов
  function createTodoList() {
    let list = document.createElement("ul");
    list.classList.add("list-group");
    return list;
  }

  // создаем и возвращаем элемент списка
  function createTodoItemElement(todoItem, { onDone, onDelete }) {
    const doneClass = "list-group-item-success";

    const item = document.createElement("li");
    // кнопки помещаем в элемент, который красиво покажет их в одной группе
    const buttonGroup = document.createElement("div");
    const doneButton = document.createElement("button");
    const deleteButton = document.createElement("button");

    // устанавливаем стили для элемента списка, а также для размещения кнопок
    // в его правой части с помощью flex
    item.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center");
    if (todoItem.done) {
      item.classList.toggle(doneClass);
    }
    item.textContent = todoItem.name;

    buttonGroup.classList.add("btn-group", "btn-group-sm");
    doneButton.classList.add("btn", "btn-success");
    doneButton.textContent = "Готово";
    deleteButton.classList.add("btn", "btn-danger");
    deleteButton.textContent = "Удалить";

    // добавляем обработчики на кнопки
    doneButton.addEventListener("click", function () {
      onDone({ todoItem, element: item });
      item.classList.toggle(doneClass, todoItem.done);
    });

    deleteButton.addEventListener("click", function () {
      onDelete({ todoItem, element: item });
    });

    // вкладываем кнопки в отдельный элемент, чтобы они объединились в один блок
    buttonGroup.append(doneButton);
    buttonGroup.append(deleteButton);
    item.append(buttonGroup);
    return item;
  }

  // функция создания дела
  async function createTodoApp(container, title, owner) {
    const todoAppTitle = createAppTitle(title);
    const todoItemForm = createTodoItemForm();
    const todoList = createTodoList();
    const handlers = {
      onDone({ todoItem }) {
        todoItem.done = !todoItem.done;
        fetch(`http://localhost:3000/api/todos/${todoItem.id}`, {
          method: "PATCH",
          body: JSON.stringify({ done: todoItem.done }),
          headers: {
            "Content-Type": "application/json",
          },
        });
      },
      onDelete({ todoItem, element }) {
        if (!confirm("Вы уверены?")) {
          return;
        }
        element.remove();
        fetch(`http://localhost:3000/api/todos/${todoItem.id}`, {
          method: "DElETE",
        });
      },
    };

    container.append(todoAppTitle);
    container.append(todoItemForm.form);
    container.append(todoList);

    // отправляем запрос на список всех дел
    const responce = await fetch(`http://localhost:3000/api/todos?owner=${owner}`);
    const todoItemList = await responce.json();

    todoItemList.forEach((todoItem) => {
      const todoItemElement = createTodoItemElement(todoItem, handlers);
      todoList.append(todoItemElement);
    });

    // браузер создает событие submit на форме по нажатию на Enter или на кнопку создания дела
    todoItemForm.form.addEventListener("submit", async (event) => {
      // эта строчка необходимаЮ чтобы предотвратить стандартное действие браузера
      // в данном случае мы не хотим, чтобы страница презагружалась при отправке формы
      event.preventDefault();

      // игнорируем создание элемента, если пользователь ничего не ввел в поле
      if (!todoItemForm.input.value) {
        return;
      }

      const responce = await fetch("http://localhost:3000/api/todos", {
        method: "POST",
        body: JSON.stringify({
          name: todoItemForm.input.value,
          owner,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const todoItem = await responce.json();

      let todoItemElement = createTodoItemElement(todoItem, handlers);
      // создаем и добавляем в список новое дело с нахванием из поля для ввода
      todoList.append(todoItemElement);

      // обнуляем значение в поле, чтобы не пришлось стирать его вручную
      todoItemForm.input.value = "";
    });
  }
  window.createTodoApp = createTodoApp;
})();
