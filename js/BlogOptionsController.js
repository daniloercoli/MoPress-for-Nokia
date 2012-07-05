/** codice js (controller) della View BlogView.html */

function BlogOptionsController(indiceBlog)
{
	this.indiceBlog = indiceBlog;
	this.blogObj = WP.Model.getBlog(indiceBlog);

	EW.LogSystem.debug("caricato il blog con indice "+ indiceBlog);
	EW.LogSystem.debug("caricato il blog con titolo "+ this.blogObj.blogName);	
}

BlogOptionsController.prototype.onActivated = function(){
	var elementiMenu = [];

	elementiMenu.push({
		label: "Save",
		action: EW.Utils.createMethodReference(this, "saveOptions"),
		touch: true
	});
					
	WP.Menu.setLeft(elementiMenu);	
}

BlogOptionsController.prototype.onDeactivated = function(){
}

BlogOptionsController.prototype.init = function() {
	$("pnlConfig_blogTitle").innerHTML = this.blogObj.blogName.toString();
	
	//setup the fields
	$("txtConfigUserName").value = this.blogObj.username;
	$("txtConfigPassword").value = this.blogObj.password; 			
	
	
	//$("#btnSave").click( EW.Utils.createMethodReference(this,  "saveOptions") );
	//$("#btnRemoveBlog").click( EW.Utils.createMethodReference(this,  "deleteBlog") );
}


BlogOptionsController.prototype.saveOptions = function() {
	 EW.LogSystem.debug("salvo le opzioni del blog "+ this.blogObj.blogName);
	 this.blogObj.username = $("txtConfigUserName").value;
	 this.blogObj.password = $("txtConfigPassword").value;
	 WP.Model.storeBlogs();
	 WP.Layout.goBack();
}
