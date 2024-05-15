const jsonfile = require('jsonfile');
const fs = require('fs/promises');
const puppeteer = require('puppeteer'); // Ensure you have Puppeteer installed

const COOKIES_FOLDER_PATH = 'cookies/';
const COOKIES_FILE_NAME = 'slack-session-cookies.json';
const COOKIES_FILE_PATH = `${COOKIES_FOLDER_PATH}${COOKIES_FILE_NAME}`;
const readline = require('readline');

// Create readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function loginToSlack(page) {
    try {
        const cookies = JSON.parse(await fs.readFile(COOKIES_FILE_PATH));
        for (let cookie of cookies) {
            await page.setCookie(cookie);
        }
        console.log('Logged in using existing cookies.');
    } catch (error) {
        console.error('No valid cookies found, initiating new login sequence.');
        await loginAndSaveCookies(page);
    }
}

async function loginAndSaveCookies(page) {
  await page.goto(process.env.SLACK_WORKSPACE_URL, { waitUntil: 'networkidle0' });

    console.log('Please complete the login manually, including secondary authentication steps.');

    await new Promise((resolve) => rl.question('Press ENTER after you have successfully logged in and see the Slack workspace.', (answer) => {
      rl.close(); // Close the readline interface
      resolve(); // Resolve the promise to continue execution
  }));

    // Waiting for manual login completion; adjust timeout as necessary.
   // await page.waitForFunction('document.querySelector("body").innerText.includes("You’re logged in as")', { timeout: 0 });

    const cookies = await page.cookies();
    await saveCookies(cookies);
    console.log('Cookies saved successfully.');
}

async function saveCookies(cookies) {
  await createFolderIfDoesntExist(COOKIES_FOLDER_PATH);
  try {
      await jsonfile.writeFile(COOKIES_FILE_PATH, cookies, { spaces: 2 });
      console.log('Cookies file has been written successfully.'); // Confirms file write success
  } catch (error) {
      console.error('Error writing cookies file:', error); // Logs any file writing errors
  }
}


async function createFolderIfDoesntExist(folderPath) {
    try {
        await fs.stat(folderPath);
    } catch (error) {
        console.error(`${folderPath} directory doesn't exist. Attempting to create.`);
        try {
            await fs.mkdir(folderPath);
            console.log('Created directory:', folderPath);
        } catch (error) {
            console.error('Failed to create directory:', error);
            throw error;
        }
    }
}

exports.loginToSlack = loginToSlack;

// To use this module, make sure you have Puppeteer installed and configure your environment.
