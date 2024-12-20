const http = require('http');
const express = require('express')
const app = express()
const server = http.createServer(app);
const process = require('process');
const { oAuth2Client, getUserInfo } = require('./utils/auhtorization')
const parser = require('body-parser')
const cors = require('cors')
const { eventCreation, deleteDev } = require('./utils/calendarManipulation')
const axios = require('axios')
const url = require('url')
const { createClient } = require('redis')
const { EventEmitter } = require('events');

const { WebSocketServer } = require('ws');
const wss = new WebSocketServer({ server });
const wsEvents = new EventEmitter();
require('dotenv').config()
const client = createClient({
    password: 'PgISwEXztGkY4X7E65LI2g9eTa4NEDsj',
    socket: {
        host: 'redis-16228.c328.europe-west3-1.gce.redns.redis-cloud.com',
        port: 16228
    }
});
// wss.on('connection', (socket) => {
//     console.log('WebSocket connection established');

//     socket.on('message', (message) => {
//         console.log('Received:', message.toString('utf8'));
//         socket.send(`Server: You said "${message.toString()}"`);
//     });

//     socket.on('close', () => {
//         console.log('WebSocket connection closed');
//     });
// });

const date = new Date()

const currentDateSlice = date.toISOString().slice(0, 10)
var corsOptions = {
    origin: 'chrome-extension://akiojlmkfjmajfnmjllbcnjhnolgalnm',
    optionsSuccessStatus: 200
}
function sendcookies(req, res) {
    console.log('send cookies')
  
    wsEvents.on('conneciton', (socket) => {
        console.log('connection established')
    })
    wsEvents.on('message', (socket, message) => {
        const decodedCookie = message.toString('utf8')
        console.log('cookie:', JSON.parse(decodedCookie).value);
        cookie = `permissions=${JSON.parse(decodedCookie).value}`
        //socket.send(JSON.stringify(tokens))
    })

}

app.use(parser.json());
app.use(parser.urlencoded({ extended: true }));



app.get('/', async (req, res) => {
    res.send('Add Shifts')
})
app.get('/authy', async (req, res) => {


    const authString = await oAuth2Client.generateAuthUrl({
        //access_type: 'offline',
        scope: process.env.SCOPES,
        //prompt: 'consent'
    });

    res.redirect(authString)
})



app.get('/oauth2callback', async (req, res) => {
    const parsedUrl = url.parse(req.url, true)
    const code = parsedUrl.query.code
    let { tokens } = await oAuth2Client.getToken(code)

    // const userinfo = await getUserInfo(tokens)
    // console.log('userinfo: ', userinfo)
    // console.log('token info: ', tokenInfo)
    //
    console.log('req.header: ', req.headers)
    fetch('https://restel.work.relexsolutions.com/employees/api/user')
        .then(d => console.log('data in callback: ', d))

    await oAuth2Client.setCredentials(tokens);
    let cookie = 'permissions=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiRmVkb3JvdiBBbnRvbiIsImVtYWlsIjoiQW50b24uRmVkb3JvdkByZXN0ZWwuZmkiLCJ1c2VySWQiOiI1cm94clppdUd5T1NSMjNsdnltT3U4T0FYempCYU9uWk1JWUhPNTBwS2owPSIsImlzQWRtaW4iOnsidmFsdWUiOmZhbHNlfSwiaXNQbGFubmVyIjp7InZhbHVlIjp0cnVlLCJhbGxvd2VkUGxhbm5pbmdVbml0cyI6eyJ0eXBlIjoid2hpdGVsaXN0IiwicGxhbm5pbmdVbml0cyI6WzEzMjBdLCJwbGFubmluZ1VuaXRHcm91cHMiOltdfX0sImlzRW1wbG95ZWUiOnsidmFsdWUiOnRydWUsImNhbkFjdGl2YXRlVEFQYWRzIjpmYWxzZSwiZW1wbG95ZWVJZHMiOls1NDgzXX0sImlzUGF5cm9sbEFkbWluIjp7InZhbHVlIjpmYWxzZX0sInJlc3RlbFVzZXJHcm91cHMiOlsiUmVsZXgtUmVzdGVsLVVuaXQtTWFuYWdlciJdLCJpYXQiOjE3MzE4NDY4OTksImV4cCI6MTczMTkzMzI5OX0.Mo3Q3BhmPIYvqtzF1q3j8t5wGBhQPGcs7KNkWJ6-9h0'

    // wss.on('connection', (ws) => {
    //     ws.on('message', (message) => {
    //         const decodedCookie = message.toString('utf8')
    //         console.log('cookie:', JSON.parse(decodedCookie).value);
    //         cookie = `permissions=${JSON.parse(decodedCookie).value}`
    //     });
    //     ws.send(JSON.stringify(tokens))
    //     ws.on('close', () => {
    //         console.log('WebSocket connection closed');

    //     });

    // })

    // const userInfo = await getUserInfo(cookie);
    // const userInfoRedis = {
    //     relexId: userInfo,
    //     refresh_token: 'token'
    // }
    // await client.connect();
    // await client.set('user_refresh_token', JSON.stringify(userInfoRedis))

    res.redirect('/wayout');


})

app.use('/wayout', async (req, res) => {
   // console.log('req in callback: ', req.headers)
    //sendcookies(req, res);
    if (req.headers.upgrade && req.headers.upgrade.toLowerCase() === 'websocket') {
        // If the request is for WebSocket, handle it in a custom way
        console.log('connection upgraded')
        ''
    } else {
        // Otherwise, continue with regular HTTP handling
        res.send(`
            <html>
            <body>
                <p>Shifts will be added soon<p>
            </body>
                <script>
                    setTimeout(() => {
                        window.close()
                    }, 3000)
                </script>
            </html>
        `)
    }
})





app.use('/shifts', cors(corsOptions), async (req, res, next) => {
    console.log('date: ', date)
    console.log('cookie in req.body: ', req.body)
    let shiftsToExt;
    const cookie = req.body.cookie
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
    console.log('req.body in second shifts: ', req.body)
    try {
        const updateCalendar = await eventCreation(req.shifts)
        console.log('update calendar: ', updateCalendar)
        res.status(200).json({ message: 'Shifts added succesfully' })

    } catch (err) {
        console.log('Error upon adding shifts: ', err)
        res.status(500).json({ error: err })
    }

})

app.use('/delete', async (req, res) => {
    const deletereturn = await deleteDev()

    res.send(deletereturn)

})




server.listen(process.env.PORT, () => {
    console.log('Server is running on port ', process.env.PORT)
    //console.log(`WebSocket endpoint at ws://localhost:${process.env.PORT}/oauth2callback`);
})