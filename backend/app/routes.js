const fs = require('fs')
const admin = require('firebase-admin')
const config = require('../firebase.json')

// set up firebase admin connection
admin.initializeApp({
  credential: admin.credential.cert(config),
  databaseURL: 'https://ruhacksapp.firebaseio.com',
})

const passportConfigFile = './passportConfig.json'
let passportLock = ''

function createPassport (uid) {
  const userAppRef = `userApplications/${uid}`
  const userPassportRef = `passport/${uid}`

  return new Promise((resolve, reject) => {
    admin.database().ref(userAppRef).once('value')
      .then((snapshot) => {
        if (snapshot.val()) {
          const userApp = snapshot.val()
          const userPassport = {
            name: `${userApp.name.first} ${userApp.name.last}`,
            state: {
              registered: false,
            },
          }

          admin.database().ref(userPassportRef).set(userPassport)
            .then(() => resolve(userPassport))
            .catch((error) => reject(error))
        }
      })
      .catch((error) => reject(error))
  })
}

function getPassport (uid) {
  const ref = `passport/${uid}`

  return new Promise((resolve, reject) => {
    admin.database().ref(ref).once('value')
      .then((snapshot) => {
        if (snapshot.val()) {
          resolve(snapshot.val())
        } else {
          createPassport(uid)
            .then((passport) => resolve(passport))
            .catch((error) => {
              process.stderr.write(`${error}\n`)
              resolve({})
            })
        }
      })
      .catch((error) => {
        process.stderr.write(`${error}\n`)
        resolve({})
      })
  })
}

function updatePassport (uid, updates) {
  const ref = `passport/${uid}/state`

  return new Promise((resolve, reject) => {
    admin.database().ref(ref).set(updates)
      .then(() => resolve(true))
      .catch((error) => {
        process.stderr.write(`${error}\n`)
        resolve(false)
      })
  })
}

module.exports = function (app) {
  // route set up
  // app.set('views', './public/views');
  // app.set('view engine', 'pug');

  app.get('/api/passport/:id', (req, res) => {
    if (req.params.id && req.params.id !== '') {
      const uid = req.params.id

      getPassport(uid)
        .then((passport) => res.status(200).send(passport))
        .catch((error) => {
          process.stderr.write(`${error}\n`)
          res.status(500).send({})
        })
    } else {
      res.status(400).send({})
    }
  })

  app.post('/api/passport/:id', (req, res) => {
    if (req.params.id && req.params.id !== '' && req.body) {
      const uid = req.params.id
      const updates = req.body

      console.log(updates)

      updatePassport(uid, updates)
        .then((operationResult) => res.status(200).send(operationResult))
        .catch((error) => {
          process.stderr.write(`${error}\n`)
          res.status(500)
        })
    } else {
      res.status(400)
    }
  })

  app.get('/api/config/passport', (req, res) => {
    if (fs.existsSync(passportConfigFile)) {
      const fileContents = fs.readFileSync(passportConfigFile)

      try {
        const jsonData = JSON.parse(fileContents)

        res.status(200).send(jsonData)
      } catch (error) {
        process.stderr.write(`${error}\n`)
        res.status(200).send({})
      }
    } else {
      res.status(200).send({})
    }
  })

  app.post('/api/config/passport', (req, res) => {
    if (req.body) {
      const { lock, data } = req.body

      if (passportLock === '') {
        passportLock = fs.mkdtempSync('lock')

        if (data) {
          fs.writeFileSync(passportConfigFile, JSON.stringify(data))

          if (fs.existsSync(`./${passportLock}`)) {
            // remove lock
            fs.rmdirSync(`./${passportLock}`)
            passportLock = ''
          }

          res.status(200).send(true)
        } else {
          res.status(400).send('Config being edited and locked by another user.')
        }
      }
    }
  })
}
