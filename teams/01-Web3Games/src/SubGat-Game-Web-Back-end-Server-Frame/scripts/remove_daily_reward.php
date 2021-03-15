<?php
$dbms = 'mysql';    
$host = 'localhost';
$dbName = 'user';   
$user = 'root';     
$pass = '';         
$dsn = "$dbms:host=$host;dbname=$dbName";

try {
    $db = new PDO($dsn, $user, $pass);
    $db->exec("DELETE FROM daily_reward where Date(created_at) = Date(NOW())");
} catch (PDOException $e) {
    die("Error: " . $e->getMessage());
}
