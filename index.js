'use strict';
console.log('Loading function');
var  crypto = require('crypto');
var config_cxense = require('./config/config_cxense.conf');
var https = require('https');

var count = 0;
var api_num=3;
var username = 'cxense-team@dac.co.jp';
var apiKey = config_cxense.api_key;
var date = new Date().toISOString();
var hmac = crypto.createHmac('sha256', apiKey).update(date).digest('hex');

var user_primary_key = null


var config = require('./config/config_aws.conf');
//var config = require('./config/config_local.conf');
var AWS = require("aws-sdk");

AWS.config.update({
  region: config.dynamo_region,
  endpoint: config.dynamo_url
});


 var aws_client = new AWS.DynamoDB();
var docClient = new AWS.DynamoDB.DocumentClient();



exports.handler = (event, context, callback) => {
    console.log('----------cxense userinfo update is called---------');
    console.log(event);

    var userid = event.userid;
    console.log("userid is " + userid);
    user_primary_key = retrieve_primary_key(event, context, userid);

//    cxense_traffic(event, context);
    retrieve_profile_user(event, context, userid);
    retrieve_traffic_keyword(event, context, userid);
	retrieve_traffic_event(event, context, userid);
};


function retrieve_primary_key(event, context, userid){

	var params = {
	    TableName: "User",
	    IndexName: "TuuidIndex",
	    KeyConditionExpression: "tuuid = :tuuid_value",
	    ExpressionAttributeValues: {
	        ":tuuid_value": userid
	    },
	    ProjectionExpression: "first_name, last_name, email"
	};
	docClient.query(params, function(err, data) {
	    if (err){
	        console.log(JSON.stringify(err, null, 2));
	    }else{
	        console.log(JSON.stringify(data, null, 2));
	        if(!data.Items[0]){
	        	console.log("no user with this id" + data);
	        	context.succeed(event);
	        	return;
	        }
	        var email_address = data.Items[0].email;
	        if(email_address){
	            console.log("primary key is " + email_address)
	            //update_name(email_address, "aaa");
	            user_primary_key = email_address;
	        }else{
	        	console.log("primary key cannot be found");
	        	context.succeed(event);
	        	return;
	        }
	    }
	});
}

function set_userdata(event, context, in_email_address, in_attr_name, in_attr_value){

	console.log("-------------set_userdata is called: key" + in_attr_name + "--------------")
    var params = {
        TableName: "User",
        Key: {
            "email":in_email_address
        },
        UpdateExpression: "SET #attribute_name = :attribute_value",
        ExpressionAttributeValues: { 
            ":attribute_value": in_attr_value
        },
        ExpressionAttributeNames: {
            "#attribute_name": in_attr_name
        },
        ReturnValues: "ALL_NEW"
    };
    docClient.update(params, function(err, data) {
        if (err){
            console.log(JSON.stringify(err, null, 2));
        }
        else{
            console.log(JSON.stringify(data, null, 2));
            console.log("storing data succeed. key is " + in_attr_name);
        }
		count++;
		if(count==api_num){
			context.succeed(event);
    	}
    });
}



/*
python cx.py /profile/user '{"id":"64f3fb36-7a9b-4156-a584-bd9a86d0ddfa", "type":"dac"}'


*/


function retrieve_profile_user(event, context, userid){

	console.log("--retrieve_profile_user start--");

	var postData = JSON.stringify({
		id:userid,
	  	type:"dac"
	});
	console.log(postData);

	var option = {
		hostname: "api.cxense.com",
		path: "/profile/user",
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
			console.log("----data chunk of retrieve_profile_user---");
			console.log(chunk);
			var profile_user_obj = JSON.parse(chunk);
			
			if(user_primary_key){
				set_userdata(event, context, user_primary_key,"profile_user", profile_user_obj )
			}else{
				console.log("--------primary key cannot be found--------");
				count++;
				if(count==api_num){
					context.succeed(event);
				}
			}
		});
		res.on('end', function(){
			console.log("request ended successfully in retrieve_profile_user");
//    		context.succeed(event);
		});
	});

	req.on("error", function(error){
		console.log("request fail fail fail in retrieve_profile_user");
		count++;
		if(count==api_num){
			context.succeed(event);
	    }
	});

	req.write(postData);
	req.end();

}

function retrieve_traffic_keyword(event, context, userid){


	console.log("--retrieve_traffic_keyword start--");

	var postData = JSON.stringify({
		siteId:'1128275557251903601',
		filters:[{type:"user",group:"dac", item:userid}]
	});

	console.log(postData);

	var option = {
		hostname: "api.cxense.com",
		path: "/traffic/keyword",
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
			console.log("----data chunk of retrieve_traffic_keyword----");
			console.log(chunk);
			var traffic_keywor_obj = JSON.parse(chunk);

			if(user_primary_key){
				set_userdata(event, context, user_primary_key,"traffic_keyword", traffic_keywor_obj )
			}else{
				console.log("-------------primary key cannot be found-----------");
				count++;
				if(count==api_num){
					context.succeed(event);
				}
			}


		});
		res.on('end', function(){
			console.log("request ended successfully in retrieve_traffic_keyword");
//			count++;
		});
	});

	req.on("error", function(error){
		console.log("request fail fail fail in retrieve_traffic_keyword ");
		count++;
		if(count==api_num){
			context.succeed(event);
    	}
	});

	req.write(postData);
	req.end();

}


function retrieve_traffic_event(event, context, userid){


	console.log("--retrieve_traffic_keyword start--");

	var postData = JSON.stringify({
		siteId:'1128275557251903601',
		filters:[{type:"user",group:"dac", item:userid}]
	});

	console.log(postData);

	var option = {
		hostname: "api.cxense.com",
		path: "/traffic/event",
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
			console.log("----data chunk of retrieve_traffic_event----");
			console.log(chunk);
			var retrieve_traffic_obj = JSON.parse(chunk);

			if(user_primary_key){
				set_userdata(event, context, user_primary_key,"traffic_event", retrieve_traffic_obj )
			}else{
				console.log("----------primary key cannot be found----------");
				count++;
				if(count==api_num){
					context.succeed(event);
				}
			}

		});
		res.on('end', function(){
			console.log("request ended successfully in retrieve_traffic_event");
//			count++;

		});
	});

	req.on("error", function(error){
		console.log("request fail fail fail in retrieve_traffic_event ");
		count++;
		if(count==api_num){
			context.succeed(event);
    	}
	});

	req.write(postData);
	req.end();

}
