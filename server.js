const WebSocket = require('ws');
const http = require('http');
const express = require('express');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Хранилище сообщений
let messages = [];

// Middleware для логирования
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Обработка WebSocket соединений
wss.on('connection', (ws) => {
    console.log('New client connected');
    
    // Отправляем историю сообщений новому клиенту
    ws.send(JSON.stringify({ type: 'history', messages }));

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            
            // Добавляем время к сообщению
            const messageWithTime = {
                ...data,
                time: new Date().toISOString()
            };
            
            // Сохраняем сообщение
            messages.push(messageWithTime);
            
            // Ограничиваем количество сообщений
            if (messages.length > 50) {
                messages = messages.slice(-50);
            }
            
            // Отправляем сообщение всем клиентам
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ type: 'message', message: messageWithTime }));
                }
            });
        } catch (error) {
            console.error('Error processing message:', error);
        }
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

// Статические файлы
app.use(express.static(path.join(__dirname, 'public')));

// Обработка ошибок
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Open http://localhost:${PORT} in your browser`);
}); 
