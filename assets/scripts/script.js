let popularTweetData = $('#popular-tweets').text();




function doTwitterSearch(searchTerm, searchType) {
	$.ajax({
		method: 'GET',
		url: `https://twitter-trending-analysis.herokuapp.com/tweets/?q=${searchTerm}?t=${searchType}`,
	}).done( (response) => {
		processTweetResults(JSON.parse(response));
	});
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

function processTweetResults(response) {
	this.searchResults = [];
	let displayTweets = 0;
	console.log(response);
	let displayedTweetIds = [''];
	
	for (let i = 0; i < response.statuses.length; i++) {


		if (response.statuses[i].hasOwnProperty('retweeted_status')) {
			if (displayedTweetIds.indexOf(response.statuses[i].retweeted_status.id_str) !== -1) {
				console.log('List contains id already', displayedTweetIds);
			} else {
				this.searchResults.push(response.statuses[i].retweeted_status.full_text);			
				displayedTweetIds.push(response.statuses[i].retweeted_status.id_str);
				this.displayTweet(document.getElementById('recent-tweets'),response.statuses[i].retweeted_status.id_str);
			}
		} else {
			this.searchResults.push(response.statuses[i].full_text);

			if (displayTweets < 25) {
				displayTweets++;
				this.displayTweet(document.getElementById('popular-tweets'),response.statuses[i].id_str);
			}
		}

	}

let form = new FormData();
form.append("text", searchResults);

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
  console.log(response);
});
}

$('#location-search-submit-btn').on('click', (event) => {
	doTwitterSearch($('#location-search-input').val(), 'popular');
});
