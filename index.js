require("dotenv").config()
const express = require("express")
const puppeteer = require("puppeteer")
const fs = require("fs")
const app = express()
const port = 3000

app.use(express.json()) // Middleware to parse JSON

// Function to capture a screenshot and store it temporarily
async function captureScreenshot(url, delay = 5000) {
  // Default delay set to 3000 milliseconds (3 seconds)
  const browser = await puppeteer.connect({
    browserWSEndpoint: `wss://chrome.browserless.io?token=${process.env.BROWSERLESS_API_KEY}`,
  })
  const page = await browser.newPage()
  await page.goto(url)

  await page.waitForTimeout(delay) // Wait for the specified delay

  // Use the /tmp directory for temporary storage
  const tempPath = `/tmp/screenshot_${Date.now()}.png`
  await page.screenshot({ path: tempPath })
  await browser.close()

  return tempPath
}

// POST endpoint to receive an array of URLs and return their screenshots
app.get("/", async (req, res) => {
  try {
    const urls = [
      {
        name: "Eespacecarre- Ecommerce",
        url: "https://stage-e-commerce.netlify.app",
        des: "A user-friendly e-commerce app designed for seamless shopping experiences. It features a sleek, intuitive interface with advanced search capabilities, personalized recommendations, and secure checkout options",
      },
      {
        name: "Eespacecarre- Admin",
        url: "https://stage-admin-e-commerce.netlify.app",
        des: "A comprehensive e-commerce admin panel offering real-time analytics, inventory management, and order tracking. Equipped with user-friendly dashboards for efficient site management and customer support tools.",
      },
      {
        name: "",
        url: "https://geometra.rukkor.io/login",
        des: "",
      },
      {
        name: "",
        url: "https://admin-thefootballagency.netlify.app",
        des: "Created a specialized construction industry tool for managing 2D/3D drawings and BIM models, complete with a customizable cost estimation framework.",
      },
      {
        name: "Geometa",
        url: "https://stage-admin-jenny-point.netlify.app",
        des: "",
      },
      {
        name: "Scoutible",
        url: "https://www.scoutible.com",
        des: "Developed a game-based hiring platform using mobile gaming to accurately identify ideal candidate fits.",
      },
    ]
    const results = []

    for (const url of urls) {
      const tempScreenshotPath = await captureScreenshot(url.url) // Delay is used here

      // Read the screenshot file and send it as a base64 encoded string
      const fileContent = fs.readFileSync(tempScreenshotPath, {
        encoding: "base64",
      })
      url.image = `data:image/png;base64,${fileContent}`
      results.push(url)
      // Delete the temporary file
      fs.unlinkSync(tempScreenshotPath)
    }

    res.json(results)
  } catch (error) {
    res.status(500).send(error.message)
  }
})

// Start the server
app.listen(port, () => {
  console.log(`Screenshot API running at http://localhost:${port}`)
})
