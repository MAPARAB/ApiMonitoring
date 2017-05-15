var jwt = require('jwt-simple');
var http = require('http');
var PropertiesReader = require('properties-reader');

var properties = PropertiesReader('properties/endpoint.properties');


exports.login = function(req, res)
				{
					var username = req.body.username || '';
    				var password = req.body.password || '';
					
					if (username == '' || password == '') 
					{			
						res.status(401);
     				 	res.json({
									"status": 401,
									"message": "Invalid credentials. Username and/or Password cannot be empty"
								});
     					 return;
    				}
					
					// Fire a query to OpenAM and check if the credentials are valid
					var endpoint = properties.get('open-am.security.endpoint');
					var hostInfo = properties.get('olp-adapter-service-access.api.proxy.ip');
					var portInfo = properties.get('olp-adapter-service-access.api.proxy.port');

					endpoint = endpoint.concat("?username=").concat(username).concat("&password=").concat(password);
					console.log(endpoint);		
				
					// An object of options to indicate where to post to
					var post_options = {
										host: hostInfo,
										port: portInfo,
										path: endpoint,
										method: 'POST',
										headers: {
													'Content-Type': 'application/json'
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
							console.log(body);
							
							var args2 = body.substring(0,body.indexOf("=")); 						
							var args1  = body.substring(body.indexOf("=")+1, body.length-1);						
							
							if(args2 == "token.id")
							{
								var result = "{\"token\" : \" "  + args1 + "\" }" ;							
							}
							else
							{
								var result = "{\"message\":\"Invalid credentials\"}";
							}

							res.send(JSON.parse(result));
						});
					});
					
					request.on('error', function(e)
                               {
                               		console.log('Problem with request: ' + e.message);
									res.status(401);
									res.json({
		                                       "status": 401,
                			                    "message": "Invalid credentials"
                                            });
                               	});
					
					request.end();	
				}



