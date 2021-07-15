var url = location.href;
var s = url.indexOf('?code=') + 6;
var code = url.substring(s);

var request = new XMLHttpRequest();
request.open('POST', 'https://api.trakt.tv/oauth/token');
request.setRequestHeader('Content-Type', 'application/json');
request.onreadystatechange = function () {
	if (this.readyState === 4) {
		// console.log('Status:', this.status);
		// console.log('Headers:', this.getAllResponseHeaders());
		// console.log('Body:', this.responseText);
		var body = JSON.parse(this.responseText);
		console.log(body);
		localStorage.setItem('access_token', body['access_token']);
		localStorage.setItem('refresh_token', body['refresh_token']);
		localStorage.setItem('date', new Date().getTime());
		// let settingItem = browser.storage.local.set({
		// 	'access_token': body['access_token'],
		// 	'refresh_token': body['refresh_token'],
		// 	'date': new Date().getTime()
		// });
		location.href = 'index.html';
	}
};
var authlink = 'https://turquoise-turtle.github.io/scrobble/auth.html';
var body = {
	'code': code,
	'client_id': '36972228e7adee83436c7b32d4cac424cea0c030445512428c45508bf1c3e7dc',
	'client_secret': '25e40712ee36359ab952b11620ef6ee6be29578a8219fa6e47f2046e6038ac20',
	'redirect_uri': authlink,
	'grant_type': 'authorization_code'
};
request.send(JSON.stringify(body));