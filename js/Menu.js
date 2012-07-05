if (typeof(WP) == "undefined") {
	var WP = {};
}

WP.Menu = {}

WP.Menu.init = function(){
	//widget.setNavigationEnabled(false);
	
//the menu obj read the WP.Layout.isDeviceTouch property to know what type of menu should build
	if(WP.Layout.isDeviceTouch) {
		menu.hideSoftkeys();
		
	} else {
		menu.showSoftkeys();
		menu.setRightSoftkeyLabel("Exit", WP.Layout.goExit);
	}
}

//chiamato dal codice che si occupa della interazione della pagina
WP.Menu.setLeft = function (arrayComandi)
{
	
	var bottomBar = document.getElementById("footer_list");
	bottomBar.innerHTML = "";
    var bottomBarHtml = "";
	menu.clear();
    
	if (WP.Layout.isDeviceTouch) {
		menu.hideSoftkeys();
		/* Assign the .two-piece, .three-piece, or .four-piece class to the <li> 
		 * tag to create multiple navigation bars, each with a different number of buttons. 
		 * Note: The number of<li> divisions must match the style used.
		 */ 

        var classForListItem = "two-piece";
        
        if (arrayComandi.length == 3) 
            classForListItem = "three-piece";
        else 
            if (arrayComandi.length >= 4) 
                classForListItem = "four-piece";
      
        bottomBar.innerHTML = "";
    }
  
   var numeroElementiMenuTouch = 0;
	for (var i = 0; i < arrayComandi.length; i++) {
		var mnuObj = arrayComandi[i];
		
	//	mnuObj.label;
	//	mnuObj.action;
	//  mnuObj.touch
		
		if (WP.Layout.isDeviceTouch) {
		// Assign functionality to bottom bar buttons.
			if( numeroElementiMenuTouch < 4 && mnuObj.touch === true ) {
				
				var itemLista = document.createElement('li');
		 		itemLista.className = classForListItem;
				var ancora = document.createElement('a');
				ancora.onclick = mnuObj.action;
				// now create clickable text
				var etichetta = document.createTextNode(mnuObj.label);
				ancora.appendChild(etichetta);
				
				itemLista.appendChild(ancora);
	
				bottomBar.appendChild(itemLista);
				numeroElementiMenuTouch++;

				
			}
		}
		else {
			var newMenuItem = new MenuItem(mnuObj.label, i);
			newMenuItem.onSelect = mnuObj.action;
			menu.append(newMenuItem);	
		}
	}
    
    if (WP.Layout.isDeviceTouch) {
        var bottomBar = document.getElementById("footer_list");
		document.getElementById("footer").style.display = ''; 
				
    } else {
        //i've cleared the menu so we should re-add the right key
        if (WP.Layout.screenHistory.length > 0) {
            menu.setRightSoftkeyLabel("Back", WP.Layout.goBack);
        }
        else {
            menu.setRightSoftkeyLabel("Exit", WP.Layout.goExit);
        }
		document.getElementById("footer").style.display = 'none'; //per sicurezza spengo la barra ancora una volta
	}
}

WP.Menu.setRightSoftkeyLabel = function (key, func) {
	 if (!WP.Layout.isDeviceTouch) {
		menu.setRightSoftkeyLabel(key, func);
	 }
}

//chiamato dal codice "generale" che si occupa della transizione tra schermi
WP.Menu.updateSoftkeys = function (screenName)
{
	if (WP.Layout.isDeviceTouch) {
		WP.Menu._updateTouch(screenName);
	} else {
		WP.Menu._updateMenu(screenName);
	}	
}

WP.Menu._updateTouch = function (screenName) {
		menu.hideSoftkeys();
				
		// Assign functionality to top bar buttons.
		var backButton = document.getElementById( "button_t1" );
		if (WP.Layout.screenHistory.length > 0) {
			backButton.style.display = '';
			backButton.onclick = WP.Layout.goBack;	
		} else {
			backButton.style.display = 'none';
			backButton.onclick = function () {return false;}
		}

		var exitButton = document.getElementById( "button_t2" );
		exitButton.onclick = WP.Layout.goExit;
		
		
		//inserisci qua il comportamento generale della barra
		var bottomBar = document.getElementById("footer_list");
	    bottomBar.innerHTML = "";
}

WP.Menu._updateMenu = function (screenName) {
	
	menu.clear();
			
	if(WP.Layout.screenHistory.length > 0)
	{
		menu.setRightSoftkeyLabel("Back", WP.Layout.goBack);
	}
	else
	{
		menu.setRightSoftkeyLabel("Exit", WP.Layout.goExit);
	}
}
