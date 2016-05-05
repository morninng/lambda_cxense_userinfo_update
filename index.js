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
    console.log('cxense userinfo update is called');


    console.log(event);
    retrieve_profile_user(context);
    retrieve_traffic_keyword();
    retrieve_traffic_event();
};

function retrieve_profile_user(context){

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



}

function retrieve_traffic_keyword(){



}


function retrieve_traffic_event(){

}



