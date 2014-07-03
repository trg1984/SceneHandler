function SceneHandler() {
	this.scenes = [];
	this.savedScenes = {};
	this.previous = null;
	this.current = null;
}


SceneHandler.prototype.drawNextScene = function() {
	if (this.scenes.length > 0) {
		
		var self = this;
		self.previous = self.current;
		var current = self.current = this.scenes.shift();
		self.renderer(
			current.func,
			current.place,
			current.config,
			current.translations,
			function() { self.drawNextScene() }
		);
	}
}

SceneHandler.prototype.push = function(func, place, config, translations) {
	var self = this; 

	//Default values
	var configs = {
			func: func,
			place: place,
			config: {
				name: 'page',
				saveAs: '',
				spawnTransition: 'page-scaleUp', //in separate css
				removeTranstion: 'page-moveToLeft', //in separate css
				transition: true, 
				className: 'page-' + self._guid(),
				html: '',
				clickable: true,
				},
			translations: translations
			};	

	for (var item in config) configs.config[item] = config[item];
	this.scenes.push(configs);
}


SceneHandler.prototype.renderer = function(func, place, config, translations, next) {
	var self = this;
	// is saved?
	if(self.previous && self.previous.config.saveAs) {
		self._saveScene(self.previous);
	}
	else {
		// if this is the first, there is no previous
		if(self.previous) {
			self._removePrevious();
		}
		else {
			self._appendNext();
		}
	}

	if(func) {func();}

	if (typeof(config.clickable) === 'boolean' || config.clickable) {
		$('body').on('click', '.' + config.className, next);
	}
	else setTimeout(next, 2000);
}

// don't remove, just hide
SceneHandler.prototype._saveScene = function(scene) {
	var self = this;
	self.savedScenes[scene.config.saveAs] = scene;	

	if(scene.config.transition) {
		function animationEnd(e) {
			$('.'+scene.config.className).hide();
			self._appendNext();
		}
		self._eventListener($('.'+scene.config.className)[0], "AnimationEnd", animationEnd);
		$('.'+scene.config.className).addClass(scene.config.removeTransition);

	}
	else {
		$('.'+scene.config.className).hide();
	}

}

SceneHandler.prototype.showScene = function(name) {
	var self = this;
	var scene = self.savedScenes[name];

	if(scene) {
		self.scenes.unshift(scene);

		$('.'+scene.config.className).show();

		self.drawNextScene();
	}
}

SceneHandler.prototype._removePrevious = function() {
	var self = this;

	// remove previous page
	if(self.previous.config.transition) {
		function animationEnd(e) {
			$('.'+self.previous.config.className).remove();

			console.log("removeAnimationEnd");
			self._appendNext();
		}

		self._eventListener($('.'+self.previous.config.className)[0], "AnimationEnd", animationEnd);

		$('.'+self.previous.config.className).addClass(self.previous.config.removeTransition);

	}

	else {
		$('.'+self.previous.config.className).remove();
		self._appendNext();
	}
}


SceneHandler.prototype._appendNext = function() {
	console.log("add new");
	var self = this;
	var place = self.current.place;

	if(self.current.config.transition) {

		place.append('<div class="hidden ' + self.current.config.className + ' ' + self.current.config.name + ' ' +self.current.config.spawnTransition+ '"></div>');
		setTimeout(function(){
			$('.'+self.current.config.className).removeClass('hidden');
		}, 0);

		//add html-content
		$('.'+self.current.config.className).append(self.current.config.html);
	}

	else {
		place.append('<div class="' + self.current.config.className + ' ' + self.current.config.name +'"></div>');
		
		//add html-content
		$('.'+self.current.config.className).append(self.current.config.html);

	}
}

SceneHandler.prototype._eventListener = function(element, type, callback) {
	//takes in jquery-object and changes it to reqular dom element.

	var pfx = ["webkit", "moz", "MS", "o", ""];

	for (var p = 0; p < pfx.length; p++) {
		if (!pfx[p]) type = type.toLowerCase();
		element.addEventListener(pfx[p]+type, callback, false);
	}
}

SceneHandler.prototype._guid = function() {

	  function s4() {
	    return Math.floor((1 + Math.random()) * 0x10000)
	               .toString(16)
	               .substring(1);
	  }
	
	    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
	           s4() + '-' + s4() + s4() + s4();
}

