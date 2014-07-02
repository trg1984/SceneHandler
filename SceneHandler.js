function SceneHandler() {
	this.scenes = [];
}

SceneHandler.prototype.drawNextScene = function() {
	console.log('called me!')
	if (this.scenes.length > 0) {
		
		var self = this;
		var current = this.scenes.splice(0, 1)[0];
		
		current.func.call(
			window,
			current.place,
			current.config,
			current.translations,
			function() { self.drawNextScene() }
		);
	}
}

SceneHandler.prototype.push = function(func, place, config, translations) {
	this.scenes.push(
		{
			func: func,
			place: place,
			config: config,
			translations: translations
		}
	);
}
