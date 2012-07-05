	
function MiniView() {
	this.blogNumbers = 0; 
	this.currentBlog=0;
	this.connection = null;
}


MiniView.prototype.onActivated = function() {
	this.blogNumbers = WP.Model.getBlogs().length;
	this.currentBlog = 0;
	this.connection = null;
	
	// Get the refresh rate.
	var refresh = parseInt( widget.preferenceForKey( "KEY_REFRESH" )) ;
	if ( isNaN( refresh ) ) {
		refresh = (5*60000); // Default to 5 minute
	}
	
	$("mini_view_content").innerHTML = "No updates!";
	
	EW.LogSystem.debug("miniview attiva" );
	
	if(this.timerId != null) 
		clearInterval( this.timerId );
		
	// Start the timer which refreshes the miniview.
	this.timerId = setInterval( 
		EW.Utils.createMethodReference(this, "refresh"),
		 refresh
		 );
	
	// Timer will trigger after the refresh period so refresh manually now.
	//this.refresh();
}

MiniView.prototype.refresh = function() {
    EW.LogSystem.debug("MiniView.refresh");
		
    if (this.blogNumbers == 0) 
        return; //non ci sono blog, quindi non aggiornare nulla	

    if (this.currentBlog >= this.blogNumbers) {
		this.currentBlog = 0;
		return; //siamo arrivati al termine dell'aggiornamento
	} 
		  
    var blogObj = WP.Model.getBlog(this.currentBlog);
    try {
        this.connection = new GetCommentCount(blogObj.username, blogObj.password, blogObj.xmlrpc);
        this.connection.addListener(this);
        this.connection.startConn();
    } 
    catch (errrrrrr) {
        EW.LogSystem.error("MiniView.refresh" + errrrrrr.description);
        //this.nextBlog();
    }
}

MiniView.prototype.nextBlog = function(){
	EW.LogSystem.debug("MiniView.nextBlog");
	this.currentBlog++;
	this.refresh();    
}
		
MiniView.prototype.connRequestError = function (errorMsg) {	
	EW.LogSystem.error("MiniView.connRequestError");
	this.nextBlog();
	//TODO forse bisogna notificare che l'auto update è andato in errore?
//	WP.Controller.showErrorDialog ("Err", errorMsg);
}

MiniView.prototype.connRequestStopped = function () {
	EW.LogSystem.debug("MiniView.connRequestStopped");
}

MiniView.prototype.connRequestCompleted = function (numOfComm)
{
	EW.LogSystem.debug(">>> MiniView.connRequestCompleted");
	var blogObj = WP.Model.getBlog(this.currentBlog) ;
	
	EW.LogSystem.debug("numOfComm.awaiting_moderation: "+numOfComm.awaiting_moderation);
	EW.LogSystem.debug("blogObj.comments_count.awaiting_moderation: "+blogObj.comments_count.awaiting_moderation);
	
	if (numOfComm.awaiting_moderation.toString() != blogObj.comments_count.awaiting_moderation.toString()) {
		EW.LogSystem.debug("Numero di commenti trovati è diverso: ");
		blogObj.isNewComments = true;
		WP.Model.storeBlogs(); //salva le modifiche
		$("mini_view_content").innerHTML = "There are new comments!"; 
	}
	this.nextBlog();	
}

MiniView.prototype.onDeactivated = function() {
	
	if (this.connection !== null) {
		this.connection.stopConn();
		this.connection = null;
	}
	this.currentBlog = 0;
	// Stop timer.
	clearInterval( this.timerId );
	EW.LogSystem.debug("mini view disattiva");	
}