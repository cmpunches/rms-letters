const cheerio = require('cheerio');
const fetch = require('node-fetch');
const apicache = require('apicache');
const express = require('express');

const app = express();
const cache = apicache.middleware;

app.use(express.static(__dirname + '/views'));

app.get('/api/stats', cache('1 minute'), async (req, res) => {
    // fetch the pages and convert the response to plain text
    const OL = await fetch('https://rms-open-letter.github.io/');
    const SL = await fetch('https://rms-support-letter.github.io/');
    const SL_PRDATA = await fetch('https://api.github.com/repos/rms-support-letter/rms-support-letter.github.io/pulls?state=open');
    const OL_TEXT = await OL.text();
    const SL_TEXT = await SL.text();
    const SL_PRDATA_JSON = await SL_PRDATA.json();
    // parse the data with cheerio 
    const $OL = cheerio.load(OL_TEXT);
    const $SL = cheerio.load(SL_TEXT);
    // get the amount of signatures for both letters
    const OL_NUM = $OL('ol').children('li').length;
    const SL_NUM = $SL('ol').children('li').length;

    res.json({ open: OL_NUM, support: SL_NUM, supportPending: SL_PRDATA_JSON.length });
});

app.listen(process.env.PORT || 3000);