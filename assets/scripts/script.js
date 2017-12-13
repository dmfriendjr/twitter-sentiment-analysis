let popularTweetData = $('#popular-tweets').text();

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
var twitterKey = `ccCypGNN8sTabjkCLsWUt9EGk`;

$('#location-search-submit-btn').on('click', (event) => {
	//Get input value
	let inputText = $('location-search-input').val();
	doGeocodingRequest(inputText);
});

function doGeocodingRequest(location) {
	var requestUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${location}&key=${googleGeocodeKey}`;

	$.ajax({
		method: 'GET',
		url: requestUrl
	}).done((response) => {
		console.log(response);
	});
}

