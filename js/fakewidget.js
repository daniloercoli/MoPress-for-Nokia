/**
 * Check if the widget object exists. To test it on a webpage we create 
 * a dummy widget object.
 */
if("undefined" == typeof widget) 
{
	var widget = {};
	
	widget.isFake = true; //set the fake flag
	
	widget.__preferences = {};
	
	widget.setPreferenceForKey = function(value, key) 
	{
		widget.__preferences[key] = value;
	}
	
	widget.preferenceForKey = function(key)
	{
		return 	widget.__preferences[key];
	}
	
	widget.prepareForTransition = function (mode) {
		
	}
	
	widget.performTransition = function () {
		
	}
	
	widget.setNavigationEnabled = function (mode) {
		
	}
	
	widget.openURL = function (url) {
		// outside WRT
	    window.open(url, "NewWindow");
	}
	
	//creating the fake menu object
	var menu = {};
	menu.setRightSoftkeyLabel = function (key, func){ }
	menu.showSoftkeys = function() {}
	menu.hideSoftkeys = function() {}
	menu.clear = function() {}
	menu.append = function(elemento) {}
	
	//creo il finto menuitem Obj
	MenuItem = function(testo, indice) {
		
	};
	MenuItem.prototype.onSelect = function () {};

}

