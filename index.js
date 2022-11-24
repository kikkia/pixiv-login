const puppeteer = require('puppeteer-extra');
var userAgent = require('user-agents');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const express = require("express");
const login_url = "https://accounts.pixiv.net/login?return_to=https%3A%2F%2Fwww.pixiv.net%2Fen%2F&lang=en&source=pc&view_type=page";
const user_selector = '#app-mount-point > div > div.sc-fvq2qx-4.idshsY > div.sc-2oz7me-0.DjdAN > div.sc-anyl02-2.joiqGm > div > div > div > form > fieldset.sc-bn9ph6-0.kJkgq.sc-2o1uwj-3.diUbPW > label > input';
const pass_selector = '#app-mount-point > div > div.sc-fvq2qx-4.idshsY > div.sc-2oz7me-0.DjdAN > div.sc-anyl02-2.joiqGm > div > div > div > form > fieldset.sc-bn9ph6-0.kJkgq.sc-2o1uwj-4.hZIeVE > label > input';
const login_selector = '#app-mount-point > div > div.sc-fvq2qx-4.idshsY > div.sc-2oz7me-0.DjdAN > div.sc-anyl02-2.joiqGm > div > div > div > form > button';

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
    await page.waitFor(1000)
    await page.focus(user_selector)
    await page.keyboard.type(username, {delay: 200});
    await page.focus(pass_selector)
    await page.keyboard.type(pass, {delay: 200});
    await page.click(login_selector);
    await page.waitFor(1000);
    var data = await page._client.send('Network.getAllCookies');
    await browser.close();
    res.status(200).json(data)
});