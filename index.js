'use strict';
console.log('Loading function');
var  crypto = require('crypto');
var config_cxense = require('./config/config_cxense.conf');
var https = require('https');

exports.handler = (event, context, callback) => {
    //console.log('Received event:', JSON.stringify(event, null, 2));
    console.log('cxense userinfo update is called');
    //callback(null, "response from cxense userinfo update");  // Echo back the first key value

    var str_concept = "dac";

    console.log(event);

	var username = 'cxense-team@dac.co.jp';
	var apiKey = config_cxense.api_key;
	var date = new Date().toISOString();
	var hmac = crypto.createHmac('sha256', apiKey).update(date).digest('hex');
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
			console.log("data");
			console.log(chunk)
		});
		res.on('end', function(){
			console.log("end");
    		context.succeed("end");
		});
	});

	req.on("error", function(error){
		console.log(error);
		context.fail(error);
	});

	req.end();


    // callback('Something went wrong');
};

