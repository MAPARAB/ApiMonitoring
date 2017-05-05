//Writing all the new based services

var http = require('http');
var PropertiesReader = require('properties-reader');
var moment = require('moment');
var replaceall = require("replaceall");

var properties = PropertiesReader('/home/ApiMonitoring/properties/queries.properties');
properties = properties.append('/home/ApiMonitoring/properties/endpoint.properties');


exports.apiReport = function(req, res)
		    {		
			 var queryStr = properties.get('olp-adapter-service-access.api.search.query');
			 var endpoint = properties.get('olp-adapter-service-access.api.search.endpoint');
			 var hostInfo = properties.get('olp-adapter-service-access.api.proxy.ip');
			 var portInfo = properties.get('olp-adapter-service-access.api.proxy.port');			

			 var range = JSON.stringify(req.body);
			 range =  replaceall("\"","", range);
			 range.trim();	 

			 var args1 = range.substring(range.indexOf(":")+1, range.length-1);
			 var args2 = range.substring(1,range.indexOf(":")); 			
			 
			 console.log(args1 + " ::::: " + args2);
			 console.log(endpoint);
			 console.log("**************************");
			
			 console.log("Time right now ::::: "  + moment().format('YYYY-MM-DD HH:mm:ss.SSS'));
                         console.log("Time before from right now :::::: " + moment().subtract(args1, args2).format('YYYY-MM-DD HH:mm:ss.SSS'));

			 queryStr = queryStr.replace('1493363491000', moment().subtract(args1, args2).format('YYYY-MM-DD HH:mm:ss.SSS'));
                         queryStr = queryStr.replace('1493367091000' , moment().format('YYYY-MM-DD HH:mm:ss.SSS'));
                         console.log(queryStr);

			 // An object of options to indicate where to post to
                        var post_options = {
                                                 host: hostInfo,
                                                 port: portInfo,
                                                 path: endpoint,
                                                 method: 'POST',
                                                 headers: {
                                                                'Content-Type': 'application/json',
                                                                'Content-Length': Buffer.byteLength(queryStr)
                                                           }
                                            }

                        //console.log(post_options);
                        //console.log("@@@@@@@@@@@@@@@@@");

			var request = http.request(post_options, function(response)
                                      {
                                        var body = "";

                                        response.on('data', function(data)
										
										{
                                                body += data ;
                                        });

                                        response.on('end', function()
                                        {
                                                console.log("%^#$^#^#^%#^#^#^#^#^#");
                                                console.log(body);

                                                res.send(JSON.parse(body));
                                        });

                                      });


                        request.on('error', function(e)
                                {
                                        console.log('Problem with request: ' + e.message);
                                });


                        request.write(queryStr);
                        request.end();

		    }
