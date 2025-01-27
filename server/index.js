const http = require('http');
const express = require('express')
const app = express()
const server = http.createServer(app);
const process = require('process');
const { oAuth2Client } = require('./utils/auhtorization')
const parser = require('body-parser')
const cors = require('cors')
const { eventCreation } = require('./utils/calendarManipulation')
const axios = require('axios')
const url = require('url')

require('dotenv').config()
let userCookie;


const date = new Date()

const currentDateSlice = date.toISOString().slice(0, 10)
var corsOptions = {
    origin: ['chrome-extension://aodkiilbadeiogfahcjhebiicegfeddc', 'http://localhost:3000'],
    optionsSuccessStatus: 200,
    methods: 'GET,POST,PUT,DELETE',
}

app.use(cors(corsOptions))
app.use(parser.json());
app.use(parser.urlencoded({ extended: true }));


app.get('/', async (req, res) => {
    res.send('Add Shifts')
})
app.post('/authy',cors(corsOptions), async (req, res) => {
   
    const authString = await oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: process.env.SCOPES,
        prompt: 'consent'
    });
    console.log('userInfo in authy: ', req.body)
    console.log('authString: ', authString)
    userCookie = req.body.permissionCookieValue
     res.json({authString: authString})
})



app.get('/oauth2callback', async (req, res) => {
    const parsedUrl = url.parse(req.url, true)
    console.log('query: ', parsedUrl.query)
    const code = parsedUrl.query.code
    
    console.log('code: ', code)
    
    try {
        const { tokens } = await oAuth2Client.getToken(code);
        oAuth2Client.setCredentials(tokens);
        console.log('Authentication successful:', tokens);
        res.redirect('/shifts')
    } catch (error) {
        console.error('Error during authentication:', error.message);
        return false; 
    }
       
})

app.use('/shifts', cors(corsOptions), async (req, res, next) => {
    console.log('date: ', date)
    console.log('cookie in req.body: ', req.body)
    const cookie = userCookie
    const yearAhead = new Date(date.setFullYear(date.getFullYear() + 1)).toISOString().slice(0, 10)
    const cookieString = 'permissions=' + cookie


    if (cookie) {
        try {
            const request = await axios.get(`https://restel.work.relexsolutions.com/employees/api/shifts?from=${currentDateSlice}&to=${yearAhead}`,
                {
                    headers: {
                        Cookie: cookieString,
                    },
                })
            shiftsToExt = request.data
            const shifts = request.data
            req.shifts = shifts
        } catch (err) {
            res.status(404).end()
            console.log(err)
        }
    }
    next()
})

app.use('/shifts', async (req, res) => {
    try {
        const updateCalendar = await eventCreation(req.shifts)
        console.log('update calendar: ', updateCalendar)
        res.status(200).json({ message: 'Shifts added succesfully' })

    } catch (err) {
        res.status(500).json({ error: err })
    }

})


server.listen(process.env.PORT, () => {
    console.log('Server is running on port ', process.env.PORT || 3000)
})