function AddBlogs(){
    this.connection = null; //the xmlrpc connection class 
}


AddBlogs.prototype.onActivated = function(){
    EW.LogSystem.debug("AddBlogsController.onActivated");
    WP.Menu.setLeft([{
        label: "Add",
        action: EW.Utils.createMethodReference(this,  "addBlogsNextBtn_Click"),
        touch: true
    }]);
	
	$("addBlogsNextBtn").onclick = EW.Utils.createMethodReference(this,  "addBlogsNextBtn_Click");
	//solo se siamo nel touch prende il focus. altrimenti ci sono problemi con i vecchi dispositivi
	if(WP.Layout.isDeviceTouch === true)
		$("addBlogsNextBtn").focus();
}

AddBlogs.prototype.onDeactivated = function(){
    EW.LogSystem.debug("AddBlogsController.onDeactivated");
}
	
AddBlogs.prototype.init = function(){

    if (!WP.Controller.isWidget) {
		$("txtUserName").value = "lkvnhjgoieanff";
		$("txtPassword").value = "fdadwaà°ùàòàp**..";
		$("txtWpUrl").value = "http://testing.mopress.danais.org/xmlrpc.php";
    }
	
    $("wizardStep1").style.display = '';
    $("lblErrorWizardStep2").innerHTML = "";
    $("lblErrorWizardStep2").style.display = 'none';
}
	
AddBlogs.prototype.btnBack_Click = function()
{
    WP.Controller.showMainScreen();
}

AddBlogs.prototype.addBlogsCancelBtn_Click = function()
{
    try {
        if (this.connection != null) {
            EW.LogSystem.debug("connessione bloccata");
            this.connection.stopConn();
        }
    } 
    catch (errrrrrr) {
		WP.Controller.showErrorDialog ("Err", errrrrrr);
    }
    
	WP.Controller.hideNotification();
	
    WP.Menu.setLeft([{
        label: "Add",
        action: EW.Utils.createMethodReference(this,  "addBlogsNextBtn_Click"),
        touch: true
    }]);
    $("lblErrorWizardStep2").innerHTML = "";
    $("lblErrorWizardStep2").style.display = 'none';
    $("wizardStep1").style.display = '';
}
	

AddBlogs.prototype.addBlogsNextBtn_Click = function()
{
    try {
        this.connection = new AddBlogConn($("txtUserName").value, $("txtPassword").value, getEndPoint($("txtWpUrl").value));
        this.connection.addListener(new AddBlogsListener(this));
        this.connection.startConn();
    } 
    catch (errrrrrr) {
		WP.Controller.showErrorDialog ("Err", errrrrrr);
    }
    
    $("lblErrorWizardStep2").innerHTML = "";
    $("lblErrorWizardStep2").style.display = '';
    $("wizardStep1").style.display = 'none';
    
    WP.Menu.setLeft([{
        label: "Cancel",
		action: EW.Utils.createMethodReference(this,  "addBlogsCancelBtn_Click"),
        touch: false
    }]);
    WP.Menu.setRightSoftkeyLabel("Cancel", EW.Utils.createMethodReference(this,  "addBlogsCancelBtn_Click"));
    
    // no auto hiding, wait-type notification, unknown progress
    WP.Controller.showNotification(-1, "wait", "Loading feed...", -1,  EW.Utils.createMethodReference(this,  "addBlogsCancelBtn_Click"));
    return false;
}


function getEndPoint(url)
{
	/* Trim the spaces */
	url =  url.replace(/^\s+|\s+$/, '');
	if(url.substr(url.length - 3) == "php") return url; /* We have xmlrpc url no changes required */
	if(url.substr(url.length - 1) == "/") url += "xmlrpc.php" ;
	else url += "/xmlrpc.php";		
	return url;		
}
	

function AddBlogsListener(parentObj) {
	this._parent = parentObj;
}


AddBlogsListener.prototype.connRequestError = function (errorMsg) {
	
	EW.LogSystem.error("AddBlogsListener.connRequestError");
	$("lblErrorWizardStep2").innerHTML = errorMsg; 
	$("lblErrorWizardStep2").style.display = '';
	$("wizardStep1").style.display = '';


    WP.Menu.setLeft([{
        label: "Add",
		action: EW.Utils.createMethodReference(this._parent,  "addBlogsNextBtn_Click"),
        touch: true
    }]);
	
	WP.Controller.hideNotification();
}

AddBlogsListener.prototype.connRequestStopped = function () {
	EW.LogSystem.debug("AddBlogsListener.connRequestStopped");
	//not used. il cancel button cambia 
}

AddBlogsListener.prototype.connRequestCompleted = function (userBlogs)
{
	EW.LogSystem.debug("AddBlogsListener.connRequestCompleted");

/*
 * risposta dal server	
 * [{"isAdmin":false,"url":"http://localhost/wp_mopress/","blogid":"1","blogName":"Local &amp; Tes\"","xmlrpc":"http://localhost/wp_mopress/xmlrpc.php","username":"mopress","password":"mopress"}]
 */
	
	EW.LogSystem.debug("numero blog " +userBlogs.length);
	
	if(userBlogs.length == 0) {	
		
	} else {
		EW.LogSystem.debug("adding new blogs to the main blogs list"); 
		
		for(var x = 0; x < userBlogs.length; x++)
		{
			EW.LogSystem.debug("Provo a scrivere in memoria il nuovo blog "+x);
			EW.LogSystem.debug("la pasword impostata è: "+ userBlogs[x].password );
			var presence = false;
			var blogs = WP.Model.getBlogs();
			for(var j = 0; j < blogs.length; j++) {
				EW.LogSystem.debug("il nuovo blog ha url "+blogs[j].xmlrpc);
				EW.LogSystem.debug("il vecchio blog ha url "+userBlogs[x].xmlrpc);
				if(blogs[j].xmlrpc.toString() == userBlogs[x].xmlrpc.toString()) {
					presence = true;
					EW.LogSystem.debug("il nuovo blog "+x+ " e' gia' presente nell'applicativo");
					break;
				}
			}

			if(!presence) {
				EW.LogSystem.debug("aggiungo il nuovo blog nell'applicativo "+x);
				//aggiungo le informazioni fittizie relativi ai commenti
				userBlogs[x].comments_count={approved:(new String("0")), awaiting_moderation:(new String("0")), spam:(new String("0")), total_comments:(new Number(0))};
				userBlogs[x].isNewComments = false;
				userBlogs[x].comments = new Array();										
				WP.Model.addBlog(userBlogs[x]); 
			}
		}
		
		WP.Model.storeBlogs();
	}

	$("lblErrorWizardStep2").innerHTML = ""; 
	$("lblErrorWizardStep2").style.display = 'none';
	WP.Layout.goBack();
}