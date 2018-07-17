const express = require('express');
const app = express();
// 加入這兩行
const server = require('http').Server(app);
const io = require('socket.io')(server);
const records = require('./records.js'); // 新增這行

// 加入線上人數計數
let onlineCount = 0;

// 修改這一部分
app.get('/', (req, res) => {
    res.sendFile( __dirname + '/views/index.html');
});

// 修改 connection 事件
io.on('connection', (socket) => {
    // 有連線發生時增加人數
    onlineCount++;
    // 發送人數給網頁
    io.emit("online", onlineCount);
    socket.emit("maxRecord", records.getMax());   // 新增記錄最大值，用來讓前端網頁知道要放多少筆
    socket.emit("chatRecord", records.get());     // 新增發送紀錄
 
    // socket.on("greet", () => {
    //     socket.emit("greet", onlineCount);
    // });

    socket.on("send", (msg) => {
        // 如果 msg 內容鍵值小於 2 等於是訊息傳送不完全
        // 因此我們直接 return ，終止函式執行。
        if (Object.keys(msg).length < 2) return;
        records.push(msg);
        //io.emit("msg", msg); // 這行刪除改由 Records 事件接手
    });
 
    socket.on('disconnect', () => {
        // 有人離線了，扣人
        onlineCount = (onlineCount < 0) ? 0 : onlineCount-=1;
        io.emit("online", onlineCount);
    });

});

// 新增 Records 的事件監聽器
records.on("new_message", (msg) => {
    // 廣播訊息到聊天室
    io.emit("msg", msg);
});

// 注意，這邊的 server 原本是 app
server.listen(3000, () => {
    console.log("Server Started. http://localhost:3000");
});
