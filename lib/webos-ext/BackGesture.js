/*
	
	Add an event listener for keyup to document to listen for the custom "U+1200001" key on OwOS
	or for the ESC key (U+001B) on other platforms and call onbackbutton to be compatible with
	PhoneGap
	
*/

(function() {
	document.addEventListener("keyup", function(ev) {
		//enyo.log("KEY", ev.keyCode);
		if (ev.keyIdentifier == "U+1200001" || ev.keyIdentifier == "U+001B" || ev.keyIdentifier == "Back") {
			enyo.Signals && enyo.Signals.send && enyo.Signals.send('onbackbutton', ev);
		}
	}, false);
})()
