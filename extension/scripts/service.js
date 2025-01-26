const url = "https://restel.work.relexsolutions.com/employees/home";
const cookieName = "permissions";
let cookie;


chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {

    console.log('request in message listener: ', req)
    
    
    const getUserInfo = async () => {
        const userId = await fetch('https://restel.work.relexsolutions.com/employees/api/user')
        const user = await userId.json()
        console.log('user: ', user)
        return user
 
    }

    function errorHandler(mes) {
        console.log('erroHAndker: ', mes)
        sendResponse({ message: mes })
    }


    async function authorize () {
        const userInfo = await getUserInfo();
        console.log('cookie: ', userInfo)
        let authLink
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(
                userInfo
            )
        };

        fetch('http://localhost:3000/authy', options)
            .then(resp => resp.json())
            .then(data => {
                console.log('fetched data: ', data)
                authLink = data.authString
                console.log('authLink: ', data.authString)
                chrome.windows.create({
                    url: data.authString,
                    type: 'popup'
                }
                )
                
            })
            .catch(err => console.error('Error: ', err))
               
        
       

    };

    authorize()

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
            const req = await fetch("http://localhost:3000/authy/shifts", options)
            errorHandler(req.status)

        } catch (err) {
            console.log('err: ', err.message)
            errorHandler('You are probably not logged into your Relex account. Please, log in first')

        }

    }

    return true

});


