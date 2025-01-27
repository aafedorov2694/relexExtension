const url = "https://restel.work.relexsolutions.com/employees/home";
const cookieName = "permissions";
let cookie;


chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {

    const getUserInfo = async () => {
        const userId = await fetch('https://restel.work.relexsolutions.com/employees/api/user')
        const user = await userId.json()
        console.log('user: ', user)
        return user
 
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

        fetch('https://relex-extension-cd6f517d1c74.herokuapp.com/authy', options)
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


    return true

});


