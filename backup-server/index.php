<?php

$storageDir = './storage';

if (!is_dir($storageDir)) {
    mkdir($storageDir, 0777, true);
}

if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_FILES['file'])) {
    $file = $_FILES['file'];
    $directory = $_POST['directory'] ?? '';

    $destinationDir = rtrim($storageDir, '/') . '/' . trim($directory, '/');
    if (!is_dir($destinationDir)) {
        mkdir($destinationDir, 0777, true);
    }

    $destinationPath = $destinationDir . '/' . basename($file['name']);

    if (move_uploaded_file($file['tmp_name'], $destinationPath)) {
        echo 'Upload realizado com sucesso.';
    } else {
        http_response_code(500);
        echo 'Erro ao mover o arquivo para o diretório de destino.';
    }
} else {
    http_response_code(400);
    echo 'Nenhum arquivo foi enviado.';
}
