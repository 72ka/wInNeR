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
				{name: "info", kind: "Scroller", classes: "enyo-fit settings", touch: true, horizontal: "hidden", ondragstart: "dragStart", onmousedown: "mouseDown", components: [
					{classes: "onyx-divider", content: "Preferences"},
						{kind: "onyx.GroupboxHeader", content: "Font size", style: "margin: 3px;"},
						{tag: "br"},
						{kind: "onyx.Slider", name: "fontSize", value: 50, onChange: "textSizeChange", onChanging: "textSizeChanging"},
						{classes: "text-preview", style: "", name: "sampleText", content: "Sample text"},
					{tag: "br"},
						{kind: "onyx.GroupboxHeader", style: "margin: 3px;", components: [
							 {content: "Load images", style: "float: left;"},
							 {classes: "info-icon", name: "LoadImagesHelp", onclick: "HelpFeature"},
						]},
						{name: "noImgButton", kind:"onyx.ToggleButton", onChange: "loadImagesChanged", classes: "prefstogglebutton"},
					{tag: "br"},
						{kind: "onyx.GroupboxHeader", style: "margin: 3px;", components: [
							 {content: "Autoscroll to article", style: "float: left;"},
							 {classes: "info-icon", name: "AutoScrollHelp", onclick: "HelpFeature"},
						]},
						{kind:"onyx.ToggleButton", name: "autoscrollButton", onChange: "autoscrollChanged", classes: "prefstogglebutton", value: true},
					{tag: "br"},
						{kind: "onyx.GroupboxHeader", style: "margin: 3px;", components: [
							 {content: "Try to guess the main content", style: "float: left;"},
							 {classes: "info-icon", name: "GuessContentHelp", onclick: "HelpFeature"},
						]},
						{kind:"onyx.ToggleButton", name: "page1Button", onChange: "page1Changed", classes: "prefstogglebutton", value: true},
					{tag: "br"},
						{kind: "onyx.GroupboxHeader", style: "margin: 3px;", components: [
							 {content: "Per-partes loading", style: "float: left;"},
							 {classes: "info-icon", name: "PerPartesHelp", onclick: "HelpFeature"},
						]},
						{kind:"onyx.ToggleButton", name: "perpartesButton", onChange: "perpartesChanged", classes: "prefstogglebutton", value: true},
					{tag: "br"},
						{kind: "onyx.GroupboxHeader", style: "margin: 3px;", components: [
							 {content: "Total data received", style: "float: left;"},
							 {classes: "info-icon", name: "TotalDataHelp", onclick: "HelpFeature"},
						]},
						{name: "totalData", content: "", classes: "text-preview"},
					{tag: "br"},
				]}
			]},
			{name: "popupHelp", kind: "onyx.Popup", allowHtml: true, centered: true, floating: true, scrim: true, scrimWhenModal: false, content: "Nothing to show...", onHide: "hidePopup"},
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
	page1Changed: function(inSender, inEvent) {
		this.appPrefs.page1 = inSender.getValue();
		this.App.setAppPrefs(this.appPrefs);
	},
	perpartesChanged: function(inSender, inEvent) {
		this.appPrefs.perpartes = inSender.getValue();
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
		this.$.page1Button.setValue(this.appPrefs.page1);
		this.$.perpartesButton.setValue(this.appPrefs.perpartes);
		this.$.fontSize.setValue(this.appPrefs.fontSize/2);
		this.$.sampleText.addStyles("font-size: " + this.appPrefs.fontSize + "%");
		this.$.sampleText.setContent("Preview: " + Math.round(this.appPrefs.fontSize) + "%");
		this.$.totalData.setContent(this.bytesToSize(this.appPrefs.dataTotal));
	},
	HelpFeature:  function(inSender, inEvent) {
		
		var helptext;
		
		switch (inSender.name) {

        case 'LoadImagesHelp':
			helptext = "Enables or disables the loading of images. The images can be loaded afterwards by tap on them.";
            break;
        case 'AutoScrollHelp':
			helptext = "Automatic scroll to the part of the page corresponding with the name of the link - usually the name of the article.";
            break;
        case 'GuessContentHelp':
			helptext = "Recommended for non-mobile optimized pages, where the proxy is trying to guess the main content of the whole page. It strips forums, banners and page navigation usually. For mobile optimized pages is highly recommended to disable this feature.";
            break;
        case 'PerPartesHelp':
			helptext = "Recommended for extreme low data usage, where the page is splitted to parts and loads only the parts, where you sroll to. Like loading on the fly. Highly recommended for non-mobile optimized pages.";
            break;
        case 'TotalDataHelp':
			helptext = "Total data received since the application installation.";
            break;
		};
	
	this.$.popupHelp.setContent(helptext);
	this.$.popupHelp.show();
		
	},
	bytesToSize: function(bytes) {
		var sizes = ['Bytes', 'kB', 'MB', 'GB', 'TB'];
		if (bytes == 0) return 'n/a';
		var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
		if (i == 0) return bytes + ' ' + sizes[i]; 
		return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
	}
});
