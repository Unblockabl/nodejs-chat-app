const generateMessage = (username, text) => {
    return {
        username,
        text,
        timeStamp: new Date().getTime()
    }
}

const generateLocationMessage = (text, fullurl, url) => {
    return {
        text,
        fullurl,
        url,
        timeStamp: new Date().getTime()
    }
}


module.exports = {
    generateMessage,
    generateLocationMessage
}