// browser.storage.local.get({
	// 'access_token': false,
var accToken = localStorage.getItem('SCROBBLEaccess_token') || false;
	// 'date': new Date().getTime()
var accDate = localStorage.getItem('SCROBBLEdate') || new Date().getTime();
accDate = parseInt(accDate);
// }).then(function(e) {
	// console.log(e);
console.log(accToken, accDate);
	// var ref = new Date(e['date']);
var ref = new Date(accDate);
var check = new Date();
check.setMonth(check.getMonth() - 2);
var refreshNeeded = ref < check;
console.log(ref, check, refreshNeeded);
if (accToken == false) {
	auth();
} else if (refreshNeeded) {
	refresh();
}
// 	if (e['access_token'] == false) {
// 		auth();
// 	} else if (refreshNeeded) {
// 		refresh();
// 	}
// })


//https://api.trakt.tv/oauth/authorize?response_type=code&client_id=
function auth() {
	//var authlink = browser.identity.getRedirectURL();
	var link = 'https://trakt.tv/oauth/authorize?response_type=code&client_id=36972228e7adee83436c7b32d4cac424cea0c030445512428c45508bf1c3e7dc&redirect_uri=https://turquoise-turtle.github.io/scrobble/auth.html';
	location.href = link;
	// var authorizing = browser.identity.launchWebAuthFlow({
	// 	'url': link,
	// 	'interactive': true
	// })
	// .then(function(url){
	// 	var s = url.indexOf('?code=') + 6;
	// 	var code = url.substring(s);

	// 	var request = new XMLHttpRequest();
	// 	request.open('POST', 'https://api.trakt.tv/oauth/token');
	// 	request.setRequestHeader('Content-Type', 'application/json');
	// 	request.onreadystatechange = function () {
	// 		if (this.readyState === 4) {
	// 			// console.log('Status:', this.status);
	// 			// console.log('Headers:', this.getAllResponseHeaders());
	// 			// console.log('Body:', this.responseText);
	// 			var body = JSON.parse(this.responseText);
	// 			console.log(body);
	// 			let settingItem = browser.storage.local.set({
	// 				'access_token': body['access_token'],
	// 				'refresh_token': body['refresh_token'],
	// 				'date': new Date().getTime()
	// 			});
	// 		}
	// 	};
	// 	var body = {
	// 		'code': code,
	// 		'client_id': 
	// 		'client_secret': 
	// 		'redirect_uri': authlink,
	// 		'grant_type': 'authorization_code'
	// 	};
	// 	request.send(JSON.stringify(body));

	// }).catch(console.warn)
}



function needsRefresh() {
	var date = parseInt(localStorage.getItem('SCROBBLEdate'));
	// return browser.storage.local.get(['date'])
	// .then(function(s){
		// var ref = new Date(s['date']);
	var ref = new Date(date);
	var check = new Date();
	check.setMonth(check.getMonth() - 2);
	console.log(ref, check);
	if (ref < check) {
		return refreshToken()
	} else {
		console.log('no refresh needed')
		return false;
	}
	
}

function refreshToken() {
	console.log('refreshing token');
	//return browser.storage.local.get(['refresh_token'])
	var refToken = localStorage.getItem('SCROBBLErefresh_token');
	// .then(function(s){
	console.log(refToken)
	var authlink = 'https://turquoise-turtle.github.io/scrobble/auth.html';
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
			localStorage.setItem('SCROBBLEaccess_token', body['access_token']);
			localStorage.setItem('SCROBBLErefresh_token', body['refresh_token']);
			localStorage.setItem('SCROBBLEdate', new Date().getTime());
			// let settingItem = browser.storage.local.set({
			// 	'access_token': body['access_token'],
			// 	'refresh_token': body['refresh_token'],
			// 	'date': new Date().getTime()
			// });
		}
	};

	var body = {
		'refresh_token': refToken,
		'client_id': '36972228e7adee83436c7b32d4cac424cea0c030445512428c45508bf1c3e7dc',
		'client_secret': '25e40712ee36359ab952b11620ef6ee6be29578a8219fa6e47f2046e6038ac20',
		'redirect_uri': authlink,
		'grant_type': 'refresh_token'
	};

	request.send(JSON.stringify(body));
	
	
}

console.log('popup asdf');

var token = accToken;
var showid = 'g';
var ids = {};
var seasons = false;
var showSeasons = [];
var qS = document.querySelector.bind(document);

function searchshows(showtitle) {

	var url = 'https://api.trakt.tv/search/show?query=' + showtitle;

	makeRequest('GET', url)//, obj, headers)
	.then(function(responseText) {
		//console.log('Status:', this.status);
		//console.log('Headers:', this.getAllResponseHeaders());
		//console.log('Body:', this.responseText);
		var shows = JSON.parse(responseText);
		console.log(shows)
		var li = {};
		var years = {};
		for (var show of shows) {
			console.log(show['score'])
			if (show['score'] > 500) {
				var slug = show['show']['ids']['slug'];
				li[slug] = show['show']['title'];
				var year = show['show']['year'];
				years[slug] = year;
			}
		}
		console.log(li, years, Object.keys(li).length);
		var resultLength = Object.keys(li).length;
		if (resultLength == 1) {
			qS('#searchshow').classList.add('hide');
			var slug = shows[0]['show']['ids']['slug'];
			var title = shows[0]['show']['title']
			qS('#showtitle').textContent = title;
			initiateshow(slug);
			qS('#refine').classList.add('hide');
		} else if (resultLength > 1) {
			qS('#searchshow').classList.add('hide');
			showlist(li, years);
			// qS('#refine').classList.add('hide');
		} else {
			// qS('#notfound').classList.remove('hide');
			searchbox('');
			
		}
	})
}

function showlist(list, years) {
	var select = qS('#sel');
	var box = qS('#selectshows')
	box.style.display = '';
	for (var slug in list) {
		var opt = document.createElement('option');
		opt.value = slug;
		opt.innerText = list[slug] + ' ' + years[slug];
		select.appendChild(opt);
	}
	console.log(select, list);
	var btn = qS('#btn');
	btn.addEventListener('click', function() {
		var slug = select.value;
		box.style.display = 'none';
		var title = select.options[select.selectedIndex].text;
		qS('#showtitle').textContent = title;
		initiateshow(slug);
	})
	
}

function initiateshow(show) {
	
	qS('#showtitle').href = 'https://trakt.tv/shows/' + show;
	window.token = localStorage.getItem('SCROBBLEaccess_token');
	window.showid = show;
	getnextep();
	// browser.storage.local.get('access_token')
	// .then(function(e){
	// 	window.token = e['access_token'];
	// 	window.showid = show;
	// 	getnextep();
	// });
}
function getnextep() {
	console.log('getnextep');
	qS('#watchtick').classList.add('hide');
	qS('#checkintick').classList.add('hide');
	

	// var headers = {
		// 'Authorization': 'Bearer ' + window.token
	// };
	var headers = true;
	var url = 'https://api.trakt.tv/shows/' + window.showid + '/progress/watched?hidden=false&specials=false&count_specials=false&last_activity=watched';
	makeRequest('GET', url, headers)
	.then(function (responseText) {
		var body = JSON.parse(responseText);
		console.log(body)
		console.log(body['next_episode'])

		if (!window.showedSeasons) {
			window.seasons = body['seasons'];
			initiateSelect();
		}

		
		//promisify this
		return new Promise(function(resolve, reject) {
			console.log('promise here')
			if (body['next_episode'] != null) {
				var currentepobj = body['next_episode'];
				resolve(currentepobj);
			} else if (body['reset_at'] != null) {
				//handle rewatching show
				//Your app can adjust the progress by ignoring episodes with a last_watched_at prior to the reset_at.
				resolve(getnexteprewatch(window.showid, body['reset_at'], body['seasons']))

			} else {
				resolve(null);
			}
		})
	}).then(loadEpisode);
}
function loadEpisode(currentepobj) {
	//}).then(function (currentepobj){
		console.log('got here', currentepobj)
		if (currentepobj == null) {
			//no next episode
			qS('#ep').style.display = "";
			qS('#showtitle').classList.remove('hide');
			qS('#eptitle').textContent = 'No Episodes Left';
			for (var actionel of document.getElementsByClassName('action')) {
				actionel.classList.add('hide');
			}

			qS('#scrobble').classList.add('hide');
		} else {
			var episodeids = currentepobj['ids'];
			window.ids = episodeids;
			window.currentepobj = currentepobj;

			var eptitle = currentepobj['title'];
			var epPos = 's' + currentepobj['season'] + 'e' + currentepobj['number'];
			qS('#epnum').textContent = epPos + ': ';
			qS('#eptitle').textContent = eptitle;
			qS('#ep').style.display = "";
			
			qS('#loadingtext').classList.add('hide');
			qS('#showtitle').classList.remove('hide');
			qS('#epnum').classList.remove('hide');
			qS('#eptitle').classList.remove('hide');
			qS('#watchdonut').classList.add('hide');
			qS('#checkindonut').classList.add('hide');
			qS('#watchcheck').classList.remove('hide');
			qS('#checkincheck').classList.remove('hide');
			
			qS('#watch').addEventListener('click', watch);
			qS('#watchcheck').addEventListener('click', watch);
			qS('#check').addEventListener('click', check);
			qS('#checkincheck').addEventListener('click', check);

			//show scrobble bar?
			
			if (currentepobj.runtime == null) {
				var headers = {
					'Authorization': 'Bearer ' + window.token
				};
				var url = 'https://api.trakt.tv/shows/' + window.showid + '/seasons/' + currentepobj['season'] + '/episodes/' + currentepobj['number'] + '?extended=full';
				makeRequest('GET', url, headers)
				.then(function (responseText) {
					var body = JSON.parse(responseText);
					window.currentepobj = body;
					var runtime = body['runtime'];
					var runtimes = runtime * 60;
					qS('#scrobbleslider').max = runtimes;
					qS('#totalTime').innerText = runtime + ':00';
					qS('#scrobbleslider').value = 0;
					qS('#scrobbleTime').innerText = '0:00';
				});
			} else {
				var runtime = currentepobj['runtime'];
				var runtimes = runtime * 60;
				qS('#scrobbleslider').max = runtimes;
				qS('#totalTime').innerText = runtime + ':00';
				qS('#scrobbleslider').value = 0;
				qS('#scrobbleTime').innerText = '0:00';
			}
		}
	//});

}
function getnexteprewatch(slug, resetdate, seasons) {
	console.log('getnexteprewatch')
	var fullep = null;
	for (var season of seasons) {
		for (var ep of season['episodes']) {
			if (ep['last_watched_at'] < resetdate) {
				var sn = season['number'];
				var en = ep['number'];
				fullep = true;
				//set season number and episode number here

				console.log(season, ep);
				break;
			} else {
				console.log('not it')
			}
		}
	}
	console.log(fullep);
	if (fullep != null) {
		//get ep by number
		var url = 'https://api.trakt.tv/shows/' + slug + '/seasons/' + sn + '/episodes/' + en;
		return makeRequest('GET', url)
		.then(function(responseText) {
			var item = JSON.parse(responseText);
			console.log(item)
			return Promise.resolve(item);
		});
	} else {
		return Promise.resolve();
	}
}

// watch = console.log;
// check = console.log;

// console.log(qS('#eptitle'))
// console.log(qS('#watch'))

function watch() {
	var ep = window.ids;
	//loading spinner?
	qS('#watchcheck').classList.add('hide');
	qS('#watchdonut').classList.remove('hide');

	var headers = {
		'Authorization': 'Bearer ' + token
	};
	var d = new Date();
	var n = d.toISOString();
	var req = {
		'episodes': [
			{
				'watched_at': n,
				'ids': ep
			}
		]
	}
	makeRequest('POST', 'https://api.trakt.tv/sync/history', headers, req)
	.then(function(responseText) {
		var body = JSON.parse(responseText);
		console.log(body);
		qS('#watchdonut').classList.add('hide');
		qS('#watchtick').classList.remove('hide');
		refresh();
	});
}

function check() {
	var ep = window.ids;
	qS('#checkincheck').classList.add('hide');
	qS('#checkindonut').classList.remove('hide');

	var headers = {
		'Authorization': 'Bearer ' + token
	};
	var req = {
		'episode': {
			'ids': ep
		}
	}
	makeRequest('POST', 'https://api.trakt.tv/checkin', headers, req)
	.then(function (responseText) {
		var body = JSON.parse(responseText);
		console.log(body);
		qS('#checkindonut').classList.add('hide');
		qS('#checkintick').classList.remove('hide');
		setTimeout(function() {
			window.close();
		}, 1000);
		// refresh();
	});
}

function refresh() {
	qS('#watch').removeEventListener('click', watch);
	qS('#watchcheck').removeEventListener('click', watch);
	qS('#check').removeEventListener('click', check);
	qS('#checkincheck').removeEventListener('click', check);

	qS('#watchcheck').checked = false;
	qS('#checkincheck').checked = false;
	setTimeout(function() {
		console.log('refreshed?');
		qS('#checkincheck').classList.add('hide');
		qS('#checkindonut').classList.remove('hide');
		qS('#watchcheck').classList.add('hide');
		qS('#watchdonut').classList.remove('hide');

		qS('#epnum').classList.add('hide');
		qS('#showtitle').classList.add('hide');
		qS('#eptitle').classList.add('hide');
		qS('#loadingtext').classList.remove('hide');
		console.log(qS('#showtitle'))
		getnextep();
	}, 1000)
}

var hasSearched = false;
function searchbox(pagetitle) {
	qS('#searchshow').classList.remove('hide');
	if (hasSearched) {
		qS('#refine').classList.remove('hide');
		qS('#searchdonut').classList.add('hide');
		qS('#searchbtn').classList.remove('hide');
	} else {
		qS('#showtosearch').value = pagetitle;
		qS('#searchbtn').addEventListener('click', handlesearchbox)
		qS('#showtosearch').addEventListener("keyup", function(event) {
			// Number 13 is the "Enter" key on the keyboard
			if (event.keyCode === 13) {
				event.preventDefault();
				//qS('#searchbtn').click();
				handlesearchbox();
			}
		});
	}

}

function handlesearchbox() {
	hasSearched = true;
	var value = qS('#showtosearch').value;
	searchshows(value);
	qS('#searchdonut').classList.remove('hide');
	qS('#searchbtn').classList.add('hide');
	// qS('#searchshow').classList.add('hide');
}



function makeRequest (method, url, headers, obj) {
	return new Promise(function (resolve, reject) {
		var xhr = new XMLHttpRequest();
		xhr.open(method, url);
		xhr.onload = function () {
			if (this.status >= 200 && this.status < 300) {
				resolve(xhr.responseText);
			} else {
				reject({
					status: this.status,
					statusText: xhr.statusText
				});
			}
		};
		xhr.onerror = function () {
			reject({
				status: this.status,
				statusText: xhr.statusText
			});
		};
		if (headers) {
			// for (var key in headers) {
				// xhr.setRequestHeader(key, headers[key]);
			// }
			console.log(accToken, token);
			token = 'Bearer ' + token;
			xhr.setRequestHeader('Authorization', token);
		}
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.setRequestHeader('trakt-api-version', '2');
		xhr.setRequestHeader('trakt-api-key', '36972228e7adee83436c7b32d4cac424cea0c030445512428c45508bf1c3e7dc');
		if (obj) {
			xhr.send(JSON.stringify(obj))
		} else {
			xhr.send()
		}
	});
}



function progressUpdate() {
	browser.tabs.query({currentWindow: true, active: true})
	.then(function(t) {
		//console.log(t);
		var id = t[0]['id'];
		// console.log(id);
		return browser.tabs.sendMessage(id, {'type':'progress'});
	}).then(function(msg) {
		console.log(msg);
		if (msg['valid']) {
			// searchshows(msg['show'])
			qS('#pr').textContent = msg['progress'] + '%';
			qS('#progress').style.display = '';
		}
	}).catch(console.warn);
}
//qS('#pbtn').addEventListener('click', progressUpdate);


function lbSearchHandler() {
	var value = qS('#showtosearch').value;
	console.log('letterboxd ' + encodeURIComponent(value));
	window.open('https://letterboxd.com/search/' + encodeURIComponent(value) + '/');
}
qS('#lbBtn').addEventListener('click', lbSearchHandler);


var params = new URLSearchParams(document.location.search.substring(1));
var separate = params.get("separate");
// if (separate != null) {
	separate = true;
	qS('#lbBtn').classList.remove('hide');
	qS('#scrobble').classList.remove('hide');
	qS('body').classList.add('separate');
	qS('#scrobbleTime').innerText = '0:00';
	qS('#totalTime').innerText = '0:00';
	qS('#scrobbleslider').oninput = function() {
		var seconds = this.value % 60;
		seconds = (seconds < 10 ? '0' : '') + seconds;
		var minutes = Math.floor(this.value / 60);
		var text = minutes + ':' + seconds;
		qS('#scrobbleTime').innerText = text;
	}
	var title = params.get('title') || '';
	searchbox(title);

	qS('#play').addEventListener('click', sPlay);
	qS('#pause').addEventListener('click', sPause);
	qS('#stop').addEventListener('click', sStop);

	
// } else {
// 	separate = false;
// 	qS('#ozshows').addEventListener('click', function(e){
// 		window.open(location.href + '?separate=true&title=' + currentTab.title);
// 	});

// 	var currentTab;
// 	browser.tabs.query({currentWindow: true, active: true})
// 	.then(function(t) {
// 		currentTab = t[0];
// 		//console.log(t);
// 		var id = t[0]['id'];
// 		console.log(id, t);
// 		return browser.tabs.sendMessage(id, {'type':'show'});
// 	}).then(function(msg) {
// 		console.log(msg);
// 		if (msg['valid']) {
// 			searchshows(msg['show'])
// 		}
// 		//return browser.tabs.query({currentWindow: true, active: true})
// 	//}).then(function(t) {
// 		//var id = t[0]['id'];
// 		// console.log(id);
// 		//return browser.tabs.sendMessage(id, {'type':'scrobble'});
// 	}).catch(function(err){
// 		//no content script in current page
// 		console.log('no content script', currentTab)
// 		searchbox(currentTab.title);
// 	});
// }

function sPlay() {
	sScrobble('start')
	.then(function(){
		qS('#stopReminder').classList.remove('hide');		
	})
}
function sPause(){
	sScrobble('pause');
}
function sStop(){
	sScrobble('stop', 1)
	.then(function(){
		qS('#stopReminder').classList.add('hide');
		refresh();
	})
}
function sScrobble(action, progress) {
	console.log(window.ids);
	console.log(currentepobj);
	var ep = window.ids;
	// qS('#checkincheck').classList.add('hide');
	// qS('#checkindonut').classList.remove('hide');

	var progress = progress || qS('#scrobbleslider').value / qS('#scrobbleslider').max;
	progress = Math.round(progress * 100);

	var headers = {
		'Authorization': 'Bearer ' + token
	};
	var req = {
		'episode': {
			'ids': ep
		},
		'progress': progress
	}
	console.log('https://api.trakt.tv/scrobble/' + action, headers, req);
	return makeRequest('POST', 'https://api.trakt.tv/scrobble/' + action, headers, req)
	.then(function (responseText) {
		var body = JSON.parse(responseText);
		console.log(body);
		// qS('#checkindonut').classList.add('hide');
		// qS('#checkintick').classList.remove('hide');
		// setTimeout(function() {
		// 	window.close();
		// }, 1000);
		// refresh();
		return null;
	});
}

function initiateSelect() {
	for (var season of seasons) {
		var o = document.createElement('option');
		o.value = season.number;
		o.innerText = season.title || season.number;
		o.dataset.episodes = season.aired;
		qS('#seasonSelect').appendChild(o);
	}
	qS('#seasonSelect').addEventListener('change', function(e){
		var number = e.target.options[e.target.options.selectedIndex].dataset.episodes;
		qS('#episodeSelect').innerHTML = '';
		for (var i = 1; i < number + 1; i++) {
			var o = document.createElement('option');
			o.value = i;
			o.innerText = i;
			qS('#episodeSelect').appendChild(o);
		}
	});
	qS('#episodeSelectBtn').addEventListener('click', function(){
		var season = qS('#seasonSelect').value;
		var episode = qS('#episodeSelect').value;
		var headers = {
			'Authorization': 'Bearer ' + window.token
		};
		var url = 'https://api.trakt.tv/shows/' + window.showid + '/seasons/' + season + '/episodes/' + episode + '?extended=full';
		makeRequest('GET', url, headers)
		.then(function (responseText) {
			var body = JSON.parse(responseText);
			window.currentepobj = body;
			return body;
		}).then(loadEpisode);
	});
	
	showedSeasons = true;
	qS('#episodeSelectBox').classList.remove('hide');
}
