/**
*	Google Apps Scripts Sample for DiffBot APIs
*
*	@author: Muhammad Jawaid Shamshad (jawaid@ibexoft.com | twitter.com/mjawaids | https://www.odesk.com/users/~0183c6e9ca72bf13c9)
*	@version: 1.0
*/

/***********************************************************

          UI Functions

***********************************************************/

/**
* A special function that runs when the spreadsheet is open, used to add a
* custom menu to the spreadsheet.
*/
function onOpen() {
  var spreadsheet = SpreadsheetApp.getActive();
  var menuItems = [
    {name: 'Get Articles Information...',  functionName: 'getArticlesInfo_'},
    {name: 'Get Frontpage Information...', functionName: 'getFrontpageInfo_'},
    {name: 'Get Products Information...',  functionName: 'getProductsInfo_'},
    {name: 'Get Image Information...',     functionName: 'getImageInfo_'},
    {name: 'Analyze Information...',       functionName: 'getAnalyzeInfo_'},
    null,
    {name: 'Crawler Status',               functionName: 'statusCrawler_'},
    {name: 'Start Crawler',                functionName: 'startCrawler_'},
    {name: 'Pause Crawler',                functionName: 'pauseCrawler_'},
    {name: 'Resume Crawler',               functionName: 'resumeCrawler_'},
    {name: 'Restart Crawler',              functionName: 'restartCrawler_'},
    {name: 'Delete Crawler',               functionName: 'deleteCrawler_'},
    {name: 'Crawler Result',      functionName: 'downloadCrawlerResult_'},
    null,
    {name: 'Settings',                     functionName: 'showSettingsPane_'},
    {name: 'Help',                         functionName: 'showHelpPane_'}
  ];
  spreadsheet.addMenu('DiffBot', menuItems);
}

/**
* Shows Settings Pane where user can set different settings like developer token.
*/
function showSettingsPane_() {
  var currentDeveloperToken = UserProperties.getProperty('DeveloperToken');
  var inputString = currentDeveloperToken==''?'':'Your current developer token is: ' + currentDeveloperToken + '\r\n \r\n';
  
  // Prompt the user for Developer Token.
  var developerToken = Browser.inputBox('Developer Token',
                                        inputString + 'Please enter the Developer Token:',
                                     Browser.Buttons.OK_CANCEL);
  
  if (developerToken == 'cancel') {
    return;
  }
  
  // Save Developer Token.
  UserProperties.setProperty('DeveloperToken', developerToken.trim());
}

/**
* Shows Help pane.
*/
function showHelpPane_() {
  var html = HtmlService.createHtmlOutputFromFile('Help')
      .setSandboxMode(HtmlService.SandboxMode.NATIVE)
      .setTitle('DiffBot Help')
      .setWidth(600)
      .setHeight(500);
  var ss = SpreadsheetApp.getActive();
  ss.show(html);
}

/**
* Helper function: Highlight rows with errors.
* @param {Spreadsheet} sheet
* @param {Array} rows
* @return void
*/
function highlightErrorRows(sheet, rows){
  if(rows.length>0){
    // Change the color of rows with error to red
    for(rwe=0; rwe<rows.length; rwe++){
      sheet.getRange(rows[rwe], 1).setFontColor('Red');
    }
  }
}

/**
 * Helper function: Sets the background colors for alternating rows within the range.
 * @param {Range} range The range to change the background colors of.
 * @param {string} oddColor The color to apply to odd rows (relative to the
 *     start of the range).
 * @param {string} evenColor The color to apply to even rows (relative to the
 *     start of the range).
 */
function setAlternatingRowBackgroundColors_(range, oddColor, evenColor) {
  var backgrounds = [];
  for (var row = 1; row <= range.getNumRows(); row++) {
    var rowBackgrounds = [];
    for (var column = 1; column <= range.getNumColumns(); column++) {
      if (row % 2 == 0) {
        rowBackgrounds.push(evenColor);
      } else {
        rowBackgrounds.push(oddColor);
      }
    }
    backgrounds.push(rowBackgrounds);
  }
  range.setBackgrounds(backgrounds);
}

/**
* Helper function: Auto-resize width of all columns in sheet
* @param {Sheet} sheet The sheet for which columns to be resized.
*/
function autoResizeCols(sheet){

  for(columnPosition=1; columnPosition<=sheet.getLastColumn(); columnPosition++) {
    sheet.autoResizeColumn(columnPosition);
  }
}

/**
* Helper function: Set and format header
* @param {Sheet} sheet The sheet for which to format header
*/
function formatHeader(sheet){
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, sheet.getLastColumn()).setFontWeight('bold');
}

/***********************************************************

          Automatic API Interface Functions

***********************************************************/

/**
* Creates a new sheet containing article information from the
* URL on the "URLs" sheet that the user selected.
*/
function getArticlesInfo_() {
  getInfo_('article');
}

/**
* Creates a new sheet containing product information from the
* URL on the "URLs" sheet that the user selected.
*/
function getProductsInfo_() {
  getInfo_('product');
}

/**
* Creates a new sheet containing analysis from the
* URL on the "URLs" sheet that the user selected.
*/
function getAnalyzeInfo_() {
  getInfo_('analyze');
}

/**
* Creates a new sheet containing frontpage information from the
* URL on the "URLs" sheet that the user selected.
*/
function getFrontpageInfo_() {
  getInfo_('frontpage');
}

/**
* Creates a new sheet containing image information from the
* URL on the "URLs" sheet that the user selected.
*/
function getImageInfo_() {
  getInfo_('image');
}

/**
* Creates a new sheet containing information from the
* URL on the "URLs" sheet that the user selected.
*/
function getInfo_(api) {
  var spreadsheet = SpreadsheetApp.getActive();
  var urlSheet = spreadsheet.getActiveSheet();
  urlSheet.activate();
  
  var rowNumber = 2; // Treat first row as header.
  
  // Create a new sheet and append the information in the article.
  var sheetName = api + ' information';
  var apiSheet = spreadsheet.getSheetByName(sheetName);
  if (apiSheet) {
    apiSheet.clear();
    apiSheet.activate();
  } else {
    apiSheet = spreadsheet.insertSheet(sheetName, spreadsheet.getNumSheets());
  }

  // Set the header of sheet  
  var header = [];
  var h = getSheetHeaders_(api);
  header.push( h );
  apiSheet.getRange(1, 1, 1, h.length).setValues( header ); 
  formatHeader(apiSheet);
  
  for(var i=rowNumber; i<=urlSheet.getLastRow(); i++)
  {
    var newRows = [];
    var rowsWithError = [];
  
    // Retrieve the URL in that row.
    var row = urlSheet.getRange(i, 1, 1, 2);
    var rowValues = row.getValues();
    var url = rowValues[0][0];
    var arr = [];
    
    if (!url) {
      newRows.push( getSheetApiErrRow_(api, 'Invalid URL.', i) );
      rowsWithError.push(newRows.length);
    } else {
      var obj;
      
      try{
        // Get the information.
        obj = callAPI_(url, api);
      } catch(err) {
        obj.error = err;
        obj.errorCode = '';
      }
      
      if(obj.error!=undefined) {
        // There is an error returned from API
        newRows.push( getSheetApiErrRow_(api, obj, i) );
        rowsWithError.push(newRows.length);
      } else {
        // Add the info in table returned from the API.
        arr = getObjVals_(api, obj);
        newRows.push( arr );
      }
    }
    
    // Insert data in target sheet
    apiSheet.getRange(i, 1, 1, arr.length).setValues(newRows); 
    SpreadsheetApp.flush();
  }

  // Format the sheet  
  autoResizeCols(apiSheet);
  var stepsRange = apiSheet.getDataRange().offset(1, 0, apiSheet.getLastRow() - 1);
  setAlternatingRowBackgroundColors_(stepsRange, '#ffffff', '#eeeeee');
  highlightErrorRows(apiSheet, rowsWithError);
  SpreadsheetApp.flush();
}

/**
* A shared helper function used to obtain the full set of
* information from URL. Uses the Apps Script DiffBot API.
*
* @param {String} url The URL.
* @param {String} api The API to call.
* @return {Object} The response object.
*/
function callAPI_(url, api) {
  var obj;
  var token = UserProperties.getProperty('DeveloperToken');	// Developer token
  
  if(token == null || token.length == 0){
    throw 'Invalid or empty Developer Token.';
  }
  
  var fields = [];  // TODO: get the fields from configuration
  
  // Call the diffbot client
  var jsonstr = diffbot(url, token, api, fields);
  
  if(jsonstr != null){
    // convert json string to javascript object
    obj = JSON.parse(jsonstr);
  } else {
    throw 'Unable to retrieve article from that URL.';
  }
  
  return obj;
}

/***********************************************************

          CrawlBot API Interface Functions
          
***********************************************************/

/**
* A shared helper function used to obtain the full set of
* information from URL. Uses the Apps Script DiffBot Crawlbot API.
*
* @param {String} url The URL.
* @param {String} api The API to call.
* @return {Object} The response object.
*/
function callCrawlAPI_(command, seeds) {
  var obj;
  var token = UserProperties.getProperty('DeveloperToken');	// Developer token
  
  if(token == null || token.length == 0){
    throw 'Invalid or empty Developer Token.';
  }
  
  // Remove spaces from spreadsheet name and use it as crawl job name
  var name = SpreadsheetApp.getActive().getName().replace(/\s+/g, '');
  
  // Call the diffbot client
  var jsonstr = diffbot_crawl( token, name, command, seeds );
  
  if(jsonstr != null){
    // convert json string to javascript object
    obj = JSON.parse(jsonstr);
  } else {
    throw 'Unable to ' + command + ' crawler.';
  }
  
  return obj;
}

/**
* Shows Crawler Stats
*/
function statusCrawler_() {
  crawlInfo_('status');
}

/**
* Starts Crawler
*/
function startCrawler_() {
  crawlInfo_('start');
}

/**
* Pause Crawler
*/
function pauseCrawler_() {
  crawlInfo_('pause');
}

/**
* Resume Crawler
*/
function resumeCrawler_() {
  crawlInfo_('resume');
}

/**
* Restart Crawler
*/
function restartCrawler_() {
  crawlInfo_('restart');
}

/**
* Delete Crawler
*/
function deleteCrawler_() {
  crawlInfo_('delete');
}

/**
* Shows URLs for Crawler Result in CSV & JSON format
*/
function downloadCrawlerResult_() {
  
  var token = UserProperties.getProperty('DeveloperToken');
  var name = SpreadsheetApp.getActive().getName().replace(/\s+/g, '');
  
  var url = "http://api.diffbot.com/v2/crawl/download/"+token+"-"+name+"_urls.csv";
  var json = "http://api.diffbot.com/v2/crawl/download/"+token+"-"+name+"_data.json";
  
  Browser.msgBox('Download', 
                 'Copy & paste following links to download data.\nFor JSON data:\n' + json + ' .\nFor URL data:\n' + url, 
                 Browser.Buttons.OK);
}

/**
* Runs the Crawl command.
*/
function crawlInfo_(command) {
  var spreadsheet = SpreadsheetApp.getActive();
  var urlSheet = spreadsheet.getActiveSheet();
  urlSheet.activate();
  
  var rowNumber = 2; // Treat first row as header.
  
  var seeds = [];
  
  for(i=rowNumber; i<=urlSheet.getLastRow(); i++)
  {
    // Retrieve the URL in that row.
    var row = urlSheet.getRange(i, 1, 1, 2);
    var rowValues = row.getValues();
    seeds.push(rowValues[0][0]);
  }
  
  try{
    // Crawl the information.
    var obj = callCrawlAPI_(command, seeds);
    
    var msg;
    if(obj.response != undefined) {
      msg = obj.response;
    } else if(obj.jobs[0] != undefined) {
      msg = obj.jobs[0].jobStatus.message;
    }
    
    Browser.msgBox('Success', msg, Browser.Buttons.OK);
  } catch(err) {
    Browser.msgBox('Error', err, Browser.Buttons.OK);
  }
}

/***********************************************************

          Helper Functions
          
***********************************************************/


/**
* Helper function: Returns array of sheet headers to set based on API to call
*/
function getSheetHeaders_(api){
  var arr;
  
  switch(api){
    case 'article':
      arr = ['URL', 'Title', 'Author', 'Date', 'Language', 'Tags', 'Icon',  
             'Image', 'Links', 'Text'];
      break;
      
    case 'frontpage':
      arr = ['URL', 'Title', 'Icon', 'Item Title', 'Item URL'];
      break;
      
    case 'product':
      arr = ['URL', 'Title', 'Date', 'Human Language', 'Product Title', 
             'Product ID', 'Regular Price', 'Offer Price', 'Save Amount', 
             'Brand', 'Color', 'Image Link', 'Image Caption', 'Product Description'];
      break;
      
    case 'image':
      arr = ['Title', 'URL', 'Album URL', 'Image URL', 'Image Size', 'Mime', 
             'Pixel Width',  'Pixle Height', 'Display Width', 'Display Height'];
      break;
      
      case 'analyze':
      arr = ['Title', 'URL', 'Human Language', 'Type', 'Date Created', 
             'Child Type', 'ID', 'SP', 'Fresh', 'SR', 'Tag Name', 'Image'];
      break;
  }
  
  return arr;
}

/**
* Helper function: Returns array with fields values based on API called
*/
function getObjVals_(api, obj){
  var arr;
  
  switch(api) {
    case 'article':
      arr = [
        obj.url,
        obj.title,
        (obj.author==undefined)?''        :obj.author,
        (obj.date==undefined)?''          :obj.date,
        (obj.humanLanguage==undefined)?'' :obj.humanLanguage,
        (obj.tags==undefined)?''          :obj.tags.join(),
        (obj.icon==undefined)?''          :obj.icon,
        (obj.images==undefined)?''        :obj.images[0].url,
        (obj.links==undefined)?''         :obj.links,
        obj.text
      ];
      break;
      
    case 'frontpage':
      // Find the primary assets
      var title = obj.sections[0].items[0].title;
      var url = obj.sections[0].items[0].url;
      
      for(i=0; i<obj.sections.length; i++) {
        if(obj.sections[i].primary == true) {
          title = obj.sections[i].items[0].title;
          url   = obj.sections[i].items[0].url;
          break;
        }
      }
      
      arr = [
        obj.url,
        obj.title,
        (obj.icon==undefined)?'' :obj.icon,
        (title==undefined)?''    :title,
        (url==undefined)?''      :url
      ];
      break;
      
    case 'product':
      // Find the primary assets
      var link    = obj.products[0].media[0].link;
      var caption = obj.products[0].media[0].caption;
      
      for(i=0; i<obj.products[0].media.length; i++) {
        if(obj.products[0].media[i].primary == true) {
          link    = obj.products[0].media[i].link;
          caption = obj.products[0].media[i].caption;
          break;
        }
      }
      
      arr = [
        obj.url,
        (obj.title==undefined)?'':obj.title,
        (obj.date_created==undefined)?'':obj.date_created,
        (obj.human_language==undefined)?'':obj.human_language,
        (obj.products[0].title==undefined)?'':obj.products[0].title,
        (obj.products[0].productId==undefined)?'':obj.products[0].productId,
        (obj.products[0].regularPrice==undefined)?'':obj.products[0].regularPrice,
        (obj.products[0].offerPrice==undefined)?'':obj.products[0].offerPrice,
        (obj.products[0].saveAmount==undefined)?'':obj.products[0].saveAmount,
        (obj.products[0].brand==undefined)?'':obj.products[0].brand,
        (obj.products[0].color==undefined)?'':obj.products[0].color.join(),
        link,
        caption,
        (obj.products[0].description==undefined)?'':obj.products[0].description
      ];
      break;
      
    case 'image':
      arr = [
        obj.title,
        obj.url,
        (obj.albumUrl==undefined)?'':obj.albumUrl,
        (obj.images[0].url==undefined)?''           :obj.images[0].url,
        (obj.images[0].size==undefined)?''          :obj.images[0].size,
        (obj.images[0].mime==undefined)?''          :obj.images[0].mime,
        (obj.images[0].pixelWidth==undefined)?''    :obj.images[0].pixelWidth,
        (obj.images[0].pixelHeight==undefined)?''   :obj.images[0].pixelHeight,
        (obj.images[0].displayWidth==undefined)?''  :obj.images[0].displayWidth,
        (obj.images[0].displayHeight==undefined)?'' :obj.images[0].displayHeight
      ];
      break;
      
    case 'analyze':
      arr = [
        obj.title,
        obj.url,
        obj.human_language,
        obj.type,
        (obj.date_created==undefined)?'':obj.date_created,
        (obj.childNodes==undefined)?'':(obj.childNodes[0].type==undefined)?''    :obj.childNodes[0].type,
        (obj.childNodes==undefined)?'':(obj.childNodes[0].id==undefined)?''      :obj.childNodes[0].id,
        (obj.childNodes==undefined)?'':(obj.childNodes[0].sp==undefined)?''      :obj.childNodes[0].sp,
        (obj.childNodes==undefined)?'':(obj.childNodes[0].fresh==undefined)?''   :obj.childNodes[0].fresh,
        (obj.childNodes==undefined)?'':(obj.childNodes[0].sr==undefined)?''      :obj.childNodes[0].sr,
        (obj.childNodes==undefined)?'':(obj.childNodes[0].tagName==undefined)?'' :obj.childNodes[0].tagName,
        (obj.childNodes==undefined)?'':(obj.childNodes[0].img==undefined)?''     :obj.childNodes[0].img
      ];
      break;
  }
  
  return arr;
}

/**
* Helper function: Returns array indicating error returned from API called
*/
function getSheetApiErrRow_(api, obj, row){
  var arr;
  var errorCode;
  var error;
  
  if(obj.errorCode!=undefined) {
    errorCode = obj.errorCode;
  }
  
  if(obj.error!=undefined) {
    error = obj.errorCode;
  } else {
    error = obj;
  }
  
  switch(api){
    case 'article':
      arr = ['Error at row ' + row + ': ' + errorCode + ' - ' + error, 
             '', '', '', '', '', '', '', '', ''];
      break;
      
    case 'frontpage':
      arr = ['Error at row ' + row + ': ' + errorCode + ' - ' + error,
            '', '', '', ''];
      break;
      
    case 'product':
      arr = ['Error at row ' + row + ': ' + errorCode + ' - ' + error,
            '', '', '', '', '', '', '', '', '', '', '', '', ''];
      break;
      
    case 'image':
      arr = ['Error at row ' + row + ': ' + errorCode + ' - ' + error,
            '', '', '', '', '', '', '', '', ''];
      break;
      
    case 'analyze':
      arr = ['Error at row ' + row + ': ' + errorCode + ' - ' + error,
            '', '', '', '', '', '', '', '', '', '', ''];
      break;
  }
  
  return arr;
}

