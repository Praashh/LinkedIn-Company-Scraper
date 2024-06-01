const express = require("express");
const scrapeLinkedIn = require("./index");
require('dotenv').config()

const app = express();
app.use(express.json());

app.post("/search-company", async(req, res)=>{
    console.log("searching.....");

    const extractCompanyName = (url) => {
      const match = url.match(/^(www\.)?([^\.]+)/);
      return match ? match[2] : null;
    };
    
    // Example of req.body in action
    // Assuming req.body = { companyName: 'swiggy.com' };
    const { companyName, location } = req.body;
    const extractedCompanyName = extractCompanyName(companyName);
    console.log(extractedCompanyName); // Output should be: 'swiggy'
    try {
        const result = await scrapeLinkedIn(extractedCompanyName, location);
        if(!result){
            res.status(400).json({msg:"Someting Went Wrong with Scrapping!"});
        }else{
            res.status(200).json({msg:"Done", result});
        }
    } catch (error) {
        res.status(500).json({msg:"Company Name not extracted!"});
    }
   
})

app.listen(process.env.PORT, ()=>{
    console.log(`Server is running on ${process.env.PORT}`);
})