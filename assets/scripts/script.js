let popularTweetData = $('#popular-tweets').text();
let searchResults;
console.log('popularTweetData', popularTweetData);

let form = new FormData();
form.append("text", popularTweetData);

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


var googleGeocodeKey = `AIzaSyDg1N8wtIIuCBZNZlqOMB7sVCKTYxMZIpY`;


function doTwitterSearch(searchTerm, searchType) {
	$.ajax({
		method: 'GET',
		url: `https://twitter-trending-analysis.herokuapp.com/tweets/?q=${searchTerm}?t=${searchType}`,
	}).done( (response) => {
		processTweetResults(JSON.parse(response));
	});
}

function processTweetResults(response) {
	this.searchResults = [];
	console.log(response);
	for (let i = 0; i < response.statuses.length; i++) {
		if (response.statuses[i].retweeted === false) {
			let newTweet = response.statuses[i].full_text;
			this.searchResults.push(response.statuses[i].full_text);
		}
	}
}

//Google Geocoding API
function doGeocodingRequest(location) {
	var requestUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${location}&key=${googleGeocodeKey}`;

	$.ajax({
		method: 'GET',
		url: requestUrl
	}).done((response) => {
		console.log(response);
	});
}


$('#location-search-submit-btn').on('click', (event) => {
	doTwitterSearch($('#location-search-input', 'popular').val());
});
