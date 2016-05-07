'use strict';
console.log('Loading function');
var  crypto = require('crypto');
var config_cxense = require('./config/config_cxense.conf');
var https = require('https');

var count = 0;
var username = 'cxense-team@dac.co.jp';
var apiKey = config_cxense.api_key;
var date = new Date().toISOString();
var hmac = crypto.createHmac('sha256', apiKey).update(date).digest('hex');


exports.handler = (event, context, callback) => {
    console.log('----------cxense userinfo update is called---------');
    console.log(event);

    var userid = event.userid;
    console.log("userid is " + userid);


    retrieve_profile_user(event, context, userid);
    retrieve_traffic_keyword(event, context, userid);
    retrieve_traffic_event(event, context, userid);

};

function retrieve_profile_user(event, context, userid){

	console.log("--retrieve_profile_user start--");

    var str_concept = "dac";
	var filter_obj = { "type":"keyword","group":"concept","item":str_concept };
	var filters_array = new Array(filter_obj);
	var fields_array = ["events","urls","activeTime"];

	var postData = JSON.stringify({
	  	siteId: '1128275557251903601',
	  	start: -8640000,
	  	fields: fields_array,
	  	filters: filters_array
	});

	var option = {
		hostname: "api.cxense.com",
		path: "/traffic",
		method: "POST",
		port: 443,
		headers: {
			'X-cXense-Authentication': 'username=' + username + ' date=' + date + ' hmac-sha256-hex=' + hmac,
	  		'Content-Type': 'application/json;charset=utf-8'
		}
	};

	var req = https.request(option, function(res){
		console.log(res.statusCode);
		console.log(res.headers);
		res.setEncoding('utf8');
		res.on('data', function(chunk){
			console.log("data chunk");
			console.log(chunk);
		});
		res.on('end', function(){
			console.log("request ended successfully in retrieve_profile_user");
    		context.succeed(event);
		});
	});

	req.on("error", function(error){
		console.log("request fail fail fail in retrieve_profile_user");
		context.succeed(event);
	});

	req.end();

}

function retrieve_traffic_keyword(event, context, userid){


}


function retrieve_traffic_event(event, context, userid){

}
