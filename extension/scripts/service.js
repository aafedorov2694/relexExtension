
const url = "https://restel.work.relexsolutions.com";
const cookieName = "permissions";
let cookie;
//const ws = new WebSocket('ws://localhost:3000')

chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {

    console.log('request in message listener: ', req)
    // ws.addEventListener('open', (event) => {
    //     console.log('WebSocket is opened')
    //     //ws.send(JSON.stringify(cookie))
    // })

    chrome.cookies.getAll({ url: req.url }, (cookies) => {
        console.log("Cookies retrieved:", cookies);
        const permissions = cookies.find(e => e.name = 'permissions')
        cookie = permissions
        authorize(cookie)
    });
    // if(req.type === 'getCookies') {
    //     return true
    // }
    //getCookie(url, cookieName);

    function errorHandler(mes) {
        console.log('erroHAndker: ', mes)
        sendResponse({ message: mes })
    }


    function authorize (cookie) {
        console.log('cookie: ', cookie)
        chrome.windows.create({
            url: "http://localhost:3000/authy",
            type: 'popup'
        }
        )
       

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


