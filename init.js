const hue = require("node-hue-api");
const { HOST, USERNAME } = require('./config.js')

const api = new hue.HueApi(HOST, USERNAME)

const displayBridgesResult = function(result) {
  console.log(`Found Bridges\n =================\n ${JSON.stringify(result, null, 2)}`)
  return Promise.resolve(result)
}

const displayResult = function(result) {
  console.log(result)
  console.log(JSON.stringify(result, null, 2))
}

const displayError = function(err) {
  console.log(err)
}

api.registeredUsers().then(displayResult).done();

// --------------------------
// Using a promise
hue.nupnpSearch().then(displayBridgesResult).then(res => {
  // console.log(res)
  if (!(Array.isArray(res) && res.length > 0)) {
    return console.log('No Hue bridges found :(')
  }
  const { ipaddress } = res[0]
  console.log(`Taking first bridge found: ipaddress: ${ipaddress}`)
  hue.registerUser(ipaddress, 'Lanzo\'s NodeJS Twitch Chat App')
    .then(displayResult)
    .fail(displayError)
    .then(() => {
      console.log('take new username and the ipaddress and put them in the config.js')
    })
});
