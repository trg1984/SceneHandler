function SceneHandler() {
	this.scenes = [];
	this.savedScenes = {};
	this.previous = null;
	this.current = null;
}


SceneHandler.prototype.drawNextScene = function() {
	console.log('called me!')
	if (this.scenes.length > 0) {
		
		var self = this;
		self.previous = self.current;
		var current = self.current = this.scenes.splice(0, 1)[0];
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
				className: 'page-' + self.guid(),
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
		self.saveScene(self.previous);
	}

	else {
		// if this is the first, there is no previous
		if(self.previous) {
			self.removePrevious();
		}
	}

	self.appendNext(place);


	if(func) {func();}

	if (typeof(config.clickable) === 'boolean' || config.clickable) {
		$('body').on('click', '.' + config.className, next);
	}
	else setTimeout(next, 2000);
}

// don't remove, just hide
SceneHandler.prototype.saveScene = function(scene) {
	var self = this;
	if(self.previous.tarnsition) {
		// add here animation and animation listener
		// I'm too tired for now :D
	}
	$('.'+self.previous.config.className).hide();
	self.savedScenes[scene.saveAs] = self.previous;

	console.log(self.savedScenes);
}

SceneHandler.prototype.removePrevious = function() {
	var self = this;

	// remove previous page
	if(self.previous.config.transition) {
		$('.'+self.previous.config.className).addClass(self.previous.config.removeTransition);
		
		setTimeout(function() {
			$('.'+self.previous.config.className).remove();
		}, 700);
	}

	else {
		$('.'+self.previous.config.className).remove();
	}
}


SceneHandler.prototype.appendNext = function(place) {
	console.log("add new");
	var self = this;
	if(self.current.config.transition) {

		setTimeout(function() {
			place.append('<div class="hidden ' + self.current.config.className + ' ' + self.current.config.name + ' ' +self.current.config.spawnTransition+ '"></div>');
			setTimeout(function(){
				$('.'+self.current.config.className).removeClass('hidden');
			}, 0);

			//add html-content
			$('.'+self.current.config.className).append(self.current.config.html);

		},500);


	}

	else {
		place.append('<div class="' + self.current.config.className + ' ' + self.current.config.name +'"></div>');

	}
}

SceneHandler.prototype.guid = function() {

	  function s4() {
	    return Math.floor((1 + Math.random()) * 0x10000)
	               .toString(16)
	               .substring(1);
	  }
	
	    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
	           s4() + '-' + s4() + s4() + s4();
}

