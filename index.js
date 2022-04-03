const puppeteer = require('puppeteer-extra');
var userAgent = require('user-agents');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const express = require("express");
const login_url = "https://accounts.pixiv.net/login?return_to=https%3A%2F%2Fwww.pixiv.net%2Fen%2F&lang=en&source=pc&view_type=page";
const user_selector = '#LoginComponent > form > div.input-field-group > div:nth-child(1) > input[type=text]';
const pass_selector = '#LoginComponent > form > div.input-field-group > div:nth-child(2) > input[type=password]';
const login_selector = '#LoginComponent > form > button';

const app = express();
const PORT = process.env.SERVER_PORT || 7788;
app.use(express.urlencoded({ extended: true }));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

app.get('/login', async (req, res) => {
    // Login the user to pixiv given username and password.
    let username = req.query.username;
    let pass = req.query.password;
    if (!username) {
        res.status(400).json({"message": "username query param is required"});
    }
    if (!pass) {
        res.status(400).json({"message": "password query param is required"});
    }

    var browser = await puppeteer.launch({headless: true, args:['--no-sandbox']});
    var page = await browser.newPage();
	await page.setUserAgent(userAgent.toString());
    await page.goto(login_url);
    await page.waitForSelector(user_selector);
    await page.$eval(user_selector, (el, username) => {el.value = username;}, username);
    await page.$eval(pass_selector, (el, password) => {el.value = password;}, pass);
    await page.click(login_selector);
    await page.waitFor(1000);
    await browser.close();
    var data = await page._client.send('Network.getAllCookies');
    res.status(200).json(data)
});