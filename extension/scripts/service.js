
const url = "https://restel.work.relexsolutions.com";
const cookieName = "permissions";
const ws = new WebSocket('ws://localhost:3000')

chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {

    console.log('request in message listener: ', req)
    ws.addEventListener('open', (event) => {
        console.log('WebSocket is opened')
        //ws.send(JSON.stringify(cookie))
    })
    getCookie(url, cookieName);

    function errorHandler(mes) {
        console.log('erroHAndker: ', mes)
        sendResponse({ message: mes })
    }
    

    function getCookie (address, cookies) {

        chrome.cookies.get(
            { url: address, name: cookies },
            function (cookie) {
            if(cookie === null) {
                console.log('not logged in');
                errorHandler('Not logged in into Relex Account');
            } else {
                console.log('cookie in get cookie: ', cookie)
                authenticate(cookie);
            }
        }
        )
    };

    async function authenticate(cookie) {
       
        authorize(cookie);
        
    }

    function authorize (cookie) {
        console.log('cookie: ', cookie)
        chrome.windows.create({
            url: "http://localhost:3000/authy",
            type: 'popup'
        }
        )
        ws.addEventListener('open', (event) => {
            console.log('WebSocket is opened')
            ws.send(JSON.stringify(cookie))
        })
        // ws.addEventListener('message', () => {
        //     console.log('I am sending the cookie')
        //     ws.send(JSON.stringify(cookie));
        // });
       
        
       
        ws.addEventListener('message', async (event) => {
            console.log('get token in websocket: ', JSON.parse(event.data))
            if(JSON.parse(event.data)){
                await sendCookie(cookie);
            } else {
                errorHandler('Not authorized in google')
            }
            
            
            
        });
        //ws.close()

    };

    async function sendCookie(cookie) {

        console.log('cookie string: ', cookie)

        try {
            const jsonBody = { "cookie": cookie.value }
            console.log('jsonBody: ', JSON.stringify(jsonBody))
            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(jsonBody)
            };
            const req = await fetch("http://localhost:3000/shifts", options)
            errorHandler(req.status)

        } catch (err) {
            console.log('err: ', err.message)
            errorHandler('You are probably not logged into your Relex account. Please, log in first')

        }

    }

    return true

});


