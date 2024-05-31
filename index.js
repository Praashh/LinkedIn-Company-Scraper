const puppeteer = require('puppeteer');
require('dotenv').config()

function wait(seconds) {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

async function rotateIPs(){
    // rotation code of the service which you are using.
}

async function findLinkedInCompanyURL(page, companyToSearch = "google") {
    try {
        await page.goto('https://www.linkedin.com/jobs/search?trk=guest_homepage-basic_guest_nav_menu_jobs&position=1&pageNum=0', { waitUntil: 'networkidle2' });
        console.log("Page loaded...");

        // Typing company
        await page.type('#job-search-bar-keywords', companyToSearch, { delay: 100 });
        console.log("Typed company name...");

        // Pressing enter for searching
        await page.keyboard.press('Enter');
        console.log("Entered");

        // Selecting the first job
        const anchorSelector = 'a.topcard__flavor--black-link';
        await page.waitForSelector(anchorSelector);

        // Extract the href attribute from the anchor tag
        const href = await page.evaluate(selector => {
            const anchorElement = document.querySelector(selector);
            return anchorElement ? anchorElement.href : null;
        }, anchorSelector);

        if (href) {
            // Navigate to the link
            await page.goto(href, { waitUntil: 'networkidle2' });
            console.log(`Navigated to ${href}`);
        } else {
            console.log('Anchor tag not found or has no href attribute');
            return null;
        }

        // Closing the signup dialog box
        await wait(5);
        const closeDialogBtn = ".btn-tertiary";
        try {
            await page.waitForSelector(closeDialogBtn, { visible: true, timeout: 5000 });
            await page.click(closeDialogBtn);
            console.log("Closed the Signup Dialog...");
        } catch (error) {
            console.log("No dialog box to close.");
        }

        // Getting content
        const h3Selector = 'h3.top-card-layout__first-subline';
        const aSelector = 'a.face-pile__cta';
        await page.waitForSelector(h3Selector);
        await page.waitForSelector(aSelector);

        // Extract the text content from the h3 element
        const textContent = await page.evaluate(selector => {
            const h3Element = document.querySelector(selector);
            return h3Element ? h3Element.textContent.trim() : null;
        }, h3Selector);

        const aContent = await page.evaluate(selector => {
            const aElement = document.querySelector(selector);
            return aElement ? aElement.textContent.trim() : null;
        }, aSelector);

        if (textContent && aContent) {
            let followersPattern = /(\d{1,3}(?:,\d{3})*) followers/;
            let employeesPattern = /View all (\d{1,3}(?:,\d{3})*) employees/;

            // Find matches
            let followersMatch = textContent.match(followersPattern);
            let employeesMatch = aContent.match(employeesPattern);

            // Extract and print the numbers if matches are found
            if (followersMatch && employeesMatch) {
                let followersNumber = followersMatch[1];
                let employeesNumber = employeesMatch[1];
                console.log("Number of followers: " + followersNumber);
                console.log("Number of employees: " + employeesNumber);
                return { followersNumber, employeesNumber };
            } else {
                console.log("Pattern match failed.");
                return null;
            }
        } else {
            console.log('h3 or a element not found or has no text content');
            return null;
        }
    } catch (error) {
        console.error("Error in findLinkedInCompanyURL:", error);
        return null;
    }
}

async function scrapeLinkedIn(companyName) {
    console.log("Starting...");

    // uncomment this for getting new Proxy
    /*const proxy = rotateIPs();
    console.log(`Using proxy: ${proxy}`);*/

    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null, 
        args: ['--window-size=1920,1080'] // comment if you are using the below args
        
        // uncomment this for enabling IP rotation
        /*args:[
            `--proxy-server=${proxy}`,
            '--window-size=1920,1080'
        ]*/
    });

    try {
        let page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 }); 

        let res = await findLinkedInCompanyURL(page, companyName);
        console.log(res);
        if (!res) {
            console.log("Retrying...");
            page = await browser.newPage();
            res = await findLinkedInCompanyURL(page, companyName);
            console.log("Result in retry:", res);
        } else {
            console.log("Search successful...");
            return res;
        }
    } catch (error) {
        console.error("Error in scrapeLinkedIn:", error);
    } finally {
        await browser.close();
        console.log("Browser closed.");
    }
}

// Uncomment to test
// scrapeLinkedIn('google');

module.exports = scrapeLinkedIn;
