/**
 * @author dercoli
 */
function NewPostController(indiceBlog)
{
	this.indiceBlog = indiceBlog;
	this.blogObj = WP.Model.getBlog(indiceBlog);
	this.connection = null;
}

NewPostController.prototype.onActivated = function(){
	EW.LogSystem.debug(">>> NewPostController.prototype.onActivated");
	var elementiMenu = [];
	
	
	elementiMenu.push({
		label: "Discard",
		action: EW.Utils.createMethodReference(this, "discard"),
		touch: true
	});

	elementiMenu.push({
		label: "Send",
		action: EW.Utils.createMethodReference(this, "send"),
		touch: true
	});
						
	WP.Menu.setLeft(elementiMenu);	
	EW.LogSystem.debug("<<< NewPostController.prototype.onActivated");
}

NewPostController.prototype.stopPublishing = function(){	
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
}

NewPostController.prototype.discard = function(){
	var res = EW.Utils.SeiSicuro();
	if (res) {
		$("newPostContent").value = "";
		$("newPostTitle").value = "";
		$("newPostTags").value = "";
		WP.Layout.goBack();
	}
}

NewPostController.prototype.send = function(){
	/*
	 * The struct content can contain the following standard keys:
    * title, for the title of the entry;
    * description, for the body of the entry;
    * dateCreated, to set the created-on date of the entry;
	 */
	var content = {
		title : $("newPostTitle").value,
		description : $("newPostContent").value,
		mt_keywords : $("newPostTags").value
	}
	var res = EW.Utils.SeiSicuro();
	if (res) {
		
		 // no auto hiding, wait-type notification, unknown progress
	     WP.Controller.showNotification(-1, "wait", "Loading feed...", -1,  EW.Utils.createMethodReference(this,  "stopPublishing"));
		try {
			this.connection = new NewPost(this.blogObj.username, this.blogObj.password, this.blogObj.xmlrpc, content);
			this.connection.addListener(this);
			this.connection.startConn();
		}
		catch(errrrrrr) {
			WP.Controller.showErrorDialog ("Err", errrrrrr);
		}
	}
}

NewPostController.prototype.connRequestError = function (errorMsg) {	
	EW.LogSystem.error("NewPostController.connRequestError");
	WP.Controller.showErrorDialog ("Err", errorMsg);
	//this.showCommentsList();
}

NewPostController.prototype.connRequestStopped = function () {
	EW.LogSystem.debug("NewPostController.connRequestStopped");
}

NewPostController.prototype.connRequestCompleted = function (commentsList)
{
	EW.LogSystem.debug("NewPostController.connRequestCompleted");
	alert("Published");
	WP.Layout.goBack();
}

NewPostController.prototype.onDeactivated = function(){
	$("newPostContent").value = "";
	$("newPostTitle").value = "";
	$("newPostTags").value = "";
	this.connection = null;
}

NewPostController.prototype.init = function() {
}
