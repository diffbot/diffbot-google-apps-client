/**
*	Google Apps Scripts Client library for DiffBot APIs
*
*	@author: Muhammad Jawaid Shamshad (jawaid@ibexoft.com | twitter.com/mjawaids | https://www.odesk.com/users/~0183c6e9ca72bf13c9)
*	@version: 1.0
*/

/**
*	Calls specified Automatic API of DiffBot and return its result as JSON
*
*	@param {string}  url 	 Article URL to process
*	@param {string}  token 	 Developer Token
*	@param {string}  api 	 API to call
*	@param {array}   fields  Used to control which fields are returned by the API
*	@param {number}  version Version of API
*	@return {json string} or {null}
*	
*/
function diffbot( url, token, api, fields, version )
{
  // Set default value for version if not passed
  version = typeof version !== 'undefined' ? version : 2;
  var fieldsqs = ((fields==undefined || fields.length==0)?'*':fields.join());
  
  var apiURL   = "http://api.diffbot.com/v"+version+"/" + api;
  var args     = "token=" + token + "&url=" + encodeURI(url);
  var endpoint = apiURL + "?" + args;// + "&fields=" + fieldsqs + "&all=*";
  
  var response = UrlFetchApp.fetch(endpoint);
  
  return response.getContentText();
}

/**
*	Calls specified Crawlbot API of DiffBot and return its result as JSON
*
*	@param {string}  token 	 Developer Token
*	@param {string}  name 	 Name of crawl job
*	@param {string}  command Command to start, pause, resume, restart, delete
*	@param {array}   seeds   Array of URLs to crawl
*	@param {string}  apiUrl  URL of DiffBot Automatic API to call
*	@param {number}  version API version to call
*	@return {json string} or {null}
*	
*/
function diffbot_crawl( token, name, command, seeds, apiUrl, version )
{
  // Set default value for version if not passed
  version = typeof version !== 'undefined' ? version : 2;
  
  var apiURL   = "http://api.diffbot.com/v"+version+"/crawl";
  var args     = "token=" + token + "&name=" + name;
  var endpoint = apiURL + "?" + args;
  
  switch(command) {
    case 'start':
      if(Array.isArray(seeds)) {
        seeds = seeds.join(' ');
      }
      
      // if apiUrl is not provided set to auto mode
      if(apiUrl == undefined) {
        apiUrl = "http://api.diffbot.com/v2/analyze?mode=auto";
      }
      endpoint += "&seeds=" + encodeURI(seeds) + "&apiUrl=" + encodeURI(apiUrl);
      break;
      
    case 'pause':
      endpoint += "&pause=1";
      break;
      
    case 'resume':
      endpoint += "&pause=0";
      break;
      
    case 'restart':
      endpoint += "&restart=1";
      break;
      
    case 'delete':
      endpoint += "&delete=1";
      break;
      
    case 'download':
      endpoint = apiURL + "/download/" + token + "-" + name + "_urls.json";
      break;
  }
  
  var response = UrlFetchApp.fetch(endpoint);
  return response.getContentText();
}