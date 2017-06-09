//Writing all the new based services

var http = require('http');
var PropertiesReader = require('properties-reader');
var moment = require('moment');
var replaceall = require("replaceall");
var async = require("async");

var properties = PropertiesReader('properties/queries.properties');
properties = properties.append('properties/endpoint.properties');

var endpoint = properties.get('olp-adapter-service-access.api.search.endpoint');
var hostInfo = properties.get('olp-adapter-service-access.api.proxy.ip');
var portInfo = properties.get('olp-adapter-service-access.api.proxy.port');
var vendors = properties.get('olp-adapter-service-access.api.search.vendors');

exports.apiAsyncReport = function(req, res)
                        {
                        //get the value from header
                        var status = 'success' ;
                        status = req.headers['status'];
                        //console.log(status);

                        //Calculating the date range
                        var range = JSON.stringify(req.body);
                        range =  replaceall("\"","", range);
                        range.trim();	 
                        var args1 = range.substring(range.indexOf(":")+1, range.length-1);
                        var args2 = range.substring(1,range.indexOf(":"));     

                        //Split of vendors
                        var vendorArray = vendors.split(',');

                        var queryStr = "";
                        var collection = [];
                        var k = 0;

                        for(i=0;i<(vendorArray.length*2);i++)
                        {
                        collection.push(
                                        (function(i)
                                        {
                                                return function (callback)
                                                {
                                                        if(i<vendorArray.length)      
                                                        {queryStr = properties.get('olp-adapter-service-access.api.search.query');}
                                                        else
                                                        {queryStr = properties.get('olp-adapter-service-access.api.failsearch.query');}
                                
                                                        queryStr = queryStr.replace('1493363491000', new Date(moment().subtract(args1, args2).format('YYYY-MM-DD HH:mm:ss.SSS')).getTime());
                                                        queryStr = queryStr.replace('1493367091000' , new Date(moment().format('YYYY-MM-DD HH:mm:ss.SSS')).getTime());
                                                        queryStr = queryStr.replace('Vendor' , vendorArray[k]);
                                                        console.log(vendorArray[k] + "::::" + queryStr);
                                                        k++;
                                                        if(k==vendorArray.length)
                                                        {k=0}

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
                                                        
                                                        var request = http.request(post_options, function(response)
                                                                        {
                                                                                var body = "";

                                                                                response.on('data', function(data)					
                                                                                {
                                                                                                body += data ;
                                                                                });

                                                                                response.on('end', function()
                                                                                {
                                                                                                obj = JSON.parse(body);
                                                                                                callback(false, obj);
                                                                                });

                                                                        });		

                                                        request.on('error', function(e)
                                                        {
                                                                console.log('Problem with request: ' + e.message);
                                                                callback(false, '{"status":"500" , "message":"Problem with the rest api"}');
                                                        });														  
                                                                
                                                        request.write(queryStr);	
                                                        request.end();  											
                                                }
                                        })(i)
                                );
                        }                        

                        async.parallel(collection, function(err, results)
                        {
                          console.log("Executed all calls in parallel.");
                          res.send(
                                        {"Result" : 
                                                [
                                                        {"Vendor": vendorArray[0], "status":"success" ,api:results[0]}, 
                                                        {"Vendor": vendorArray[1], "status":"success", api:results[1]} , 
                                                        {"Vendor": vendorArray[2], "status":"success", api:results[2]}, 
                                                        {"Vendor": vendorArray[3], "status":"success", api:results[3]}, 
                                                        {"Vendor": vendorArray[4], "status":"success", api:results[4]},
                                                        {"Vendor": vendorArray[0], "status":"fail", api:results[5]},
                                                        {"Vendor": vendorArray[1], "status":"fail", api:results[6]},
                                                        {"Vendor": vendorArray[2], "status":"fail", api:results[7]},
                                                        {"Vendor": vendorArray[3], "status":"fail", api:results[8]},
                                                        {"Vendor": vendorArray[4], "status":"fail", api:results[9]}
                                                ]
                                        }
                                  );
                        })
                } 


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
