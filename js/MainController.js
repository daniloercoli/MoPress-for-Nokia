/** codice js (controller) della View mainView.html */

function MainController()
{
	
}


MainController.prototype.onActivated = function(){
	var elementiMenu = [];
	
	elementiMenu.push({
		label: "Add Blogs",
		action: function(){WP.Controller.showAddBlogsScreen()},
		touch: false
	});
	
	elementiMenu.push({
		label: "About",
		action: function(){
			WP.Layout.gotoScreen('pnlAbout')
		},
		touch: false
	});
	
	WP.Menu.setLeft(elementiMenu);	
	
	
	$("home_screen_blogs_list").innerHTML = "";
	
	var blogs = WP.Model.getBlogs();
	
	if (blogs.length > 0) {
		var listaBlogs = $("home_screen_blogs_list");
		
		//new Option(userBlogs[x].blogName, userBlogs[x].blogid)
		var nuovoContenuto = "";
		for (var j = 0; j < blogs.length; j++) {
			
			var markerNuoviCommenti ="";
			if (blogs[j].isNewComments == true )
				markerNuoviCommenti= " (*)";
				
			nuovoContenuto+=("<li><a href='#' onclick='WP.Controller.showBlogScreen(" + j + ");return false;'>" + blogs[j].blogName + markerNuoviCommenti + "</a></li>");
		}
		nuovoContenuto+=("<li><a href='#' onclick='WP.Controller.showAddBlogsScreen();'>Add another blog...</a></li>");
		
		listaBlogs.innerHTML = nuovoContenuto;
		
		$("home_screen_blogs_list").style.display = '';
		$("home_screen_empty_list").style.display = 'none';
		
	} else {
		$("home_screen_blogs_list").style.display = 'none';
		$("home_screen_empty_list").style.display = '';
	}
}

MainController.prototype.onDeactivated = function(){
}


MainController.prototype.init = function() {
}
