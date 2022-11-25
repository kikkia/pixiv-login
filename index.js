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

    //Randomize viewport size
    await page.setViewport({
        width: 1920 + Math.floor(Math.random() * 100),
        height: 3000 + Math.floor(Math.random() * 100),
        deviceScaleFactor: 1,
        hasTouch: false,
        isLandscape: false,
        isMobile: false,
    });

    await page.evaluateOnNewDocument(() => {
        // Pass webdriver check
        Object.defineProperty(navigator, 'webdriver', {
            get: () => false,
        });
    });

    await page.evaluateOnNewDocument(() => {
        // Pass chrome check
        window.chrome = {
            runtime: {},
            // etc.
        };
    });

    await page.evaluateOnNewDocument(() => {
        //Pass notifications check
        const originalQuery = window.navigator.permissions.query;
        return window.navigator.permissions.query = (parameters) => (
            parameters.name === 'notifications' ?
                Promise.resolve({ state: Notification.permission }) :
                originalQuery(parameters)
        );
    });

    await page.evaluateOnNewDocument(() => {
        // Overwrite the `plugins` property to use a custom getter.
        Object.defineProperty(navigator, 'plugins', {
            // This just needs to have `length > 0` for the current test,
            // but we could mock the plugins too if necessary.
            get: () => [1, 2, 3, 4, 5],
        });
    });

    await page.evaluateOnNewDocument(() => {
        // Overwrite the `languages` property to use a custom getter.
        Object.defineProperty(navigator, 'languages', {
            get: () => ['en-US', 'en'],
        });
    });

	await page.setUserAgent(userAgent.random().toString());
    await page.goto(login_url);
    await page.waitFor(1000)
    await page.focus(user_selector)
    await page.keyboard.type(username, {delay: 200});
    await page.focus(pass_selector)
    await page.keyboard.type(pass, {delay: 200});
    await page.waitFor(1000)
    await page.click(login_selector);
    await page.waitFor(1000);
    await page.screenshot({path: "ss.png"})
    var data = await page._client.send('Network.getAllCookies');
    await browser.close();
    res.status(200).json(data)
});