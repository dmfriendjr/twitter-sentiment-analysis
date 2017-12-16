let popularTweetData = $('#popular-tweets').text();
let database = firebase.database();

function getRecentSearches() {
	database.ref('recentSearches').once('value').then(function(snapshot) {
		let searches = snapshot.val();
		for (let i = 0; i < searches.length; i++) {
			let newButton = $('<button>', {
				'class': 'btn btn-primary',
				'data-query': searches[i].searchTerm,
				text: searches[i].searchTerm,
				click: (event) => {
				}
			});
	

			$('#recent-searches').append(newButton);
		}
	})
}

function doTwitterSearch(searchTerm, searchType) {
	$.ajax({
		method: 'GET',
		url: `https://twitter-trending-analysis.herokuapp.com/tweets/?q=${searchTerm}?t=${searchType}`,
	}).done( (response) => {
		let targetHTML = searchType === 'popular' ? document.getElementById('popular-tweets') : document.getElementById('recent-tweets');
		processTweetResults(JSON.parse(response),targetHTML);
	});
}

function getTrendingTopics() {
	$.ajax({
		method: 'GET',
		url: `https://twitter-trending-analysis.herokuapp.com/trending/?id=1`,
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
				this.doTwitterSearch( $(event.target).text(), 'popular');
				this.doTwitterSearch( $(event.target).text(), 'recent');				
			}
		});

		targetDiv.append(newButton);
	}
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

function processTweetResults(response,targetHTML) {
	this.searchResults = [];
	let displayTweets = 0;
	let displayedTweetIds = [''];
	
	for (let i = 0; i < response.statuses.length; i++) {
		if (response.statuses[i].hasOwnProperty('retweeted_status')) {
			if (displayedTweetIds.indexOf(response.statuses[i].retweeted_status.id_str) === -1) {
				this.searchResults.push(response.statuses[i].retweeted_status.full_text);
				if (displayTweets < 25) {
					displayTweets++;
					displayedTweetIds.push(response.statuses[i].retweeted_status.id_str);
					this.displayTweet(targetHTML,response.statuses[i].retweeted_status.id_str);
				}

			}
		} else {
			this.searchResults.push(response.statuses[i].full_text);
			displayedTweetIds.push(response.statuses[i].id_str);
			if (displayTweets < 25) {
				displayTweets++;
				this.displayTweet(targetHTML,response.statuses[i].id_str);
			}
		}

	}

	$('#popular-div').attr('style', 'visibility: visible');
	$('#recent-div').attr('style', 'visibility: visible');
	//$('#recent-div').show();
	this.doSentimentAnalysis(searchResults);
}



$(document).ready(() => {
	this.getRecentSearches();
	this.getTrendingTopics();	
});

function doSentimentAnalysis(searchResults)
{
	for (let i = 0; i < searchResults.length; i++) {
		let form = new FormData();
		form.append("text", searchResults[i]);

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
		  "data": form
		}

		$.ajax(settings).done(function (response) {
		  //console.log(response);
		});
	
	}	
}


$('#location-search-submit-btn').on('click', (event) => {
	event.preventDefault();
	let searchTerm = $('#location-search-input').val();
	database.ref('recentSearches').push({searchTerm});
	$('#location-search-input').val('');
	doTwitterSearch(searchTerm, 'popular');
	doTwitterSearch(searchTerm, 'recent');
});
