const { google } = require('googleapis');
const process = require('process');
const axios = require('axios');
require('dotenv').config()

const getUserInfo = async (cookie) => {
    const userInfo = await axios.get(`https://restel.work.relexsolutions.com/employees/api/employee`,
        {
            headers: {
                Cookie: cookie
                //'permissions = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiRmVkb3JvdiBBbnRvbiIsImVtYWlsIjoiQW50b24uRmVkb3JvdkByZXN0ZWwuZmkiLCJ1c2VySWQiOiI1cm94clppdUd5T1NSMjNsdnltT3U4T0FYempCYU9uWk1JWUhPNTBwS2owPSIsImlzQWRtaW4iOnsidmFsdWUiOmZhbHNlfSwiaXNQbGFubmVyIjp7InZhbHVlIjp0cnVlLCJhbGxvd2VkUGxhbm5pbmdVbml0cyI6eyJ0eXBlIjoid2hpdGVsaXN0IiwicGxhbm5pbmdVbml0cyI6WzEzMjBdLCJwbGFubmluZ1VuaXRHcm91cHMiOltdfX0sImlzRW1wbG95ZWUiOnsidmFsdWUiOnRydWUsImNhbkFjdGl2YXRlVEFQYWRzIjpmYWxzZSwiZW1wbG95ZWVJZHMiOls1NDgzXX0sImlzUGF5cm9sbEFkbWluIjp7InZhbHVlIjpmYWxzZX0sInJlc3RlbFVzZXJHcm91cHMiOlsiUmVsZXgtUmVzdGVsLVVuaXQtTWFuYWdlciJdLCJpYXQiOjE3MzE4NDY4OTksImV4cCI6MTczMTkzMzI5OX0.Mo3Q3BhmPIYvqtzF1q3j8t5wGBhQPGcs7KNkWJ6-9h0'
            }
        }
    );

    console.log('userInfo: ', userInfo.data.id)
    return userInfo.data.id
   // return userInfo

}

const oAuth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URIS
)

module.exports = { oAuth2Client, getUserInfo }