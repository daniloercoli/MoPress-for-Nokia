/** codice js (controller) della View CommentsView.html */

function CommentsController(indiceBlog)
{
	
	this.indiceBlog = indiceBlog;
	this.blogObj = WP.Model.getBlog(indiceBlog);
	this.connection = null;
	
	//filtri sulla connessione
	this.post_id = "";
	this.offset = 0;
	this.number = 10;
	this.status="";
	
	//indica se devo aggiornare la vista, facendo una nuova connessione, quando la porto in primo piano
	this.mustUpdateView = true;
	
	EW.LogSystem.debug("CommentsController: caricato il blog con indice "+indiceBlog);
	EW.LogSystem.debug("CommentsController: caricato il blog con titolo "+this.blogObj.blogName);	
}


CommentsController.prototype.onActivated = function(){
	EW.LogSystem.debug("CommentsController onActivated");
	if(this.mustUpdateView === true) {
		$("the-comment-list").style.display = 'none';
		$("pnlComments_blogTitle").innerHTML = this.blogObj.blogName.toString();			
		this.getCommentCount();	
	} else {
		this.showCommentsList();
	}
	this.mustUpdateView = false;
}

CommentsController.prototype.onDeactivated = function(){
	EW.LogSystem.debug("CommentsController onDeactivated");
	//non c'è bisogno di fare un nuova connessione quando la mostro nuovamente
	this.mustUpdateView = false;
	this.connection = null;
}

CommentsController.prototype.init = function() {
}

CommentsController.prototype.updateSoftkeys = function() {
//	WP.Menu.setLeft([{label: "Cancel", action : function(){}, touch: false }]);
//	WP.Menu.setRightSoftkeyLabel ("Cancel", function(){});
}

CommentsController.prototype.stopCommentsConnection = function()
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
  	this.showNavigationBar();
}

CommentsController.prototype.getCommentCount = function() {	

	  // no auto hiding, wait-type notification, unknown progress
     WP.Controller.showNotification(-1, "wait", "Loading feed...", -1,  EW.Utils.createMethodReference(this,  "stopCommentsConnection"));
	try {
		this.connection = new GetCommentCount(this.blogObj.username, this.blogObj.password, this.blogObj.xmlrpc);
		this.connection.addListener(new GetCommentCountListener(this));
		this.connection.startConn();
	}
	catch(errrrrrr) {
		WP.Controller.showErrorDialog ("Err", errrrrrr);
	}
}

CommentsController.prototype.getComments = function() {	

	  // no auto hiding, wait-type notification, unknown progress
	     WP.Controller.showNotification(-1, "wait", "Loading feed...", -1,  EW.Utils.createMethodReference(this,  "stopCommentsConnection"));

		try {
			this.connection = new GetCommentsConn(this.blogObj.username, this.blogObj.password, this.blogObj.xmlrpc);
			this.connection.setNumber(this.number);
			this.connection.setOffset(this.offset);			
			this.connection.addListener(this);
			this.connection.startConn();
		}
		catch(errrrrrr) {
			WP.Controller.showErrorDialog ("Err", errrrrrr);
		}
}
	
CommentsController.prototype.showNavigationBar = function() {
	EW.LogSystem.debug(">>> showNavigationBar");
	EW.LogSystem.debug("offset vale ora: "+this.offset);
	 	 
	var elementiMenu = [];
	
	elementiMenu.push({label: "Refresh", action : EW.Utils.createMethodReference(this,  "navBarRefresh"), touch: true  });
	
	// if we are not on the first record, we can always go backwards
	if (this.offset > 0)
	{
		elementiMenu.push({label: "Back", action : EW.Utils.createMethodReference(this,  "navBarPrev"), touch: true });
	} 
	
	EW.LogSystem.debug("number vale ora: "+this.number);
	EW.LogSystem.debug("totale commenti: "+this.blogObj.comments.length);
	
	if (this.offset + this.number < (this.blogObj.comments_count.total_comments - this.blogObj.comments_count.spam ) )
	{
		// offset + limit gives us the maximum record number
		// that we could have displayed on this page. if it's
		// less than the total number of entries, that means
		// there are more entries to see, and we can go forward
		elementiMenu.push({label: "Next", action : EW.Utils.createMethodReference(this,  "navBarNext"), touch: true });
	} 
	
	//update the title!!
	var startIndex = this.offset +1;
	var endIndex = this.offset+this.number;
	var totalComment = this.blogObj.comments_count.total_comments - this.blogObj.comments_count.spam;
	if (this.offset + this.number > totalComment  ) {
		endIndex = totalComment;
	}
	
	if(totalComment > 0) {
		$("pnlComments_blogTitle").innerHTML = "Displaying Comment "+startIndex+"-"+endIndex +" of " +totalComment;		
	} else {
		//if there are no comments
		$("pnlComments_blogTitle").innerHTML = "No Comments";		
	}
	//WP.Controller.setTitle(this.blogObj.blogName.toString(), "Displaying Comment "+startIndex+"-"+endIndex +" of " +totalComment);
	
	WP.Menu.setLeft(elementiMenu);	
	EW.LogSystem.debug("<<< showNavigationBar");
}

CommentsController.prototype.showCommentsList = function() {
	this.showNavigationBar();
	var commentsList = this.blogObj.comments;
	
	var listaCommenti = $("the-comment-list");
	listaCommenti.innerHTML = ""; //svuota la lista dai commenti precedenti
	
	
	for(var x = 0; x < commentsList.length; x++) {
		EW.LogSystem.debug("comment_id" + commentsList[x].comment_id);

	//prepara il gravatar
	var gvtUrl = null;
	if( typeof (commentsList[x].author_email) != "undefined" ) {
		var md5Email = MD5(commentsList[x].author_email);
		gvtUrl = "http://www.gravatar.com/avatar/"+md5Email+"?s=48&amp;d=identicon&amp;r=G";
	} else {
		gvtUrl = "http://www.gravatar.com/avatar/3b3be63a4c2a439b013787725dfce802?s=48&amp;d=identicon&amp;r=G";
	}
	

 	var contenutoCommento = commentsList[x].content;
	if (typeof(contenutoCommento) === "undefined") {
		contenutoCommento = "";
	}	
	
	if (contenutoCommento.length > 197 ) {
		contenutoCommento = contenutoCommento.substring(0,197)+" ...";				
	} else {
		contenutoCommento = contenutoCommento;
	}
	
	var additonalPostStyle = "";
	if(commentsList[x].status.toString() == "hold") {
		additonalPostStyle = "pending";
	}
	if(commentsList[x].status.toString() == "spam") {
		additonalPostStyle = "spam";
	}
	//verifica se esiste il titolo del post
	var on_post ="";
	if (typeof(commentsList[x].post_title) != "undefined") {
		on_post= ' on <span>'+commentsList[x].post_title+'</span>';
	}	
	
	 var commento = document.createElement('div');
	 commento.id ="comment-"+commentsList[x].comment_id;
	 commento.className ="comment-item "+additonalPostStyle;
	 commento.onclick =	EW.Utils.createMethodReference(WP.Controller, "showCommentScreen", this.indiceBlog, commentsList[x]);

	 var htmlCommento = "";
	      htmlCommento+=("<img src='"+gvtUrl+"' class='avatar avatar-48' height='48' width='48'/>");
		  htmlCommento+=("<div class='comment-wrap'>" +
				'<h4 class="comment-meta">From <cite class="comment-author">'+ commentsList[x].author +'</cite>' +
				 on_post +
				'</h4>' +
				"<blockquote><p>"+contenutoCommento+"</p></blockquote>" +
				"</div>");
		  htmlCommento+=("<div style='clear: both;'></div>");		
		commento.innerHTML = htmlCommento; 
		
		listaCommenti.appendChild(commento);
		
/* dobbiamo aggiungere qualcosa simile a questo
 * <div id="comment-1135" class="comment even thread-even depth-1 comment-item approved">
	
	<img alt="" src="https://secure.gravatar.com/avatar/8127fae0d3a8e9178dff1f6edd474d63?s=48&amp;d=identicon&amp;r=G" class="avatar avatar-48" height="48" width="48">
	<div class="dashboard-comment-wrap">
	<h4 class="comment-meta">From 
		<cite class="comment-author"><a href="http://www.leagueofpervertedgentlemen.wordpress.com" rel="external nofollow" class="url">petergriffinisgod</a></cite> on 
		<a href="https://wpblackberry.wordpress.com/wp-admin/post.php?action=edit&amp;post=161">Speed Improvement, UI Enhancements, and Video Library&nbsp;Support</a> <a class="comment-link" href="http://blackberry.wordpress.org/2009/11/11/beta-0-9-0-169/#comment-1135">#</a> <span class="approve">[Pending]</span></h4>

				<blockquote><p>Ok, Danilo, problem solved. I did not have the latest version of the BlackBerry Software. I updated my BB Software ...</p></blockquote>
	<p class="row-actions"><span class="approve"><a href="comment.php?action=approvecomment&amp;p=161&amp;c=1135&amp;_wpnonce=71c3ad0de8" class="dim:the-comment-list:comment-1135:unapproved:e7e7d3:e7e7d3:new=approved vim-a" title="Approve this comment">Approve</a></span><span class="unapprove"><a href="comment.php?action=unapprovecomment&amp;p=161&amp;c=1135&amp;_wpnonce=71c3ad0de8" class="dim:the-comment-list:comment-1135:unapproved:e7e7d3:e7e7d3:new=unapproved vim-u" title="Unapprove this comment">Unapprove</a></span><span class="edit"> | <a href="comment.php?action=editcomment&amp;c=1135" title="Edit comment">Edit</a></span><span class="reply hide-if-no-js"> | <a onclick="commentReply.open('1135','161');return false;" class="vim-r hide-if-no-js" title="Reply to this comment" href="#">Reply</a></span><span class="spam"> | <a href="comment.php?action=deletecomment&amp;dt=spam&amp;p=161&amp;c=1135&amp;_wpnonce=625d73c3fe" class="delete:the-comment-list:comment-1135::spam=1 vim-s vim-destructive" title="Mark this comment as spam">Spam</a></span><span class="trash"> | <a href="comment.php?action=trashcomment&amp;p=161&amp;c=1135&amp;_wpnonce=625d73c3fe" class="delete:the-comment-list:comment-1135::trash=1 delete vim-d vim-destructive" title="Move this comment to the trash">Trash</a></span></p>

	</div>
</div>
 */	
 }
	
	
    WP.Controller.hideNotification();
	$("the-comment-list").style.display = '';
}

CommentsController.prototype.showLoadingDiv = function () {
	$("the-comment-list").style.display = 'none';
	// no auto hiding, wait-type notification, unknown progress
    WP.Controller.showNotification(-1, "wait", "Loading feed...", -1);
}

CommentsController.prototype.navBarRefresh = function () {
	this.showLoadingDiv();
	this.offset = 0;
	this.getCommentCount();
}

CommentsController.prototype.navBarPrev = function () {
	EW.LogSystem.debug("cliccato su navBarPrev");
	this.showLoadingDiv();	
	this.offset = this.offset - this.number;
	this.getComments(); 
}

CommentsController.prototype.navBarNext = function () {
	EW.LogSystem.debug("cliccato su navBarNext");
	this.showLoadingDiv();
	this.offset = this.offset + this.number;
	this.getComments(); 
}

	
CommentsController.prototype.connRequestError = function (errorMsg) {	
	EW.LogSystem.error("CommentsController.connRequestError");
	WP.Controller.showErrorDialog ("Err", errorMsg);
	//this.showCommentsList();
}

CommentsController.prototype.connRequestStopped = function () {
	EW.LogSystem.debug("CommentsController.connRequestStopped");
	this.showCommentsList(); 
}

CommentsController.prototype.connRequestCompleted = function (commentsList)
{
	EW.LogSystem.debug("CommentsController.connRequestCompleted");
	EW.LogSystem.debug("numero commenti  " +commentsList.length);
	this.blogObj.isNewComments = false; //azzera la segnalazione di nuovi commenti in home page
	WP.Model.storeBlogs(); //salva le modifiche al blog
	this.blogObj.comments = commentsList;
	this.showCommentsList();
	this.connection = null;
		
}


function GetCommentCountListener(_parent) {
	this._parent =_parent; 
}


GetCommentCountListener.prototype.connRequestError = function (errorMsg) {
	EW.LogSystem.error("GetCommentCountListener.connRequestError");
	WP.Controller.showErrorDialog ("Err", errorMsg);
}

GetCommentCountListener.prototype.connRequestStopped = function () {
	EW.LogSystem.debug("GetCommentCountListener.connRequestStopped");
}

GetCommentCountListener.prototype.connRequestCompleted = function (numOfComm)
{
	EW.LogSystem.debug("GetCommentCountListener.connRequestCompleted");
	this._parent.blogObj.comments_count = numOfComm;
	this._parent.getComments();
}