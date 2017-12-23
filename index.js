const hue = require('node-hue-api')
const colors = require('./newColors.json')
const { HueApi, lightState } = hue
const CLIENT = require('./client.js')
const { HOST, USERNAME } = require('./config.js')

const API = new HueApi(HOST, USERNAME)

const displayResult = result => {
  console.log(JSON.stringify(result, null, 2))
}

const QUEUE = []
const popQueue = () => {
  const message = QUEUE.shift()
  if (!!message) {
    CLIENT.say('#lanzo', message)
  }
}
let interval
const validCommands = [
  '!lights',
  '!light',
  '!brightness',
  '!lightsrandom',
  '!lightson',
  '!lightsoff'
]

const setLightState = (state) => {
  return API.setLightState(1, state).then(() => {
    return API.setLightState(2, state).then(() => {
      return API.setLightState(3, state).then(() => {
        return API.setLightState(4, state).done()
      })
    })
  })
}

CLIENT.connect().then((data) => {
  interval = setInterval(popQueue, 2000)
})
CLIENT.on('chat', (channel, user, message, self) => {
  if (self) return
  const split = message.split(' ')
  const command = split[0]
  const argument = split[1]
  const isValidCommand = validCommands.includes(command)
  if (!isValidCommand) {
    return
  }
  const isValidColor = !!colors[argument]
  const isValidBrightness = !isNaN(parseInt(argument)) && parseInt(argument) > 0 && parseInt(argument) < 101
  if ((command === '!lights' || command === '!light') && isValidColor) {
    // set the light state
    const { r, g, b } = colors[argument]
    const state = lightState.create().on().rgb(r, g, b)
    setLightState(state).then(() => {
      QUEUE.push(`@${user.username} Setting lights to ${argument}.`)
    })
  }
  if ((command === '!lights' || command === '!light') && argument === undefined) {
    QUEUE.push(`@${user.username} Command use is !light(s) COLOR. with the COLOR being a valid HTML color https://www.w3schools.com/colors/colors_names.asp.`)
  }
  if ((command === '!lights' || command === '!light') && argument !== undefined && !isValidColor) {
    QUEUE.push(`@${user.username} Your color (${argument}) is not valid. Check the list of valid HTML colors: https://www.w3schools.com/colors/colors_names.asp`)
  }
  if (command === '!brightness' && isValidBrightness) {
    // handle brightness
    const state = lightState.create().on().brightness(argument)
    setLightState(state).then(() => {
      QUEUE.push(`@${user.username} Setting brightness to ${argument}%.`)
    })
  }
  if(command === '!brightness' && !isValidBrightness) {
    QUEUE.push(`@${user.username} Your brightness is not valid. Choose a number between 1 and 100`)
  }
  if(command === '!lightsrandom' || command === '!lightrandom') {
    const r = 1 + Math.round(Math.random() * 254)
    const g = 1 + Math.round(Math.random() * 254)
    const b = 1 + Math.round(Math.random() * 254)
    const state = lightState.create().on().rgb(r, g, b)
    setLightState(state).then(() => {
      QUEUE.push(`@${user.username} Setting lights to a random color! Got: (${r}, ${g}, ${b})`)
    })
  }

  if(command === '!lightson') {
    const state = lightState.create().on()
    setLightState(state).then(() => {
      QUEUE.push(`@${user.username} Lights turned on!`)
    })
  }

  if(command === '!lightsoff') {
    const state = lightState.create().off()
    setLightState(state).then(() => {
      QUEUE.push(`@${user.username} Lights turned off!`)
    })
  }

})
