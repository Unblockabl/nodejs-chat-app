const socket = io()

// Elements

const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $messages = document.querySelector('#messages')

// Templates

const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#locationmessage-template').innerHTML

// Options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

socket.on('locationMessage', (message) => {
    console.log(`${message}`)
    const html = Mustache.render(locationMessageTemplate, {
        message: message.text,
        fullurl: message.fullurl,
        url: message.url,
        timeStamp:moment(message.timeStamp).format('h:mm a ')
    })
    $messages.insertAdjacentHTML('beforeend', html)
})


socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        UserName: message.username,
        message : message.text,
        timeStamp : moment(message.timeStamp).format('h:mm a ')
    })
    $messages.insertAdjacentHTML('beforeend', html)
})


$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    $messageFormButton.setAttribute('disabled', 'disabled')

    const message = $messageFormInput.value

    socket.emit('sendMessage', message, () => {

        $messageFormInput.value = ''
        $messageFormButton.removeAttribute('disabled')       
        $messageFormInput.focus() 

        console.log('The message was delivered!')
    })

})

document.querySelector('#share-location').addEventListener('click', () => {
    if(!navigator.geolocation){
        return alert('Browser geolaction is not supperted on you browser.')
    }

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            console.log("Location shared!")
        })
    })
})

socket.emit('join', {username, room}, (error) => {
    if (error) {
        alert(error)
        location.href = "./index.html"
    }
})