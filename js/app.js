const documentRoot = `${window.location.protocol}//${window.location.host}/`;
//const apiPathPHP = documentRoot+'/api/backend.php'; //PHP API
const apiPath = documentRoot+"api/handler"; //NodeJs API

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register(documentRoot+'service-worker.js')
        .then(() => console.log('Service Worker зарегистрирован!'))
        .catch(err => console.log('Ошибка SW:', err));
}

let isSyncing = false; // Флаг для блокировки обновлений во время синхронизации

document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    setInterval(loadTasks, 5000); // Автообновление списка каждые 5 секунд
});

// Функция для добавления задач
function addTask() {
    const input = document.getElementById('taskInput');
    const tasksInput = input.value.trim(); // Получаем введенную строку
    if (tasksInput) {
        // Разделяем строку по запятой, убираем пробелы и фильтруем пустые строки
        const tasksArray = tasksInput.split(',').map(task => task.trim()).filter(task => task);

        // Загружаем текущие задачи из localStorage
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

        // Добавляем только уникальные задачи
        tasksArray.forEach(task => {
            if (!tasks.some(t => t.text === task)) { // Проверяем уникальность по тексту задачи
                tasks.push({ text: task, avatar: user_img }); // Добавляем задачу с аватаром
            }
        });

        // Сохраняем задачи в localStorage
        localStorage.setItem('tasks', JSON.stringify(tasks));

        // Синхронизация с сервером
        syncTasksWithServer(tasks)
            .then(() => {
                showNotification(`Добавлено: ${tasksArray.join(', ')}`); // Показ уведомления
                input.value = ''; // Очищаем поле ввода
                renderTasks(); // Перерисовываем список
            })
            .catch(() => {
                showNotification('Ошибка синхронизации с сервером. Попробуйте позже.');
            });
    }
}



// Функция для сохранения задачи
function saveTask(task) {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.push(task);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    syncTasksWithServer(tasks); // Синхронизация с сервером
}

// Функция для загрузки задач с сервера
function loadTasks() {
    if (isSyncing) return; // Не загружать задачи с сервера, если синхронизация активна

    fetch(apiPath)
        .then(response => response.json())
        .then(data => {
            localStorage.setItem('tasks', JSON.stringify(data));
            renderTasks();
            document.getElementById('offlineWarning').classList.add('hidden');
        })
        .catch(() => {
            renderTasks();
            document.getElementById('offlineWarning').classList.remove('hidden');
        });
}

// Отображение задач на экране
function renderTasks() {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.forEach((task, index) => {
        // Создаём элемент списка
        let li = document.createElement('li');
        li.className = "bg-gray-200 p-3 rounded-lg text-lg cursor-pointer hover:bg-gray-300 transition flex justify-between items-center";

        // Добавляем текст задачи
        let taskText = document.createElement('span');
        taskText.textContent = task.text;

        // Создаём аватар (иконку или изображение)
        let avatar = document.createElement('img');
        avatar.src = task.avatar || "../assets/nouser.png"; // Используем аватар из задачи или изображение по умолчанию
        avatar.alt = 'Avatar';
        avatar.className = "w-10 h-10 rounded-full ml-3"; // Класс для стилизации (хвостовая CSS)

        // Добавляем обработчик клика для удаления задачи
        li.onclick = () => removeTask(index, task.text);

        // Добавляем текст задачи и аватар в элемент списка
        li.appendChild(taskText);
        li.appendChild(avatar);

        // Добавляем элемент списка в список задач
        taskList.appendChild(li);
    });
}

// Удаление задачи и синхронизация с сервером
function removeTask(index, task) {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.splice(index, 1); // Удаляем задачу из локального хранилища
    localStorage.setItem('tasks', JSON.stringify(tasks)); // Обновляем локальное хранилище
    renderTasks(); // Перерисовываем список задач

    // Синхронизация с сервером
    isSyncing = true; // Блокируем обновления во время синхронизации
    syncTasksWithServer(tasks)
        .then(() => {
            isSyncing = false; // Снимаем блокировку после синхронизации
            showNotification(`Продукт удален: ${task}`);
        })
        .catch(() => {
            isSyncing = false; // Снимаем блокировку в случае ошибки
            showNotification('Ошибка синхронизации. Пожалуйста, попробуйте позже.');
        });
}

// Синхронизация задач с сервером
function syncTasksWithServer(tasks) {
    return fetch(apiPath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tasks)
    })
    .then(response => response.json())
    .then(() => {
        console.log('Задачи успешно синхронизированы с сервером');
        document.getElementById('offlineWarning').classList.add('hidden');
    })
    .catch(() => {
        document.getElementById('offlineWarning').classList.remove('hidden');
        throw new Error('Ошибка синхронизации с сервером');
    });
}

// Проверка соединения
function checkConnection() {
    if (navigator.onLine) {
        syncTasksWithServer(JSON.parse(localStorage.getItem('tasks')) || []);
    } else {
        //showNotification('Нет соединения. Пожалуйста, попробуйте снова позже.');
    }
}

// Функция для отображения уведомлений
function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.classList.remove('hidden');
    setTimeout(() => notification.classList.add('hidden'), 3000);
}

// Функция для корректной установки высоты списка задач
function setTaskListHeight() {
    const footerHeight = document.getElementById('taskFooter').offsetHeight;  // Получаем высоту футера
    const taskList = document.getElementById('taskList');
    taskList.style.maxHeight = `calc(100vh - ${footerHeight + 80}px)`;  // Устанавливаем max-height с учетом футера
}

// Вызываем функцию при загрузке страницы и при изменении размера окна
window.addEventListener('load', setTaskListHeight);
window.addEventListener('resize', setTaskListHeight);  // Обновляем при изменении размера экрана