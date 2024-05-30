const express = require("express");
const scrapeLinkedIn = require("./index")
const app = express();
const PORT = 3000;
app.use(express.json());

app.post("/search-company", async(req, res)=>{
    console.log("searching.....");
    const {companyName} = req.body;
    const result = await scrapeLinkedIn(companyName);
    res.json({msg:"Done", result})
})

app.listen(PORT, ()=>{
    console.log(`Server is running on ${PORT}`);
})