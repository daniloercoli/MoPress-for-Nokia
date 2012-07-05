/** codice js (controller) della View BlogView.html */

function BlogController(indiceBlog)
{	
	this.indiceBlog = indiceBlog;
	this.blogObj = WP.Model.getBlog(indiceBlog);

	EW.LogSystem.debug("caricato il blog con indice "+indiceBlog);
	EW.LogSystem.debug("caricato il blog con titolo "+this.blogObj.blogName);	
}

BlogController.prototype.onActivated = function(){
	this.updateSoftkeys();
}

BlogController.prototype.onDeactivated = function(){
}

BlogController.prototype.init = function() {
	
	$("pnlBlog_blogTitle").innerHTML = this.blogObj.blogName.toString();
	
	$("optionsActionLink").onclick =  EW.Utils.createMethodReference(this,  "showOptions") ;
	
	$("commentsActionLink").onclick =  EW.Utils.createMethodReference(this,  "showComments");
	
	$("newPostActionLink").onclick =  EW.Utils.createMethodReference(this, "showPosts");
	
	$("pnlBlog_removebtn").onclick = EW.Utils.createMethodReference(this,  "deleteBlog");

}

BlogController.prototype.updateSoftkeys = function() {
	
	var elementiMenu = [ 
	{label: "Options", action : EW.Utils.createMethodReference(this,  "showOptions"), touch: false },
	{label: "Comments", action : EW.Utils.createMethodReference(this,  "showComments"), touch: false },
	{label: "Delete", action :  EW.Utils.createMethodReference(this,  "deleteBlog"), touch: false }
	]
	WP.Menu.setLeft(elementiMenu);
	
}

BlogController.prototype.showOptions = function() {
	 WP.Controller.showBlogOptionsScreen(this.indiceBlog);
}

BlogController.prototype.showComments = function() {
	 WP.Controller.showCommentsScreen(this.indiceBlog);
}

BlogController.prototype.showPosts = function() {
	 WP.Controller.showPostsScreen(this.indiceBlog);
}

BlogController.prototype.deleteBlog = function(){
	EW.LogSystem.debug("cancello il blog " + this.blogObj.blogName);
	var res = EW.Utils.SeiSicuro();
	if (res) {
		WP.Model.removeBlog(this.indiceBlog);
		WP.Layout.goBack();
	}
}