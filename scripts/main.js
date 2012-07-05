function $(id)
{
	return document.getElementById(id);
}

var miniView = new MiniView(); //controller della vista mini

if (typeof(WP) == "undefined") {
	var WP = {};
}

WP.Model = {};

WP.Model.blogs = [];

WP.Model.getBlogs = function() {
	return WP.Model.blogs;
}

WP.Model.addBlog = function(_blog) {
	WP.Model.blogs.push(_blog);
}

WP.Model.getBlog = function(indice) {
	return WP.Model.blogs[indice];
}

WP.Model.removeBlog = function(indice) {
	WP.Model.blogs.splice(indice, 1);
	WP.Model.storeBlogs();
}

//load blogs from device memory
WP.Model.loadStoredBlogs = function(){
    try {
        var res = widget.preferenceForKey('my_blogs');
		
        if (res != null && res != undefined && res.length > 0) {
            EW.LogSystem.debug("Caricato i seguenti blogs: "+ res);
            
			eval("WP.Model.blogs = " + res);
            //alert(JSON.stringify(WP.Model.blogs));
        }
        else {
			EW.LogSystem.debug("non è stato trovato alcun blog memorizzato nella applicazione");
            //array dei blog è già vuoto
        }
    } 
    catch (errSerializz) {
       EW.LogSystem.error("errore caricamento blog - " + errSerializz.description);
       alert("Error while loading blogs\n" + errSerializz.name + "\n" + errSerializz.message);
	   //resetto tutti i blog salvati
	   WP.Model.blogs = [];
	   WP.Model.storeBlogs();
    }
}

//salva i blog nella memoria del dispositivo
WP.Model.storeBlogs  = function () 
{ 
	try {
		EW.LogSystem.debug("Memorizzo sul device i seguenti blogs: "+ JSON.stringify(WP.Model.blogs));
		//alert(JSON.stringify(WP.Model.blogs));
		widget.setPreferenceForKey(JSON.stringify(WP.Model.blogs), 'my_blogs');
		EW.LogSystem.debug("Memorizzazione ok");
	} catch (errSerializz) {
		EW.LogSystem.error("errore nel salvataggio su disco dei blogs");
		
	}
}

WP.Layout = {};

WP.Layout.screenWidth = window.innerWidth;

WP.Layout.screenHeight = window.innerHeight;

WP.Layout.currentScreen = 'splash_screen';

WP.Layout.currentController = null;

WP.Layout.screenHistory = new Array();

WP.Layout.screenController = new Array();

WP.Layout.isDeviceTouch = false; //setting to true on the touch/large device

WP.Layout.gotoPreviousScreen = function ()
{
	if(WP.Layout.screenHistory.length > 0)
	{
		var prevScreen = WP.Layout.screenHistory.pop();	
		
		var prevController = WP.Layout.screenController[prevScreen];
		if (typeof(prevController) == "undefined") {
			prevController = null;
		} 
				
		WP.Layout.gotoScreen(prevScreen, true, prevController);
	}
}

WP.Layout.gotoScreen = function (screenName, avoidHistory, screenController)
{
	$("error_popup").style.display = 'none'; //spegne ogni error popup per sicurezza
	$("results_loader").style.display = 'none'; //spegne ogni loading popup per sicurezza
		
	if (typeof(screenController) == "undefined") {
		screenController = null;
	}
		
	if(screenName != WP.Layout.currentScreen)
	{
		widget.prepareForTransition('fade');
		
		$(screenName).style.display = '';
		$(WP.Layout.currentScreen).style.display = 'none';
		
		if (WP.Layout.currentController != null) {
			WP.Layout.currentController.onDeactivated(); //chiamiamo la deactivate sul controller corrente
		}
		
		// Known issue: Below line doesn't work if the activation comes from widget's submenu.
		//widget.performTransition();
		setTimeout ( "widget.performTransition();", 0 );

		
		if(!avoidHistory)
		{
			//siamo inserendo la vista per la prima volta, inizializziamo quindi anche il controller
			WP.Layout.screenHistory.push(WP.Layout.currentScreen);
			WP.Layout.screenController[WP.Layout.currentScreen] = WP.Layout.currentController;
			WP.Menu.updateSoftkeys(screenName);
			
			if(screenController !== null) {
				screenController.init();
			}
		} else {
			WP.Menu.updateSoftkeys(screenName);
		}
		
		WP.Layout.currentScreen = screenName;
		WP.Layout.currentController = screenController;
	    
		if (screenController !== null) {
			//chiama la activare sul controller qua
			screenController.onActivated();
		}
	}
}


// Identifies the device by querying its resolution
/* controlliamo se è un dispositivo touch ed inizializza la variabile WP.Layout.isDeviceTouch */
WP.Layout.detectResolution =  function() {

/*	versione precedente completamente basata sullo user agent. 
 * Fallisce però su alcuni modelli. es: Emulatore M97 si identifica come S60-3ed	
 * 
 * var myStyleTweaks = new StyleTweaker();
	myStyleTweaks.add("Series40/6.0", "styles/tweaks/S406th.css");
	myStyleTweaks.add("Series60/3.2", "styles/tweaks/S603rdFP2.css");
	myStyleTweaks.add("Series60/5.0", "styles/tweaks/S605th.css");
	myStyleTweaks.add("N900", "styles/tweaks/maemo.css");
	myStyleTweaks.add("AppleWebKit/420+", "styles/tweaks/S406th.css");
	myStyleTweaks.add("Opera Mini/4", "styles/tweaks/operamini.css");
	myStyleTweaks.tweak();
	*/

    var screenWidth = screen.width;
    var screenHeight = screen.height;
    
    if (screenWidth == 240 && screenHeight == 320) {
        //resolution = RESOLUTION_QVGA_PORTRAIT;
		WP.Layout.isDeviceTouch = false;
		loadStylesheet("styles/tweaks/S603rdFP2.css");
    } else if (screenWidth == 320 && screenHeight == 240) {
        //resolution = RESOLUTION_QVGA_LANDSCAPE;
		WP.Layout.isDeviceTouch = false;
		loadStylesheet("styles/tweaks/S603rdFP2.css");
    } else if (screenWidth >= 360 && screenHeight >= 640) {
        //resolution = RESOLUTION_NHD_PORTRAIT;
		WP.Layout.isDeviceTouch = true;
		loadStylesheet("styles/tweaks/S605th.css");
    } else if (screenWidth >= 640 && screenHeight >= 360) {
        //resolution = RESOLUTION_NHD_LANDSCAPE;
		WP.Layout.isDeviceTouch = true;
		loadStylesheet("styles/tweaks/S605th.css");
    } else if (screenWidth == 800 && screenHeight == 352) {
        //resolution = RESOLUTION_E90_LANDSCAPE;
		WP.Layout.isDeviceTouch = false;
		loadStylesheet("styles/tweaks/S603rdFP2.css");
    } else {
        //resolution = RESOLUTION_UNDEFINED;
		WP.Layout.isDeviceTouch = false;
		loadStylesheet("styles/tweaks/S603rdFP2.css");
    }
}


WP.Layout.MINI_VIEW_TRESHOLD = 150;
WP.Layout.SMALL_SCREEN_TRESHOLD = 320;

WP.Layout.isMiniViewMode = function () {
	var _screenHeight = window.innerHeight;
	return ( _screenHeight < WP.Layout.MINI_VIEW_TRESHOLD );
}	

//Some devices, as explained here, http://library.forum.nokia.com/topic/Web_Developers_Library/GUID-B12990B6-979C-4BBA-B030-FB7CEC04CB3A.html 
//do not support the 'onResize' event... 
WP.Layout.pollResize = function() {
	//EW.LogSystem.debug(">>> pollResize" );
	var isInMiniView = WP.Layout.isMiniViewMode();
	if(isInMiniView) return;
	
    if (window.innerWidth != WP.Layout.screenWidth || window.innerHeight != WP.Layout.screenHeight) {
		EW.LogSystem.debug("pollResize event trigged!" );
        WP.Layout.onResize();
    }
}

WP.Layout.resizeNormalView = function() {

	EW.LogSystem.debug("Resizing UI method" );
	//we could define great layout changes here!!!
	WP.Layout.screenWidth = window.innerWidth;
	WP.Layout.screenHeight = window.innerHeight;	

/*	i cambiamenti dello splash sono fatti a livello di css ora!!
 * supportano anche le media query!!!
 * if(WP.Layout.screenHeight > 360)
	{
		$('splash').src = "images/splash.png";
	//	$('logo').src = "images/logo.png";
	//	$('logo').style.display = '';
	}
	else
	{
		$('splash').src = "images/splash_small.png";
		//$('logo').src = "images/logo_small.png";
		//$('logo').style.display = 'none';
	}*/
}

WP.Layout.onResize = function(){

	//se non siamo nello stato mini fai il resize classico
    if (!WP.Layout.isMiniViewMode()) {
        WP.Layout.resizeNormalView();
    } 
	
	WP.Layout.setViewMode();
}

WP.Layout.setViewMode = function (){
	
	if ( WP.Layout.isMiniViewMode() ) {
		// Hide main screen.
		$("wrap").style.display = 'none';
		if (WP.Layout.currentController !== null) {
			//chiama la onDeactivated 
			WP.Layout.currentController.onDeactivated();
		}				
		// ... and show MiniView.
		$("mini_view").style.display = '';
		miniView.onActivated();
	} else {
		
		// Hide MiniView.
		$("mini_view").style.display = 'none';
		miniView.onDeactivated();
		if (WP.Layout.currentController !== null) {
			//chiama la onActivated 
			WP.Layout.currentController.onActivated();
		}
		// ... and show main screen.
		$("wrap").style.display = '';
	}
}

WP.Layout.goExit = function()
{
	window.close();
}

WP.Layout.goBack = function ()
{
	WP.Layout.gotoPreviousScreen();
}

/* splash screen */
WP.Layout.dismissSplashScreen = function()
{

	WP.Layout.gotoScreen('home_screen', true, new MainController());
	$("top_bar").style.display = '';
	
	//se all'avvio siamo gia' in miniview allora richiamo subito il metodo apposito
	if ( WP.Layout.isMiniViewMode() )
		WP.Layout.setViewMode(); 
}


WP.Controller = {};
	
WP.Controller.isWidget = false; //indica se siamo nel mondo delle widget

WP.Controller.init = function () {
	
	if (widget.isFake === true) {
		WP.Controller.isWidget = false;
	}
	else {
		WP.Controller.isWidget = true;
	}

   /* controlliamo se è un dispositivo touch ed inizializza la variabile WP.Layout.isDeviceTouch*/
	WP.Layout.detectResolution();

	/*
	  //this.ua = navigator.userAgent;
	  if (navigator.userAgent.match("Gecko")) {
			alert("oks");
		}
	 */
	//alert(navigator.userAgent.toString());

	WP.Menu.init();
	
	WP.Layout.onResize(); //resize the widget at startup!!
 	
	/**
	 * Polling for display rotations
	 * Some devices, as explained here, http://library.forum.nokia.com/topic/Web_Developers_Library/GUID-B12990B6-979C-4BBA-B030-FB7CEC04CB3A.html 
	 * do not support the 'onResize' event. 
	 * So, the approach defined in the linked Forum Nokia Library page is implemented, 
	 * in order to correctly manage display resize events also on these devices. 
	 * The following pollResize() method is defined.
	 */
    setInterval( function(){
		       WP.Layout.pollResize();
    }, 1000);
	
	//load the prec blogs
	WP.Model.loadStoredBlogs();
	
	setTimeout(WP.Layout.dismissSplashScreen, 1000);
	
};

// Displays error dialog.
//la dialog viene rimossa quando c'è una transizione tra schermi
WP.Controller.showErrorDialog = function(error_title, error_obj) {
	 EW.LogSystem.error("showErrorDialog: "+error_obj.name + "--" + error_obj.message);	
	 
	//http://www.javascriptkit.com/javatutors/trycatch2.shtml
	WP.Controller.hideNotification(); //chiude se visibile il popup del caricamento in corso
	
	$("errorTitle").innerHTML = error_title;
	$("errorMessage").innerHTML = error_obj.name + "\n" + error_obj.message;
	$("error_popup").style.height = ""+ window.innerHeight+"px";
	$("error_popup").style.width = ""+window.innerWidth+"px";
	$("error_popup").style.display = '';
};

// Hides the currently displayed notification.
WP.Controller.hideErrorDialog = function() {
	$("error_popup").style.display = 'none';
};

// Displays a notification.
WP.Controller.showNotification = function(displayTime, type, text, progress, stopFunc) {
    EW.LogSystem.debug("showNotification(" + displayTime + ", " + type + ", " + text + ", " + progress + ")");
	
	$("loaderLoadingTitle").innerHTML = 'LOADING';
	$("loaderLoadingSubtitle").innerHTML = 'Please wait while we process data...';
	$("results_loader").style.height = ""+ window.innerHeight+"px";
	$("results_loader").style.width = ""+window.innerWidth+"px";
	$("results_loader").style.display = '';

	if (typeof(stopFunc) != "undefined") {
		$("loaderLoadingButton").style.display = '';
		$("loaderLoadingButton").onclick = stopFunc;	
	} else {
		$("loaderLoadingButton").style.display = 'none';
	}
};

// Hides the currently displayed notification.
WP.Controller.hideNotification = function() {
    EW.LogSystem.debug("hideNotification");
	$("results_loader").style.display = 'none';
    // hide the notification popup
};

WP.Controller.showAddBlogsScreen = function() {
	var bc = new AddBlogs();
	WP.Layout.gotoScreen('pnlFirstTimeWizard', false, bc);
};


WP.Controller.showBlogScreen = function(indiceBlog) {
	var bc = new BlogController(indiceBlog);
	WP.Layout.gotoScreen('pnlBlog', false, bc);
	}
	
WP.Controller.showBlogOptionsScreen = function(indiceBlog) {
	var bc = new BlogOptionsController(indiceBlog);
	WP.Layout.gotoScreen('pnlConfig', false, bc);
}

WP.Controller.showPostsScreen = function (indiceBlog) {
	var bc = new NewPostController(indiceBlog);
	WP.Layout.gotoScreen('pnlNewPost', false, bc);
}

WP.Controller.showCommentsScreen = function(indiceBlog) {
	var bc = new CommentsController(indiceBlog);
	WP.Layout.gotoScreen('pnlComments', false, bc);
}

WP.Controller.showCommentScreen = function(indiceBlog, commentObj) {
	var bc = new CommentController(indiceBlog, commentObj);
	WP.Layout.gotoScreen('pnlComment', false, bc);
}

/*
 * 
 * general  event handling 
 * 
 */ 
window.onresize = function(event)
{
	WP.Layout.onResize();
}

/*
The home screen communicates with the widget when users interact with the home screen. 
Communication between the home screen and the widget occurs at the system level, so it happens automatically. 
When the widget receives communication from the home screen, it fires the following events:

    *  onload() and onshow() when users add a widget to the home screen.
    *  onshow() and onresize() when the mobile device user selects a home screen widget to launch it in full view.
    *  onshow() and onresize() when the home screen moves from the background to the foreground.
*/
window.onshow = function(event)
{
	WP.Layout.setViewMode();
}


var ImagePreloader = {
	list: [],
	images: [],
	
	add: function( images ) {
		this.list = this.list.concat( images );
	},
	
	start: function() {
		for (var i = 0; i < this.list.length; i++) {
			var img = new Image();
			img.src = this.list[i];
			
			this.images.push( img );
		}		
	}
}

// Preload images before they are displayed to avoid flicker
// when loading them up for the first time.
//WE SHOULD USE THE URL(imagepath) syntax IN THE CSS WHEN LOAD THE IMAGE
function preloadImages() {

	ImagePreloader.add( [
		"images/splash.png",
		"images/splash_small.png",
		"images/ProgressBarUnknown.gif",
		"images/pop_up_bg.png",
		"images/shadow.png",
		"images/img-logo_small.png",
		"images/img-branding-background.png",
		"images/disclosure-indicator.png"		
		 ] );		

	ImagePreloader.start();
}

//inizializza il log system dopo aver creato gli oggetti widget
EW.LogSystem.init();	