
config_grunt  = require('./config/config_grunt.conf');

module.exports = function (grunt) {

	grunt.loadNpmTasks('grunt-aws-lambda');

	grunt.initConfig({

	    lambda_invoke: {
	        default: {
	            options: {
	                // Task-specific options go here.
	                file_name:"./index.js"
	            }
	        }
	    },
	    lambda_deploy: {
	        default: {
	            arn: 'arn:aws:lambda:us-east-1:494806557253:function:cxense_userinfo_update',
	            options: {
	    			profile: config_grunt.profile,
	    			accessKeyId: config_grunt.accessKeyId,
	    			secretAccessKey: config_grunt.secretAccessKey,
	    			region:"us-east-1"

	            }
	        }
	    },
	    lambda_package: {
	    	default: {
	    		options: {
	    			package_folder: "./",
	    			dist_folder: "./dist",
	    			include_files: ["./config/config_cxense.conf", "./config/config_aws.conf"]
	    		}
	    	}
	    }
	});

	grunt.registerTask('run',['lambda_invoke']);
	grunt.registerTask('deploy',['lambda_package', 'lambda_deploy']);

}