const { google } = require('googleapis');
const process = require('process');
const axios = require('axios');
require('dotenv').config()

const getUserInfo = async (cookie) => {
    const userInfo = await axios.get(`https://restel.work.relexsolutions.com/employees/api/employee`,
        {
            headers: {
                Cookie: cookie
            }
        }
    );

    return userInfo.data.id
}

const oAuth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URIS
)

module.exports = { oAuth2Client, getUserInfo }