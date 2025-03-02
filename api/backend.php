<?php
header('Content-Type: application/json');
$data = json_decode(file_get_contents('php://input'), true);
$file = $_SERVER["DOCUMENT_ROOT"].'/data/tasks.json';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Сохраняем данные (обновленные задачи) в файл
    file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT));
    echo json_encode(["status" => "success"]);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (file_exists($file)) {
        echo file_get_contents($file);  // Читаем данные из файла
    } else {
        echo json_encode([]);  // Если файла нет, возвращаем пустой массив
    }
}
?>
