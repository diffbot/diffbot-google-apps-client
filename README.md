# Google App Script for DiffBot API

This package demonstrates calling Diffbot from a Google Apps doc, such as a spreadsheet, presentation, or form.  You can see a live demo [here](http://bit.ly/O8fwIX).

The Google App Script for DiffBot API has couple of functions to call Automatic APIs and CrawlBot APIs.

There are 5 files in the package.

* README - This help file.
* diffbot.gs - The main client library providing interface to call DiffBot APIs. Use to create and enhance Google Spreadsheet or can be used as a standalone script.
* Code.gs - Contains code to customize Google Spreadsheet and use diffbot.gs to call DiffBot APIs and output result in sheet.
* Help.html - Help content for sample Google Spreadsheet.
* DiffBot example.xlsx - An example Excel spreadsheet. Can be used as a template to create sample Google Spreadsheet.

## Installation

* Create a new Google spreadsheet on Google Drive. Alternatively, use the Excel sheet as a template in the package.
* From within your new spreadsheet, select the menu item `Tools > Script editor`. If you are presented with a welcome screen, click Blank Project.
* Delete any code in the script editor and paste in the code in the `Code.gs` file in the package. This script is an example script that uses functions from `diffbot.gs` to call DiffBot APIs.
* Create new script file from `File->New->Script file`.
* Delete any code in the script editor and paste in the code in the `diffbot.gs` file in the package. This script is actual client script that calls DiffBot APIs.
* Similarly create an HTML file from `File->New->Html file` and copy and paste content from `Help.html` file in package.
* Select the menu item `File > Save`. Name your new script and click OK.
* Switch back to your spreadsheet and reload the page.
* Select the menu item `DiffBot > Get Article Information`. (The DiffBot menu is a custom menu that the script added to the spreadsheet. It should have appeared a few seconds after you reloaded the spreadsheet.)
* A dialog box will appear and tell you that the script requires authorization. Click Continue. A second dialog box will then request authorization for specific Google services. Read the notice carefully, then click Accept.

## Configuration

* Enter your DiffBot Developer Token by selecting menu `DiffBot->Settings`. You can get DiffBot Developer Token from [DiffBot website](http://www.diffbot.com).

## Usage

* Now that the script is authorized, select `DiffBot > Get Article Information` again. After a moment, a new sheet will be created with the article information fetched using the DiffBot API.
* All other DiffBot Automatic APIs can be called from DiffBot menu.
* Sheet that contains URL should be active when selecting any menu to call DiffBot API.
* List of URLs should start from second row. First row is considered header.

## Creating custom script

If you are a developer and want to create and enhance your own Google Spreadsheet then you just need `diffbot.gs` file.

### Calling DiffBot Article API

Add the `diffbot.gs` file in your project and you can call API like this:

```
// Call the diffbot client
var jsonstr = diffbot('www.example.com', DEVELOPER_TOKEN, 'article');
// convert json string to javascript object
obj = JSON.parse(jsonstr);
```	

It supports following APIs
* article
* frontpage
* image
* product
* analyze

In case of any error returned from DiffBot object will contain `error` and `errorCode` fields. Otherwise it will contain fields returned from API. See the DiffBot documentation for complete details of fields returned.

### Calling DiffBot CrawlBot API

Add the `diffbot.gs` file in your project and you can call API like this:

```
// Define the seeds
var seeds = ['http://www.example1.com', 'http://www.example2.com'];
// Call the diffbot client
var jsonstr = diffbot_crawl(DEVELOPER_TOKEN, 'CrawlJobName', 'start', seeds);
// convert json string to javascript object
obj = JSON.parse(jsonstr);
```	

It supports following commands.
* status
* start
* pause
* resume
* restart
* delete

In case of any error returned from DiffBot object will contain `error` and `errorCode` fields. Otherwise it will contain fields returned from API. See the DiffBot documentation for complete details of fields returned.

-Initial commit by Muhammad Jawaid Shamshad(jawaid@ibexofts.tk)-
