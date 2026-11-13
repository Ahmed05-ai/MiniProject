<?php
/**
 * Smart Campus Management System - PHP Database Bridge
 * Compatible with SQLite (smart_campus.sqlite) and MySQL (smart_campus)
 */

class CampusDB {
    private static ?PDO $pdo = null;

    public static function getConnection(): PDO {
        if (self::$pdo !== null) {
            return self::$pdo;
        }

        $sqlitePath = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'database' . DIRECTORY_SEPARATOR . 'smart_campus.sqlite';
        
        // 1. Try SQLite Database first
        if (file_exists($sqlitePath)) {
            try {
                self::$pdo = new PDO("sqlite:" . $sqlitePath);
                self::$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                self::$pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
                return self::$pdo;
            } catch (PDOException $e) {
                // Fallthrough to MySQL
            }
        }

        // 2. Fallback to MySQL if configured
        try {
            $host = '127.0.0.1';
            $dbname = 'smart_campus';
            $user = 'root';
            $pass = '';
            self::$pdo = new PDO("mysql:host={$host};dbname={$dbname};charset=utf8mb4", $user, $pass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
            ]);
            return self::$pdo;
        } catch (PDOException $e) {
            throw new Exception("Database connection failed: " . $e->getMessage());
        }
    }
}

