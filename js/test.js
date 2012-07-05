EW.Controller = {
		
	 showFront : function() {
	
	},
	
	showBack : function() {
	
	},
 
	testClick : function () {
		$("#feeds").load("feeds.html");
	},


 loadingInProgress : false,
 cancelled : false,

 processXmlRpcResponse : function(data, textStatus) {
	  // data could be xmlDoc, jsonObj, html, text, etc...
	  //this; // the options for this ajax request
  	  alert("succ");
	  cancelled = false;
	  EW.Controller.hideLoadingDiv();
	},

 processXmlRpcResponseError: function(XMLHttpRequest, textStatus, errorThrown) {
	  // typically only one of textStatus or errorThrown 
	  // will have info
	 // this; // the options for this ajax request
	  alert(textStatus + " " + errorThrown);
	  cancelled = false;
	  EW.Controller.hideLoadingDiv();
	}, 


 getUserBlog : function() {
	EW.Controller.showLoadingDiv();
	var xmlDocument='<?xml version="1.0" encoding="utf-8"?><methodCall><methodName>blogger.getUsersBlogs</methodName><params>'+
'<param><value><string>1</string></value></param><param><value><string>your username</string></value></param>'+
'<param><value><string>your password</string></value></param></params></methodCall>';

	 $.ajax({
		   url: "http://localhost/wp_mopress/xmlrpc.php",
		   type: "POST",
		   contentType: "text/xml",
		   data: xmlDocument,
		   processData: false,
		   dataType: "xml",
		   success: this.processXmlRpcResponse,
		   error: this.processXmlRpcResponseError
			   });
},

 cancellaCaricamento :function() {
	EW.Controller.hideLoadingDiv();
	cancelled = true;
},

 showLoadingDiv : function () {
	EW.LogSystem.info("showLoadingDiv");
	$("#loading").fadeIn("fast");
},

hideLoadingDiv : function () {
	EW.LogSystem.info("hideLoadingDiv");
	$("#loading").fadeOut("fast");
}
}