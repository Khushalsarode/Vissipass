require('dotenv').config(); // Load environment variables
const { remote } = require('webdriverio');

const capabilities = {
  browserName: 'chrome',
  browserVersion: 'latest',
  platformName: 'Windows 11',
  'sauce:options': {
    build: 'React-vissipass-test',
    name: 'React-vissipass-test',
  }
};

async function runTest() {
  const driver = await remote({
    user: process.env.SAUCE_USERNAME, // Sauce Labs username from .env
    key: process.env.SAUCE_ACCESS_KEY, // Sauce Labs access key from .env
    hostname: 'ondemand.eu-central-1.saucelabs.com',
    port: 443,
    path: '/wd/hub',
    capabilities,
  });

  try {
    // Navigate to the home page (Sauce Connect makes localhost accessible)
    await driver.navigateTo('http://localhost:3000/');
    
    // Check if the title includes "VISSIPASS"
    const title = await driver.getTitle();
    const titleIsCorrect = title.includes('VISSIPASS');
    console.log('Title Check:', titleIsCorrect ? 'Passed' : 'Failed');
    
    // Assert that the title is correct
    if (!titleIsCorrect) {
      throw new Error('Page title does not contain "VISSIPASS"');
    }

    // Check if the "Create Visitor Pass" button is visible and clickable
    const createPassButton = await driver.$('.create-pass-button');
    const isButtonVisible = await createPassButton.isDisplayed();
    const isButtonClickable = await createPassButton.isClickable();
    console.log('Create Pass Button Visible:', isButtonVisible ? 'Passed' : 'Failed');
    console.log('Create Pass Button Clickable:', isButtonClickable ? 'Passed' : 'Failed');

    // Click the "Create Visitor Pass" button
    if (isButtonVisible && isButtonClickable) {
      await createPassButton.click();

      // Wait for the modal to appear and check if it's displayed
      const modal = await driver.$('.modal');
      const isModalVisible = await modal.isDisplayed();
      console.log('Modal Displayed After Button Click:', isModalVisible ? 'Passed' : 'Failed');

      // Close the modal
      const closeButton = await driver.$('.close-button');
      await closeButton.click();
    }

    // Final job status check
    const jobStatus = 'passed';
    await driver.execute('sauce:job-result=' + jobStatus);

  } catch (error) {
    console.error('Test failed', error);
    // Mark the job as failed if any assertion fails
    await driver.execute('sauce:job-result=failed');
  } finally {
    // End the session
    await driver.deleteSession();
  }
}

runTest();
