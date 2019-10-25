const fs = require('fs');
const axios = require('axios');
const imageDl = require('image-downloader');
const as = require('async');

const getAllSchools = async () => {
    return new Promise(async (resolve, reject) => {
        console.group('Downloading school list')
        let schools = await axios.get('https://www.purplemash.com/login/default/getFilteredSchools?country=235&la=&limit=20000&name=&offset=0')
        console.log(`Found ${schools.data.users.length} schools`)
        console.groupEnd();
        return resolve(schools.data.users);
    });
};

const getSchoolDetails = async (id) => {
    return new Promise(async (resolve, reject) => {
        let details = await axios.get(`https://www.purplemash.com/login/default/getCustomer/customerId/${id}`);
        return resolve(details.data);
    });
}

const processSchools = async (schools) => {
    let i = 0;
    as.eachSeries(schools, async (school) => {
        console.log();
        i++;
        console.group(i, school.name);
        console.log('Requesting Details');
        let details = await getSchoolDetails(school.id);
        let logoExists = details.customerlogopath !== '/images/mashlogin/nologo.png';
        console.log(`${logoExists ? 'Did' : 'Didn\'t'} find a logo.`)
        if (logoExists) {
            let url = `https://www.purplemash.com${details.customerlogopath}`;
            console.log(`URL is ${url}`)

            console.log('Downloading logo');
            await downloadLogo(url, `${school.id}.png`);

        }
        console.groupEnd();
    })
};

const downloadLogo = async (url, name) => {
    return new Promise(async (resolve, reject) => {
        let dest = './images/' + name;
        imageDl.image({
            url,
            dest,
            extractFilename: true
        })
        .then(() => {
            console.log(`Downloaded logo to ${dest}.`);
            return resolve();
        })
    });
};

let start = async () => {
    let schools = await getAllSchools();
    await processSchools(schools);
}

start();