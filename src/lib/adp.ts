// All external calls come from this file.
import https from 'https';
import axios from 'axios';

// Retrieve Tokens from ADP.
export const auth = (
    data: {
        cert: string;
        key: string;
        client_id: string;
        client_secret: string;
    }) => {
    // Certificate object
    const certs = {
        cert: Buffer.from(data.cert),
        key: Buffer.from(data.key)
    }

    // Sets the Agent with the certificates.
    const httpsAgent = new https.Agent(certs);
    // Initializes Axios client with Agent and certs.
    const adp = axios.create({ httpsAgent });

    const options = {
        headers: {
            Authorization: `Basic ${Buffer.from(`${data.client_id}:${data.client_secret}`).toString('base64')}`
        }
    }

    // Makes API call to ADP to return a token.
    return adp.post(
        'https://accounts.adp.com/auth/oauth/v2/token?grant_type=client_credentials',
        null,
        options
    ).then(res => res.data);
}

export const getWorkers = (
    auth,
    data: {
        cert: string;
        key: string;
        client_id: string;
        client_secret: string;
    },
    skip
) => {
    // Certificate object
    const certs = {
        cert: Buffer.from(data.cert),
        key: Buffer.from(data.key)
    }

    // Sets the Agent with the certificates.
    const httpsAgent = new https.Agent(certs);
    // Initializes Axios client with Agent and certs.
    const adp = axios.create({ httpsAgent });

    // Creates filters to reduce the size of the overall payload but also removes sensitive data that is unnecessary.  
    const filters = 'workers/associateOID,workers/workerStatus/statusCode/codeValue,workers/workAssignments/reportsTo/workerID,workers/workAssignments/jobTitle,workers/workAssignments/seniorityDate,workers/workAssignments/homeWorkLocation,workers/businessCommunication/landlines,workers/businessCommunication/emails,workerDates/originalHireDate'

    // Sets URL with Query Parameters.
    const url = new URL('https://accounts.adp.com/hr/v2/workers');
    url.searchParams.append('$top', '100');
    url.searchParams.append('$select', filters);
    url.searchParams.append('count', 'true');

    // If skip is not null it will set the skip value.
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

    // Makes API call to return workers. 
    return adp(options).then(res => res.data);
}