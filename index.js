const express = require("express")
const cluster = require("cluster");
const path = require("path")
const numCPUs = require("os").cpus().length;
const askAI = require("./gemini/AI.js")

const app = express()
let PORT = 8000


app.use(express.static(path.join(__dirname, "public")))

app.get("/health", async (req, res) => {
    try {
        let propmt = req.body?.prompt;
        if (!propmt) {
            propmt = "Hello buddy, greet me with nice words"
        }
        const answer = await askAI(propmt);
        return res.status(200).json({
            data: answer.toString(),
            success: true,
            message: "server is healthy"
        })
    }
    catch (err) {
        console.log("AI error: ")
        console.log(err)
        return res.status(400).json({
            success: false,
            message: "server is unhealthy"
        })
    }

})

if (cluster.isMaster) {
    console.log("master: ");
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }
}
else {
    app.listen(PORT, () => {
        console.log(`Listening on http://localhost:${PORT}`)
    })
}




