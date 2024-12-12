
const authButton = document.getElementById('auth')
const errorMessage = document.getElementById('warning')

const onAuth = async() => {
    console.log('onAuthenticate')
    chrome.runtime.sendMessage('Let me in', function(resp) {
        console.log('response in message listener: ', resp)
        if(resp.message != 200) {
            errorMessage.innerHTML = '<p>Please, log into your relex account<p>'
        } else {
            errorMessage.innerHTML = '<p>Shifts are succesfully added<p>'
        }
    })

}


authButton.addEventListener('click', onAuth)