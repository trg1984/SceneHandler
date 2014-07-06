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
			current.sceneConfig,
			function() { self.drawNextScene() }
		);
	}
}

SceneHandler.prototype.push = function(func, place, sceneConfig, config) {
	var self = this; 

	//Default values
	var scene = {
			func: func,
			place: place,
			config: {
				content: '',
			},
			sceneConfig: {
				name: 'page',
				saveAs: '',
				spawnTransition: 'page-scaleUp', //in separate css
				removeTranstion: 'page-moveToLeft', //in separate css
				transition: true, 
				className: 'page-' + self._guid(),
				clickable: true,
				translations: null,
				}
			};	

	for (var item in sceneConfig) scene.sceneConfig[item] = sceneConfig[item];
	for (var item in config) scene.config[item] = config[item];

	this.scenes.push(scene);
}


SceneHandler.prototype.renderer = function(func, place, sceneConfig,config, next) {
	var self = this;
	// is saved?
	// if(self.previous && self.previous.sceneConfig.saveAs) {
	// 	self._saveScene(self.previous);
	// 	console.log("self.previous: ", self.previous);
	// }
	// else {
		// if this is the first, there is no previous
		if(self.previous) {
			self._removePrevious();
		}
		else {
			self._appendNext();
		}
	// }

	if(func) {func(place,config, sceneConfig, next);}

}

//Save the scene
SceneHandler.prototype.save = function(name, func, place, sceneConfig, config) {
	var self = this;

	//Default values
	var scene = {
			func: func,
			place: place,
			config: {
				content: '',
			},
			sceneConfig: {
				name: 'page',
				spawnTransition: 'page-scaleUp', //in separate css
				removeTranstion: 'page-moveToLeft', //in separate css
				transition: true, 
				className: 'page-' + self._guid(),
				clickable: true,
				translations: null,
				}
			};	

	for (var item in sceneConfig) scene.sceneConfig[item] = sceneConfig[item];
	for (var item in config) scene.config[item] = config[item];

	self.savedScenes[name] = scene;	

	// if(scene.config.transition) {
	// 	function animationEnd(e) {
	// 		$('.'+scene.config.className).hide();
	// 		self._appendNext();
	// 	}
	// 	self._eventListener($('.'+scene.config.className)[0], "AnimationEnd", animationEnd);
	// 	$('.'+scene.config.className).addClass(scene.config.removeTransition);

	// }
	// else {
	// 	$('.'+scene.config.className).hide();
	// }

}


SceneHandler.prototype.pushSaved = function(name) {
	var self = this;
	var scene = self.savedScenes[name];

	if(scene) {
		self.scenes.push(scene);
	}
}

SceneHandler.prototype._removePrevious = function() {
	var self = this;

	// remove previous page
	if(self.previous.sceneConfig.transition) {
		function animationEnd(e) {
			$('.'+self.previous.sceneConfig.className).remove();

			console.log("removeAnimationEnd");
			self._appendNext();
		}

		self._eventListener($('.'+self.previous.sceneConfig.className)[0], "AnimationEnd", animationEnd);

		$('.'+self.previous.sceneConfig.className).addClass(self.previous.sceneConfig.removeTransition);

	}

	else {
		$('.'+self.previous.sceneConfig.className).remove();
		self._appendNext();
	}
}


SceneHandler.prototype._appendNext = function() {
	var self = this;

	console.log("add new ", self.current );

	var place = self.current.place;

	if(self.current.sceneConfig.transition) {

		place.append('<div class="hidden ' + self.current.sceneConfig.className + ' ' + self.current.sceneConfig.name + ' ' +self.current.sceneConfig.spawnTransition+ '"></div>');
		setTimeout(function(){
			$('.'+self.current.sceneConfig.className).removeClass('hidden');
		}, 0);

		//add html-content
		$('.'+self.current.sceneConfig.className).append(self.current.config.content);
	}

	else {
		place.append('<div class="' + self.current.sceneConfig.className + ' ' + self.current.sceneConfig.name +'"></div>');
		
		//add html-content
		$('.'+self.current.sceneConfig.className).append(self.current.sceneConfig.content);

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

