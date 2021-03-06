const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
    console.log("[Server] WebSocket connection added")   

    socket.on('join', ({username, room}, callback) => {
        const { error, user } = addUser({ id: socket.id, username, room })
        
        if (error)
        {
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message', generateMessage('Admin', 'Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined!`))

        callback()
    })

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)
        const filter = new Filter()
        
        io.to(user.room).emit(user.username, 'message', generateMessage(user.username, filter.clean(message)))
        callback()
    })

    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(`User's location:`, ` https://googlemaps.com/?q=${coords.latitude},${coords.longitude}`, `${coords.latitude},${coords.longitude}`))
        callback()
    })

    socket.on('disconnect', () => {
        console.log("[Server] WebSocket connection removed")

        const user = removeUser(socket.id)
        
        if (user){
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left!`))
        }
        
        
        

    })

})



server.listen(port, () => {
    console.log(`Server is up on port ${port}`)
})