const puppeteer = require('puppeteer');

function wait(seconds) {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}


async function findLinkedInCompanyURL(page, companyToSearch = "google") {
    await page.goto('https://www.linkedin.com/jobs/search?trk=guest_homepage-basic_guest_nav_menu_jobs&position=1&pageNum=0', { waitUntil: 'networkidle2' });
    console.log("Page loaded...");
    //  pressing the search placeholder for searching company for small screen size only
    // const searchButtonSelector = '.search-bar__placeholder';
    // await page.waitForSelector(searchButtonSelector, { visible: true });
    // await page.click(searchButtonSelector);
    // console.log("Clicked the search button...");

    //  typing company
    await page.type('#job-search-bar-keywords', companyToSearch, { delay: 100 });
    console.log("Typed company name...");
    //  pressing enter for searching
    await page.keyboard.press('Enter');
     console.log("entered");

    //  selecting the first job

    const anchorSelector = 'a.topcard__flavor--black-link'; 
    await page.waitForSelector(anchorSelector);

    // Step 4: Extract the href attribute from the anchor tag
    const href = await page.evaluate(selector => {
      const anchorElement = document.querySelector(selector);
      return anchorElement ? anchorElement.href : null;
    }, anchorSelector);
  
    if (href) {
      // Step 5: Navigate to the link
      await page.goto(href);
      console.log(`Navigated to ${href}`);
    } else {
      console.log('Anchor tag not found or has no href attribute');
    }

    // closing the signup box
    wait(5);
    const closeDialogBtn = ".btn-tertiary";
    await page.waitForSelector(closeDialogBtn, { visible: true });
    await page.click(closeDialogBtn);
    console.log("CLoseing the Signup Dialog...");
    
    // getting content
    const h3Selector = 'h3.top-card-layout__first-subline'; 
    const aSelector = 'a.face-pile__cta';
    await page.waitForSelector(h3Selector);
    await page.waitForSelector(aSelector)
  
    // Step 4: Extract the text content from the h3 element
    const textContent = await page.evaluate(selector => {
      const h3Element = document.querySelector(selector);
      return h3Element ? h3Element.textContent.trim() : null;
    }, h3Selector);

    const aContent = await page.evaluate(selector => {
        const h3Element = document.querySelector(selector);
        return h3Element ? h3Element.textContent.trim() : null;
      }, aSelector);

    if (textContent && aContent) {
      console.log(`Text content: ${textContent} and ${aContent}`);
    } else {
      console.log('h3 element not found or has no text content');
    }
    return {textContent, aContent};
}

async function scrapeLinkedIn(compnayName) {
    console.log("Starting...");
    const browser = await puppeteer.launch({ headless: false, defaultViewport: null, // Set this to null to disable the default viewport settings
    args: ['--window-size=1920,1080'] });
    let page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 }); // This can be set again if needed


    let res = await findLinkedInCompanyURL(page, compnayName);
    console.log(res);
    if (!res) {
        console.log("Retrying...");
        page = await browser.newPage();
        res = await findLinkedInCompanyURL(page, compnayName);
        console.log("res in retry", res);
    } else {
        console.log("Search successful...");
        await browser.close();
        return res;
        
        // Optionally close the browser if no further actions are needed
    }
}

// scrapeLinkedIn();

module.exports=scrapeLinkedIn;