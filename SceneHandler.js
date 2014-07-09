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

		//add next function
		self.current.next = function() { self.drawNextScene() }

		self.renderer(
			current.func,
			current.place,
			current.config,
			current.sceneConfig
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
				removeTransition: 'page-moveToLeft', //in separate css
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
	if(self.previous) {
		self._removePrevious();
	}
	else {
		self._appendNext();
	}

	// if(func) {func(self.current);}

}

//Save the scene
SceneHandler.prototype.save = function(func, place, sceneConfig, config) {
	var self = this;
	//Default values
	var scene = {
			func: func,
			place: place,
			next: self.drawNextScene,
			hide: self.hide(sceneConfig.saveAs),
			config: {
				content: '',
			},
			sceneConfig: {
				name: 'page',
				spawnTransition: 'page-scaleUp', //in separate css
				removeTransition: 'page-moveToLeft', //in separate css
				transition: true, 
				className: 'page-' + self._guid(),
				clickable: true,
				translations: null,
				}
			};	

	for (var item in sceneConfig) scene.sceneConfig[item] = sceneConfig[item];
	for (var item in config) scene.config[item] = config[item];

	self.savedScenes[scene.sceneConfig.saveAs] = scene;	
}

//Show saved scene 
SceneHandler.prototype.show = function(name, callback) {
	var self = this;
	var scene = self.savedScenes[name]; 

	var place = scene.place;
	if(scene) {
		if(scene.sceneConfig.transition) {

			place.append('<div class="hidden ' + scene.sceneConfig.className + ' ' + scene.sceneConfig.name + ' ' +scene.sceneConfig.spawnTransition+ '"></div>');
			setTimeout(function(){
				$('.'+scene.sceneConfig.className).removeClass('hidden');
			}, 0);

			//add html-content
			$('.'+scene.sceneConfig.className).append(scene.config.content);
		}

		else {
			place.append('<div class="' + scene.sceneConfig.className + ' ' + scene.sceneConfig.name +'"></div>');
			
			//add html-content
			$('.'+scene.sceneConfig.className).append(scene.sceneConfig.content);
		}

			if(callback) {
				callback(scene);
			}
			else {
				scene.func(scene);
			}
	}

}


//Hide saved scene 
SceneHandler.prototype.hide = function(name, callback) {
	var self = this;
	var scene = self.savedScenes[name]; 

	if(scene) {
		// remove - transition
		if(scene.sceneConfig.transition) {
			function animationEnd(e) {
				$('.'+scene.sceneConfig.className).remove();
			}

			self._eventListener($('.'+scene.sceneConfig.className)[0], "AnimationEnd", animationEnd);
			$('.'+scene.sceneConfig.className).addClass(scene.sceneConfig.removeTransition);
		}

		// remove - no transition
		else {
			$('.'+scene.sceneConfig.className).remove();
		}


		if(callback) {
			callback(scene);
		}	
	}
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

	// remove - transition
	if(self.previous.sceneConfig.transition && self.previous.sceneConfig.removeTransition.length > 0) {
		function animationEnd(e) {
			$('.'+self.previous.sceneConfig.className).remove();
			self._appendNext();

		}

		self._eventListener($('.'+self.previous.sceneConfig.className)[0], "AnimationEnd", animationEnd);
		$('.'+self.previous.sceneConfig.className).addClass(self.previous.sceneConfig.removeTransition);
	}

	// remove - no transition
	else {
		$('.'+self.previous.sceneConfig.className).remove();
		self._appendNext();
	}
	
}


SceneHandler.prototype._appendNext = function() {
	var self = this;

	var place = self.current.place;

	if(self.current.sceneConfig.transition && self.current.sceneConfig.spawnTransition.length>0) {

		place.append('<div class="hidden ' + self.current.sceneConfig.className + ' ' + self.current.sceneConfig.name + ' ' +self.current.sceneConfig.spawnTransition+ '"></div>');

		setTimeout(function(){
			$('.'+self.current.sceneConfig.className).removeClass('hidden');
		}, 0);

		//add html-content
		$('.'+self.current.sceneConfig.className).append(self.current.config.content);
		if(self.current.func) {self.current.func(self.current);}
	}

	else {
		place.append('<div class="' + self.current.sceneConfig.className + ' ' + self.current.sceneConfig.name +'"></div>');
		
		//add html-content
		$('.'+self.current.sceneConfig.className).append(self.current.config.content);
		if(self.current.func) {self.current.func(self.current);}
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

