export const event = 'chat'

const parseClassic = (message) => {
  if (typeof message === 'object') return message
  const messageList = []
  let text = ''
  let nextChanged = false
  let color = 'white'
  let bold = false
  let italic = false
  let underlined = false
  let strikethrough = false
  let random = false
  const colors = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'k', 'l', 'm', 'n', 'o', 'r', '&']
  const convertColor = ['black', 'dark_blue', 'dark_green', 'dark_cyan', 'dark_red', 'dark_purple', 'gold',
    'gray', 'dark_gray', 'blue', 'green', 'aqua', 'red', 'light_purple', 'yellow', 'white',
    'random', 'bold', 'strikethrough', 'underlined', 'italic', 'reset', '&'
  ]

  function createJSON () {
    if (!text.trim()) return
    messageList.push({
      text: text,
      color: color,
      bold: bold,
      italic: italic,
      underlined: underlined,
      strikethrough: strikethrough,
      obfuscated: random
    })
    text = ''
  }

  while (message !== '') {
    const currChar = message[0]
    if (nextChanged) {
      const newColor = convertColor[colors.indexOf(currChar)]
      if (newColor) {
        if (newColor === 'bold') bold = true
        else if (newColor === 'strikethrough') strikethrough = true
        else if (newColor === 'underlined') underlined = true
        else if (newColor === 'italic') italic = true
        else if (newColor === 'random') random = true
        else if (newColor === '&') text += '&'
        else if (newColor === 'reset') {
          strikethrough = false
          bold = false
          underlined = false
          random = false
          italic = false
          color = 'white'
        } else color = newColor
      }
      nextChanged = false
    } else if (currChar === '&') {
      if (nextChanged) {
        text += '&'
        nextChanged = false
      } else {
        nextChanged = true
        createJSON()
      }
    } else {
      text += currChar
    }

    message = message.slice(1, message.length)
  }
  createJSON()

  if (messageList.length > 0) {
    return {
      text: '',
      extra: messageList
    }
  } else {
    return {
      text: ''
    }
  }
}

export const handle = (event, data, metadata, client, clientIndex, server) => {
  if (data.message.substr(0, 1) === '/') {
    server.handleCommand(data.message.substr(1), client, clientIndex)
  } else {
    const message = parseClassic(data.message)
    message.text = `<${client.username}> ` + message.text
    server.writeAll('chat', {
      message: JSON.stringify(message),
      position: 0
    })
  }
}
