var form = new FormData();
form.append("text", "It's snowing ");

var settings = {
  "async": true,
  "crossDomain": true,
  "url": "https://text-sentiment.p.mashape.com/analyze",
  "method": "GET",
  "headers": {
    "x-mashape-key": "JahSDCynJfmsh9D7aDmHnI63qsDYp1047atjsnvuyr2AKu7PPa",
    "cache-control": "no-cache",
    "postman-token": "a465ddc2-58b0-e8e2-efa1-6d7ab098e039"
  },
  "processData": false,
  "contentType": false,
  "mimeType": "multipart/form-data",
  "data": form
}

$.ajax(settings).done(function (response) {
  console.log(response);
});

//Twitter API

//Create Base64 encoded token from concatenated consumerKey:consumerSecretKey
var encodedKey = btoa(`${twitterConsumerKey}:${twitterConsumerSecretKey}`);

function getTwitterTokenCredentials(encodedKey) {
	$.ajax({
		method: 'POST',
		url: `https://api.twitter.com/oauth2/token`,
		headers: {
			Authorization: `Basic ${encodedKey}`,
			contentType: `application/x-www-form-urlencoded;charset=UTF-8.`
		},
		body: {
			grant_type: `client_credentials`
		}
	}).done( (response) => {});
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

//Event listeners
$('#location-search-submit-btn').on('click', (event) => {
	//Get input value
	let inputText = $('location-search-input').val();
	doGeocodingRequest(inputText);
});
