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
