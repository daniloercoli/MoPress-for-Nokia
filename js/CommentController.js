function CommentController(indiceBlog ,commentObj)
{
	this.indiceBlog = indiceBlog;
	this.blogObj = WP.Model.getBlog(indiceBlog);
	this.connection = null;
	this.commentObj = commentObj;
}

CommentController.prototype.onActivated = function(){
	EW.LogSystem.debug(">>> CommentController.prototype.onActivated");
	var elementiMenu = [];
	
	if (this.commentObj.status.toString() == "hold" || this.commentObj.status.toString() == "spam") {
		elementiMenu.push({
			label: "Approve",
			action: EW.Utils.createMethodReference(this, "editComm", "approve"),
			touch: true
		});
	} 

 	if (this.commentObj.status.toString() == "approve" || this.commentObj.status.toString() == "spam") {
		elementiMenu.push({
			label: "Unapprove",
			action: EW.Utils.createMethodReference(this, "editComm", "hold"),
			touch: true
		});
	} 
	
	if (this.commentObj.status.toString() != "spam") {
		elementiMenu.push({
			label: "Spam",
			action: EW.Utils.createMethodReference(this, "editComm", "spam"),
			touch: true
		});
	}

	elementiMenu.push({
			label: "Trash",
			action: EW.Utils.createMethodReference(this, "deleteComm"),
			touch: true
		});	
				
	WP.Menu.setLeft(elementiMenu);	
	EW.LogSystem.debug("<<< CommentController.prototype.onActivated");
}


CommentController.prototype.showCommentReplyDiv = function(){
	$("com-reply").style.display = '';
	$("comment_reply_btn").style.display = 'none';
	
	if(WP.Layout.isDeviceTouch === true) {
		//$("comment_cancel_reply_btn").focus();
	} else {	
		$("replycontent").focus();
	}
}	

CommentController.prototype.hideCommentReplyDiv = function(){
	$("comment_reply_btn").style.display = '';
	$("replycontent").value = "";
	$("com-reply").style.display = 'none';
}	

CommentController.prototype.reply2Com = function(){
	
  // no auto hiding, wait-type notification, unknown progress
     WP.Controller.showNotification(-1, "wait", "Loading feed...", -1,  EW.Utils.createMethodReference(this,  "stopCommentModeration"));
	 var replyContent = $("replycontent").value;
	 	
	try {
		var replyObj = {
			"comment_parent" : this.commentObj.comment_id,
			"content" : replyContent
		};
		this.connection = new ReplyComment(this.blogObj.username, this.blogObj.password, this.blogObj.xmlrpc, this.commentObj.post_id, replyObj);
		this.connection.addListener(new ReplyCommentListener(this));
		this.connection.startConn();
	}
	catch(errrrrrr) {
		WP.Controller.showErrorDialog ("Err", errrrrrr);
	}
}


CommentController.prototype.editComm = function(comm_action){
	
  // no auto hiding, wait-type notification, unknown progress
     WP.Controller.showNotification(-1, "wait", "Loading feed...", -1,  EW.Utils.createMethodReference(this,  "stopCommentModeration"));
		
	try {
		//this.commentObj.status = comm_action;
		var modObj = {
			"comment_id" : this.commentObj.comment_id,
			"status" : comm_action ,
			"content" : this.commentObj.content
		};
		this.connection = new EditComment(this.blogObj.username, this.blogObj.password, this.blogObj.xmlrpc, modObj);
		this.connection.addListener(new EditCommentListener(this, comm_action));
		this.connection.startConn();
	}
	catch(errrrrrr) {
		WP.Controller.showErrorDialog ("Err", errrrrrr);
	}
}

CommentController.prototype.stopCommentModeration = function(){	

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

CommentController.prototype.deleteComm = function(){
	// no auto hiding, wait-type notification, unknown progress
    WP.Controller.showNotification(-1, "wait", "Loading feed...", -1,  EW.Utils.createMethodReference(this,  "stopCommentModeration"));

	try {
		this.connection = new DeleteComment(this.blogObj.username, this.blogObj.password, this.blogObj.xmlrpc, this.commentObj.comment_id);
		this.connection.addListener(new DeleteCommentListener(this));
		this.connection.startConn();
	}
	catch(errrrrrr) {
		WP.Controller.showErrorDialog ("Err", errrrrrr);
	}
}


CommentController.prototype.onDeactivated = function(){
	this.connection = null;
}

CommentController.prototype.init = function() {
		
	var commentContainer = $("the-comment");
	commentContainer.innerHTML = ""; 
	
	//e da cambiare con un html precostituito da riempire
	var gvtUrl = null;
	if(typeof (this.commentObj.author_email) != "undefined" ) {
		var md5Email = MD5(this.commentObj.author_email);
		gvtUrl = "http://www.gravatar.com/avatar/"+md5Email+"?s=48&amp;d=identicon&amp;r=G";
	} else {
		gvtUrl = "http://www.gravatar.com/avatar/3b3be63a4c2a439b013787725dfce802?s=48&amp;d=identicon&amp;r=G";
	}

 	var contenutoCommento = this.commentObj.content;
	
	//trova lo status del commento
	var additonalPostStyle = "";
	if (this.commentObj.status.toString() == "hold") {
		additonalPostStyle = "pending";
	} else if (this.commentObj.status.toString() == "approve") {
		additonalPostStyle = "approved";
	} else if(this.commentObj.status.toString() == "spam") {
		additonalPostStyle = "spam";
	}

  	var commento = document.createElement('div');
    commento.id ="comment-"+this.commentObj.comment_id;
	commento.className ="comment-item";

	//imposta la email dell'autore del commento se presente
	var author_email_html= "";
	if (typeof(this.commentObj.author_email) != "undefined") {
		author_email_html = '<h4><span>Author Email: '+this.commentObj.author_email+'</span></h4>';
	}

	//imposta la url dell'autore del commento se presente
	var author_url_html = "";
	if (typeof(this.commentObj.author_url) != "undefined") {
		author_url_html = '<h4><span>Author URL: <a href="'+this.commentObj.author_url+'" onclick="widget.openURL(this.href); return false;">'+this.commentObj.author_url+'</a></span></h4>';
	}
	
	//verifica se esiste il titolo del post
	var on_post ="";
	if (typeof(this.commentObj.post_title) != "undefined") {
		on_post= '<h4>On: <span>'+this.commentObj.post_title+'</span></h4>';
	}	
	
	 var htmlCommento = "";
	  htmlCommento+=("<img src='"+gvtUrl+"' class='avatar avatar-48' height='48' width='48'/>");
	  htmlCommento+=("<div class='comment-wrap'>" +
			'<h4 class="comment-meta">From: <cite class="comment-author">'+ this.commentObj.author +'</cite>' +
			on_post +
			'</h4>' +
			author_email_html +
			author_url_html +
			'<h4><span>Status: '+additonalPostStyle+'</span></h4>'+
			"</div>"+
			'<h4 class="comment-meta">Content:</h4>' +
			"<blockquote><p>"+contenutoCommento+"</p></blockquote>"
			);
	  htmlCommento+=("<div style='clear: both;'></div>");
	
	commento.innerHTML = htmlCommento; 
	commentContainer.appendChild(commento);

	
	$("comment_reply_btn").onclick = EW.Utils.createMethodReference(this, "showCommentReplyDiv");
	$("comment_reply_btn").style.display = '';
	$("comment_cancel_reply_btn").onclick = EW.Utils.createMethodReference(this, "hideCommentReplyDiv");
	$("comment_submit_reply_btn").onclick = EW.Utils.createMethodReference(this, "reply2Com");
	
	this.hideCommentReplyDiv();		
}



function EditCommentListener(_parent, comm_action) {
	this._parent =_parent; 
	this._comm_action = comm_action; //approve, hold, spam
}

EditCommentListener.prototype.connRequestError = function (errorMsg) {
	EW.LogSystem.error("EditCommentListener.connRequestError");
	WP.Controller.showErrorDialog ("Err", errorMsg);
}

EditCommentListener.prototype.connRequestStopped = function () {
	EW.LogSystem.debug("EditCommentListener.connRequestStopped");
	WP.Controller.hideNotification();
}

EditCommentListener.prototype.connRequestCompleted = function (_response)
{
	EW.LogSystem.debug("EditCommentListener.connRequestCompleted: "+ _response);
	EW.LogSystem.debug(typeof(_response)) ;
	
	if(_response === false) {
	//notifica che non si è potuto gestire il commento		
	 return;
	}
	
	var commentsList = this._parent.blogObj.comments;
	for (var x = 0; x < commentsList.length; x++) {
		EW.LogSystem.debug("comment_id" + commentsList[x].comment_id);
		if (commentsList[x].comment_id == this._parent.commentObj.comment_id) {
			this._parent.blogObj.comments[x].status = this._comm_action; 
			EW.LogSystem.debug("modifico dalla lista il commento - " + commentsList[x].comment_id);	
			break;
		}
	}
			
	WP.Controller.hideNotification();
	WP.Layout.goBack();
}


function DeleteCommentListener(_parent) {
	this._parent =_parent; 
}


DeleteCommentListener.prototype.connRequestError = function (errorMsg) {
	EW.LogSystem.error("DeleteCommentListener.connRequestError");
	WP.Controller.showErrorDialog ("Err", errorMsg);
	WP.Controller.hideNotification();
}

DeleteCommentListener.prototype.connRequestStopped = function () {
	EW.LogSystem.debug("DeleteCommentListener.connRequestStopped");
	WP.Controller.hideNotification();
}

DeleteCommentListener.prototype.connRequestCompleted = function (_response)
{
	EW.LogSystem.debug("DeleteCommentListener.connRequestCompleted:");
	EW.LogSystem.debug(typeof(_response)) ;
	if(_response === false) {
	//notifica che non si è potuto cancellare il commento		
	 return;
	}
	var commentsList = this._parent.blogObj.comments;
	
	for (var x = 0; x < commentsList.length; x++) {
		EW.LogSystem.debug("comment_id" + commentsList[x].comment_id);
		if (commentsList[x].comment_id == this._parent.commentObj.comment_id) {
			this._parent.blogObj.comments.splice(x, 1);
			EW.LogSystem.debug("elimino dalla lista il commento - " + commentsList[x].comment_id);	
			break;
		}
	}
	
	WP.Controller.hideNotification();
	WP.Layout.goBack();
}


function ReplyCommentListener(_parent) {
	this._parent =_parent; 
}

ReplyCommentListener.prototype.connRequestError = function (errorMsg) {
	EW.LogSystem.error("ReplyCommentListener.connRequestError");
	WP.Controller.showErrorDialog ("Err", errorMsg);
}

ReplyCommentListener.prototype.connRequestStopped = function () {
	EW.LogSystem.debug("ReplyCommentListener.connRequestStopped");
	WP.Controller.hideNotification();
}

ReplyCommentListener.prototype.connRequestCompleted = function (_response)
{
	EW.LogSystem.debug("ReplyCommentListener.connRequestCompleted: "+ _response);
	EW.LogSystem.debug(typeof(_response)) ;
	
	try {
		this.connection = new GetComment(this._parent.blogObj.username, this._parent.blogObj.password, this._parent.blogObj.xmlrpc, _response);
		this.connection.addListener(new GetCommentListener(this._parent));
		this.connection.startConn();
	}
	catch(errrrrrr) {
		WP.Controller.showErrorDialog ("Err", errrrrrr);
	}

}

//viene chiamato dp aver aggiunto un commento per avere tutte le informazioni su di esso già disponibili e corrette
function GetCommentListener(_parent) {
	this._parent =_parent; 
}

GetCommentListener.prototype.connRequestError = function (errorMsg) {
	EW.LogSystem.error("GetCommentListener.connRequestError");
	WP.Controller.showErrorDialog ("Err", errorMsg);
}

GetCommentListener.prototype.connRequestStopped = function () {
	EW.LogSystem.debug("GetCommentListener.connRequestStopped");
	WP.Controller.hideNotification();
}

GetCommentListener.prototype.connRequestCompleted = function (_response)
{
	EW.LogSystem.debug("GetCommentListener.connRequestCompleted");
				
	var commentsList = this._parent.blogObj.comments;
	for (var x = 0; x < commentsList.length; x++) {
		EW.LogSystem.debug("comment_id" + commentsList[x].comment_id);
		if (commentsList[x].comment_id == this._parent.commentObj.comment_id) {
			//trovato il commento padre. inseriamo qui la nostra risposta.
			 this._parent.blogObj.comments.splice ( (x+1), 0, _response );
			break;
		}
	}
		
	WP.Controller.hideNotification();
	WP.Layout.goBack();
}
