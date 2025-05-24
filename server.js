const WebSocket = require('ws');
const http = require('http');
const express = require('express');
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Хранилище сообщений
let messages = [];

wss.on('connection', (ws) => {
    // Отправляем историю сообщений новому клиенту
    ws.send(JSON.stringify({ type: 'history', messages }));

    ws.on('message', (message) => {
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
    });
});

// Статические файлы
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 