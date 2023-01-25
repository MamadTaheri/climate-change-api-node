const PORT = 8003
const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const https = require("https");
const {newspapers} = require("./data");

const app = express();

const articles = []

const agent = new https.Agent({
    rejectUnauthorized: false
});

newspapers.forEach(newspaper => {
    axios.get(newspaper.address, {httpsAgent: agent})
        .then((response) => {
            const html = response.data;
            const $ = cheerio.load(html);
            $('a:contains("climate")', html).each(function () {
                const title = $(this).text()
                const url = $(this).attr('href')
                articles.push({
                    title,
                    url,
                    source: newspaper.name
                })
            })
        }).catch(error => console.log(error.message))
})

app.get('/', (req, res) => {
    res.json('Welcome to my Climate Change News API')
});

app.get('/news', (req, res) => {
    res.json(articles)
})

app.get("/news/:newspaperID", (req, res) => {
    const {newspaperID} = req.params;

    const newspaperAddress = newspapers.filter(newspaper => newspaper.name === newspaperID)[0]?.address;

    axios.get(newspaperAddress)
        .then((response) => {
            const html = response.data
            const $ = cheerio.load(html)
            const specificArticles = [];

            $('a:contains("climate")', html).each(function () {
                const title = $(this).text()
                const url = $(this).attr('href')
                specificArticles.push({
                    title,
                    url,
                    source: newspaperID
                })

            })
            res.json(specificArticles)
        }).catch(error => console.log(error))

})

app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`)
})