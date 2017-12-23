const hue = require('node-hue-api')
// const tmi = require('tmi.js')
const colors = require('./newColors.json')
const { HueApi, lightState } = hue
const CLIENT = require('./client.js')


const HOST = '192.168.1.2'
const USERNAME = 'XKjNUabyiVJcwPoZVoZR1hDBBEmROTiLBTufKsgm'
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
let interval;

CLIENT.connect().then((data) => {
  interval = setInterval(popQueue, 2000)
})
CLIENT.on('chat', (channel, user, message, self) => {
  if (self) return
  const split = message.split(' ')
  const command = split[0]
  const targetLight = split[1]
  const targetColor = split[2]
  if (command === '!lights' && targetLight === 'all' && (targetColor === 'on' || targetColor === 'off' || colors[targetColor])) {
    const state = colors[targetColor]
      ? lightState.create().on().rgb(colors[targetColor].r, colors[targetColor].g, colors[targetColor].b)
      : lightState.create()[targetColor]()
    return API.setLightState(1, state).then(() => {
      return API.setLightState(2, state).then(() => {
        return API.setLightState(3, state).then(() => {
          return API.setLightState(4, state).done()
        })
      })
    })
  }
  if (command === '!lights') {
    return QUEUE.push('I connected my lights to twitch chat. type !light [LIGHT_ID](1-4 or all) [COLOR or on or off](blue) to change the lights!. Ex: !light 1 blue')
  }
  if (command === '!light' && targetLight === 'all') {
    return QUEUE.push('To target all lights, use command !lights instead of !light.')
  }
  if (command === '!light') {
    if (isNaN(parseInt(targetLight))) {
      return QUEUE.push(`@${user.username} !light LIGHT_ID error. Correct syntax is: !light [LIGHT_ID (1-4)] [LIGHT_COLOR]`)
    }
    if (parseInt(targetLight) > 4 || parseInt(targetLight) < 1) {
      return QUEUE.push(`@${user.username} !light LIGHT_ID error. Must be between 1 and 4`)
    }
    if (targetColor === undefined) {
      return QUEUE.push(`@${user.username} !light LIGHT_COLOR error. Correct syntax is !light [LIGHT_ID] [LIGHT_COLOR]`)
    }
    if (targetColor === 'on' || targetColor === 'off') {
      const state = lightState.create()[targetColor]()
      return API.setLightState(targetLight, state).done()
    }
    if (!colors[targetColor]) {
      return QUEUE.push(`@${user.username} Invalid Color. Only HTML Colors supported.`)
    }

    const { r, g, b } = colors[targetColor]
    const state = lightState.create().on().rgb(r, g, b)
    API.setLightState(targetLight, state).done()
  }
  if (command === '!brightness' && targetLight === 'all' && !isNaN(parseInt(targetColor)) && parseInt(targetColor) > 0 && parseInt(targetColor) < 101) {
    const state = lightState.create().on().brightness(targetColor)
    return API.setLightState(1, state).then(() => {
      return API.setLightState(2, state).then(() => {
        return API.setLightState(3, state).then(() => {
          return API.setLightState(4, state).done()
        })
      })
    })
  }
  if (command === '!brightness') {
    if (isNaN(parseInt(targetLight))) {
      return QUEUE.push(`@${user.username} !brightness LIGHT_ID error. Correct syntax is: !brightness [LIGHT_ID (1-4)] [1-100]`)
    }
    if (parseInt(targetLight) > 4 || parseInt(targetLight) < 1) {
      return QUEUE.push(`@${user.username} !brightness LIGHT_ID error. Must be between 1 and 4`)
    }
    if (targetColor === undefined) {
      return QUEUE.push(`@${user.username} !brightness BRIGHTNESS error. Correct syntax is !brightness [LIGHT_ID] [BRIGHTNESS](1-100)`)
    }
    const state = lightState.create().on().brightness(targetColor)
    API.setLightState(targetLight, state).done()
  }
})
