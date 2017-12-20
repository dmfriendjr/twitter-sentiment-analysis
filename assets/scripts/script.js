let popularTweetData = $('#popular-tweets').text();
let database = firebase.database();
           		
let parsedRecentNegative = new Array();
let parsedRecentPositive = new Array();
let parsedRecentNeutral = new Array();
let parsedPopularNegative = new Array();
let parsedPopularPositive = new Array();
let parsedPopularNeutral = new Array();

let totalPopularResults = 0;
let totalRecentResults = 0;
let popularResponsesRecieved = 0;
let recentResponsesRecieved = 0;
let recentPosPercent;
let recentNegPercent;
let recentNeutralPercent;
let popularPosPercent;
let popularNegPercent;
let popularNeutralPercent;
let isSearchOngoing = false;
let popularResultsFound = true;
let recentResultsFound = true;
let recentResultsCalculated = false;
let popularResultsCalculated = false;


function updateSearchesDatabase(searchTerm) {

	database.ref('recentSearches').once('value', (snapshot) => {
		if (snapshot.exists()) {
		//Convert JSON to array
		let searchArray = Object.values(snapshot.val());
		//Check if search term exists anywhere in children
		let searchExists = false;	
		for (var key in searchArray) {
			if (searchArray[key].searchTerm === searchTerm) {
				searchExists = true;
			}
		}

		if (!searchExists) {
			//Remove results at beginning until there are only 4
			while(searchArray.length > 4) {
				searchArray.shift();
			}
			
			//Stringify array, parse string, set database
			database.ref('recentSearches').set(JSON.parse(JSON.stringify(searchArray)));	

			//Push new search term to database
			database.ref('recentSearches').push({searchTerm});
		}
		
		}
	});	
}

function displayRecentSearches(snapshot) {
	let searches = snapshot.val();
	$('#recent-searches').empty();
	for (var key in searches) {
		if (searches.hasOwnProperty(key)) {
			let newButton = $('<span>', {
				'data-query': searches[key].searchTerm,
				'class': 'recent-search-link',
				text: decodeURIComponent(searches[key].searchTerm),
				click: (event) => {
					this.doTwitterSearch($(event.target).data('query'));
				}
			});

			$('#recent-searches').append(newButton);				
		}
	}
}

function doWOEIDRequest(locationSearch) {
	$.ajax({
		method: 'GET',
		url: `https://query.yahooapis.com/v1/public/yql?q=select%20woeid%20from%20geo.places(1)%20where%20text%3D%22${locationSearch}%22&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys`
	}).done((response) => {
		if (response.query.results !== null) {
			this.getTrendingTopics(response.query.results.place.woeid);
		}
	});
}

function getTrendingTopics(woeid) {
	$.ajax({
		method: 'GET',
		url: `https://twitter-trending-analysis.herokuapp.com/trending/?id=${woeid}`,
	}).done( (response) => {
		displayTrendingTopics(JSON.parse(response));	
	});
}

function displayTrendingTopics(response) {
	response = response[0].trends;

	let targetDiv = $('#trending-topics');
	targetDiv.empty();
	for (let i = 0; i < response.length; i++) {
		let newButton = $('<button>', {
			'class': 'btn btn-secondary',
			'data-query': response[i].query,
			text: response[i].name,
			click: (event) => {
				this.doTwitterSearch( $(event.target).text());
			}
		});

		targetDiv.append(newButton);
	}
}

function doTwitterSearch(searchTerm) {
	$('#sentiment-div').attr('style', 'visibility: visible');	
	$('#overall-sentiment').attr('style', 'visibility: hidden');
	$('#loading-icon').attr('style', 'visibility: visible');	
	this.updateSearchesDatabase(searchTerm);
	this.doTwitterRequest(searchTerm, 'popular');
	this.doTwitterRequest(searchTerm, 'recent');
}

function doTwitterRequest(searchTerm, searchType) {
	if (isSearchOngoing)
		return;

	if (searchType === 'recent') {
		isSearchOngoing = true;
	}
	
	popularResultsFound = true;
	recentResultsFound = true;


	//Reset sentiment variables
	recentResultsCalculated = false;
	popularResultsCalculated = false;
	totalPopularResults = 0;
	totalRecentResults = 0;
	popularResponsesRecieved = 0;
	recentResponsesRecieved = 0;

	parsedRecentNegative = new Array();
	parsedRecentPositive = new Array();
	parsedRecentNeutral = new Array();

	parsedPopularNegative = new Array();
	parsedPopularPositive = new Array();
	parsedPopularNeutral = new Array();

	$('#overall-sentiment').empty();

	$.ajax({
		method: 'GET',
		url: `https://twitter-trending-analysis.herokuapp.com/tweets/?q=${searchTerm}&t=${searchType}`,
	}).done( (response) => {
		let targetHTML = searchType === 'popular' ? document.getElementById('popular-tweets') : document.getElementById('recent-tweets');
		processTweetResults(JSON.parse(response),targetHTML);
	});
}

function processTweetResults(response,targetHTML) {
	this.searchResults = [];
	let displayTweets = 0;
	let displayedTweetIds = [];
	
	//Empty any old tweets
	$(targetHTML).empty();

	if ($(targetHTML).attr('id') === 'recent-tweets') {
		if (response.statuses.length === 0) {
			recentResultsFound = false;
		}
	} else {
		if (response.statuses.length === 0) {
			popularResultsFound = false;
		}
	}

	if (popularResultsFound === false && recentResultsFound === false) {
		isSearchOngoing = false;
	}

	if (response.statuses.length === 0){
		$(targetHTML).append('<p>No Results</p>');
	}

	for (let i = 0; i < response.statuses.length; i++) {
		//If retweeted, display the retweeted status instead
		if (response.statuses[i].hasOwnProperty('retweeted_status')) {
			//Don't display duplicate retweets
			if (displayedTweetIds.indexOf(response.statuses[i].retweeted_status.id_str) === -1) {
				this.searchResults.push(response.statuses[i].retweeted_status.full_text);
				//Only display up to 25 tweets
				if (displayTweets < 25) {
					displayTweets++;
					displayedTweetIds.push(response.statuses[i].retweeted_status.id_str);
					this.displayTweet(targetHTML,response.statuses[i].retweeted_status.id_str);
				}

			}
		//Display original tweet
		} else {
			this.searchResults.push(response.statuses[i].full_text);
			displayedTweetIds.push(response.statuses[i].id_str);
			//Only display up to 25 tweets			
			if (displayTweets < 25) {
				displayTweets++;
				this.displayTweet(targetHTML,response.statuses[i].id_str);
			}
		}

	}

	$('#popular-div').attr('style', 'visibility: visible');
	$('#recent-div').attr('style', 'visibility: visible');
	this.doSentimentAnalysis(searchResults, $(targetHTML).attr('id'));
}

function displayTweet(targetHTML, tweetId) {
	twttr.widgets.createTweet(tweetId,targetHTML,
		{
		 align: 'left'
		})
	  	.then(function (el) {
			twttr.widgets.load();
	 	});	
}



function doSentimentAnalysis(searchResults, targetHTMLId)
{
	if (targetHTMLId === 'popular-tweets') {
		totalPopularResults = searchResults.length;
	} else {
		totalRecentResults = searchResults.length;
	}
	totalResults = searchResults.length;
	let sentimentObject=[];
	for (let i = 0; i < searchResults.length; i++) {
		let form = new FormData();
		form.append("text", encodeURIComponent(searchResults[i]));
		let settings = {
		  "async": true,
		  "crossDomain": true,
		  "url": "https://text-sentiment.p.mashape.com/analyze",
		  "method": "POST",
		  "headers": {
		    "x-mashape-key": "JahSDCynJfmsh9D7aDmHnI63qsDYp1047atjsnvuyr2AKu7PPa",
		    "cache-control": "no-cache",
		    "postman-token": "11b32391-b270-ed47-09d3-94474d4f94c4"
		  },
		  "processData": false,
		  "contentType": false,
		  "mimeType": "multipart/form-data",
		  "data": form,
			"searchType": targetHTMLId 
		}

		$.ajax(settings).done(function (response, targetHTMLId) {
		    let sentimentObject = (JSON.parse(response));
			
			if (this.searchType === 'popular-tweets') {
				popularResponsesRecieved++;

				parsedPopularNegative.push(parseFloat(sentimentObject["neg_percent"]));
				parsedPopularPositive.push(parseFloat(sentimentObject["pos_percent"]));
				parsedPopularNeutral.push(parseFloat(sentimentObject["mid_percent"]));

				if (popularResponsesRecieved >= totalPopularResults) {
						
					popularPosPercent = parsedPopularPositive.reduce((pv, cv) => pv+cv, 0) / popularResponsesRecieved;
					popularNegPercent = parsedPopularNegative.reduce((pv, cv) => pv+cv, 0) / popularResponsesRecieved;
					popularNeutralPercent = parsedPopularNeutral.reduce((pv, cv) => pv+cv, 0) / popularResponsesRecieved;	

					displaySentiment('Popular Results', popularPosPercent, popularNegPercent, popularNeutralPercent);


					popularResultsCalculated = true;
				}
			} else {
				recentResponsesRecieved++;

				parsedRecentNegative.push(parseFloat(sentimentObject["neg_percent"]));
				parsedRecentPositive.push(parseFloat(sentimentObject["pos_percent"]));
				parsedRecentNeutral.push(parseFloat(sentimentObject["mid_percent"]));	

				if (recentResponsesRecieved >= totalRecentResults) {
					recentPosPercent = parsedRecentPositive.reduce((pv, cv) => pv+cv, 0) / recentResponsesRecieved;
					recentNegPercent = parsedRecentNegative.reduce((pv, cv) => pv+cv, 0) / recentResponsesRecieved;
					recentNeutralPercent = parsedRecentNeutral.reduce((pv, cv) => pv+cv, 0) / recentResponsesRecieved;	

					displaySentiment('Recent Results', recentPosPercent, recentNegPercent, recentNeutralPercent);

					recentResultsCalculated = true;
				}
			}

			if (popularResultsCalculated && recentResultsCalculated) {
				let overallPos = (popularPosPercent + recentPosPercent) / 2;
				let overallNeg = (popularNegPercent + recentNegPercent) / 2;
				let overallNeutral = (popularNeutralPercent + recentNeutralPercent) / 2;

				displaySentiment('Overall', overallPos, overallNeg, overallNeutral);
				isSearchOngoing = false;
				$('#overall-sentiment').attr('style', 'visibility: visible');
				$('#loading-icon').attr('style', 'visibility: hidden');
			}
		});			

	}				
}

function displaySentiment(title, positive, negative, neutral) {
	$('#overall-sentiment').append(`
		<div class="sentiment-results">
			<h4>${title}:</h4>
			<span>Positive: ${positive.toFixed(2)}%</span>
			<span>Negative: ${negative.toFixed(2)}%</span>
			<span>Neutral: ${neutral.toFixed(2)}%</span>
		</div>
	`);
}
			             	
$(document).ready(() => {
	//Search USA as default for trending topics
	this.getTrendingTopics('23424977');
});

database.ref('recentSearches').on('value', (snapshot) => {
	this.displayRecentSearches(snapshot);	
});

$('#trending-search-submit-btn').on('click', (event) => {
	event.preventDefault();
	let searchTerm = $('#trending-search-input').val();
	searchTerm = searchTerm.trim();
	if (searchTerm.length > 0) {
		//Encode special characters into escape codes and do search
		this.doTwitterSearch(encodeURIComponent(searchTerm));
	}
});

$('#location-search-submit-btn').on('click', (event) => {
	event.preventDefault();
	let location = $('#location-search-input').val();
	this.doWOEIDRequest(encodeURIComponent(location));
});

$('#trending-search-input').on('click', (event) => {
	$(event.target).val('');
});

$('#location-search-input').on('click', (event) => {
	$(event.target).val('');
});
