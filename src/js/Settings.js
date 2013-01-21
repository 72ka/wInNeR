enyo.kind({
	name: "Pullout",
	kind: "enyo.Slideable",
	classes: "onyx",
	events: {
		onTextSize: "",
		onLoadImages: "",
		onAutoscroll: "",
		onSelectable: "",
		onPullout: ""
	},
	components: [
		{kind: "Signals", onload: "load"},
		{name: "shadow", classes: "pullout-shadow"},
		{kind: "FittableRows", classes: "enyo-fit", components: [
			//{name: "client", classes: "pullout-toolbar"},
			{fit: true, style: "position: relative;", components: [
				{name: "info", kind: "Scroller", classes: "enyo-fit settings", horizontal: "hidden", ondragstart: "dragStart", onmousedown: "mouseDown", components: [

					//{kind: "onyx.GroupboxHeader", content: "wInNeR v0.0.2"},
					//{classes: "onyx-divider", content: "wInNeR v0.0.2"},
					//{tag: "br"},
					{classes: "onyx-divider", content: "Preferences"},
					{tag: "br"},
						{kind: "onyx.GroupboxHeader", content: "Font size", style: "margin: 3px;"},
						{tag: "br"},
						{kind: "onyx.Slider", name: "fontSize", value: 50, onChange: "textSizeChange", onChanging: "textSizeChanging"},
						{classes: "text-preview", style: "", name: "sampleText", content: "Sample text"},
					{tag: "br"},
						{kind: "onyx.GroupboxHeader", content: "Load images", style: "margin: 3px;"},
						{name: "noImgButton", kind:"onyx.ToggleButton", onChange: "loadImagesChanged", classes: "prefstogglebutton"},
					{tag: "br"},
						{kind: "onyx.GroupboxHeader", content: "Autoscroll to article", style: "margin: 3px;"},
						{kind:"onyx.ToggleButton", name: "autoscrollButton", onChange: "autoscrollChanged", classes: "prefstogglebutton", value: true},
					{tag: "br"},
						{kind: "onyx.GroupboxHeader", content: "Total data received", style: "margin: 3px;"},
						{name: "totalData", content: "", classes: "text-preview"},
				]}
			]},
			{kind: "onyx.Toolbar", classes: "toolbar", components: [
				{kind: "onyx.Grabber", ontap: "grabberTap"}
			]}
		]}
	],
	max: 320,
	min: 0,
	value: 320,
	unit: "px",
	textSizeChange: function(inSender, inEvent) {
		this.appPrefs.fontSize = inSender.getValue()*2;
		this.App.setAppPrefs(this.appPrefs);
		this.doTextSize({value: Math.round(inSender.getValue())});
		this.$.sampleText.addStyles("font-size: " + inSender.getValue()*2 + "%");
		this.$.sampleText.setContent("Preview: " + Math.round(inSender.getValue())*2 + "%");
	},
	textSizeChanging: function(inSender, inEvent) {
		this.$.sampleText.addStyles("font-size: " + inEvent.value*2 + "%");
		this.$.sampleText.setContent("Preview: " + Math.round(inEvent.value)*2 + "%");
	},
	loadImagesChanged: function(inSender, inEvent) {
		this.appPrefs.noImg = !inSender.getValue();
		this.App.setAppPrefs(this.appPrefs);
	},
	autoscrollChanged: function(inSender, inEvent) {
		this.appPrefs.autoScroll = inSender.getValue();
		this.App.setAppPrefs(this.appPrefs);
	},
	grabberTap: function(inSender, inEvent) {
		this.doPullout();
	},
	mouseDown: function(inSender, inEvent) {
		inEvent.preventDefault();
	},	
	dragStart: function(inSender, inEvent) {
		if (inEvent.horizontal) {
			inEvent.preventDefault();
			return true;
		}
	},
	load: function() {
		this.App = new App();
		this.appPrefs = this.App.getAppPrefs();
		this.refresh();
	},
	refresh: function() {
		this.$.noImgButton.setValue(!this.appPrefs.noImg);
		this.$.autoscrollButton.setValue(this.appPrefs.autoScroll);
		this.$.fontSize.setValue(this.appPrefs.fontSize/2);
		this.$.sampleText.addStyles("font-size: " + this.appPrefs.fontSize + "%");
		this.$.sampleText.setContent("Preview: " + Math.round(this.appPrefs.fontSize) + "%");
		this.$.totalData.setContent(this.bytesToSize(this.appPrefs.dataTotal));
	},
	bytesToSize: function(bytes) {
		var sizes = ['Bytes', 'kB', 'MB', 'GB', 'TB'];
		if (bytes == 0) return 'n/a';
		var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
		if (i == 0) return bytes + ' ' + sizes[i]; 
		return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
	}
});
