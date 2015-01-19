/**
	Define and instantiate your enyo.Application kind in this file.  Note,
	application rendering should be deferred until DOM is ready by wrapping
	it in a call to enyo.ready().
*/

enyo.kind({
	name: "winner.Application",
	kind: "enyo.Application",
	view: "winner.MainView"
});

enyo.ready(function () {
	new winner.Application();
});
