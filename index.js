const express = require("express")
const puppeteer = require("puppeteer")
const path = require("path")
const fs = require("fs")
const app = express()
const port = 3000

app.use(express.json()) // Middleware to parse JSON

// Function to capture a screenshot and store it temporarily
async function captureScreenshot(url) {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto(url)

  // Use the /tmp directory for temporary storage
  const tempPath = `/tmp/screenshot_${Date.now()}.png`
  await page.screenshot({ path: tempPath })
  await browser.close()

  return tempPath
}

// POST endpoint to receive an array of URLs and return their screenshots
app.get("/", async (req, res) => {
  try {
    const urls = ["https://espacecarre.com"]
    const results = []

    for (const url of urls) {
      const tempScreenshotPath = await captureScreenshot(url)

      // Read the screenshot file and send it as a base64 encoded string
      const fileContent = fs.readFileSync(tempScreenshotPath, {
        encoding: "base64",
      })
      results.push({
        url,
        screenshotBase64: `data:image/png;base64,${fileContent}`,
      })

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
