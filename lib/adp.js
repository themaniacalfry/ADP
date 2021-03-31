const https = require('https');
const axios = require('axios');

// const request = require('request-promise')

//Retrieve Tokens from ADP.
const auth = (data) => {
    const certs = {
        cert: new Buffer.from(data.cert),
        key: new Buffer.from(data.key)
    }

    const httpsAgent = new https.Agent(certs);
    const adp = axios.create({ httpsAgent });

    const options = {
        headers: {
            Authorization: `Basic ${new Buffer.from(`${data.client_id}:${data.client_secret}`).toString('base64')}`
        }
    }
        
    return adp.post('https://accounts.adp.com/auth/oauth/v2/token?grant_type=client_credentials', null, options).then(res => {
        return res.data
    }).catch(err => {
        return err
    })
}

const getWorkers = (auth, data, skip) => {
    const certs = {
        cert: new Buffer.from(data.cert),
        key: new Buffer.from(data.key)
    }

    const httpsAgent = new https.Agent(certs);
    const adp = axios.create({ httpsAgent });

    const filters = 'workers/associateOID,workers/workerStatus/statusCode/codeValue,workers/workAssignments/reportsTo/workerID,workers/workAssignments/jobTitle,workers/workAssignments/seniorityDate,workers/workAssignments/homeWorkLocation,workers/businessCommunication/landlines,workers/businessCommunication/emails'

    const url = new URL('https://accounts.adp.com/hr/v2/workers');
    url.searchParams.append('$top', 100);
    url.searchParams.append('$select', filters);
    url.searchParams.append('count', true);

    if (skip) {
        url.searchParams.append('$skip', skip);
    }

    const options = {
        method: 'GET',
        url: url.href,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${auth.access_token}` 
        }
    }
    
    return adp(options).then(res => {
        return res.data
    }).catch(err => {
        console.error(err)
        return err
    })
}

module.exports = {
    auth,
    getWorkers
}