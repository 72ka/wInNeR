enyo.kind({
    classes: "app enyo-fit enyo-unselectable",
    name: "winner.MainView",
    published: {
        appPrefs: {
			fontSize: 100,
			noImg: false,
			autoScroll: true,
			dataTotal: 0,
			page1: false,
			perpartes: false,
			night: false,
			lock: "free",
			recents: [],
		},		
		wholeHtml: "",
        history: [],
        index: 0,
        base: "",
        urlPrefix: "http://www.google.com/gwt/x?u=",
        dataReceived: 0,
        dataNow: 0,
        scrollEndFired: false,
        page: 0,	
    },
    components: [
		 {kind: "Signals", onload: "load", onUnload: "cleanup", onresize: "resizeHandler"},
		 {kind: "enyo.Signals", onbackbutton: "goBack"},
		 {kind: "Signals", name: "keyDownSignal", onkeydown: "handleKeyDown"},
         {name: "web", kind: "enyo.WebService", url: "", handleAs: "text", method: "GET", onResponse: "onWebSuccess", onError: "onWebFailure", mozSystem: true},
         {name: "head", kind: "enyo.WebService", method: "HEAD", onResponse: "byteSizeFromUrl", onError: ""},
         {name: "image", kind: "enyo.WebService", method: "GET", charset: "x-user-defined", mimeType: "text/plain; charset=x-user-defined", handleAs: "text", onResponse: "base64Encode", onError: ""},
         {name: "favico", kind: "enyo.WebService", method: "GET", charset: "x-user-defined", mimeType: "text/plain; charset=x-user-defined", handleAs: "text", onResponse: "favicoResponse", onError: ""},
         {kind:"enyo.AppMenu", onSelect: "appMenuItemSelected", components: [
			 {content:"Settings", ontap: "Settings"}
		 ]},
         
         {kind: "FittableRows", name: "Main", classes: "enyo-fit", components: [     
			 {name: "mainPane", kind: "onyx.Toolbar", layoutKind: "FittableColumnsLayout", classes: "toolbar", components: [
				 	{name: "favicon", kind: "onyx.Icon", style: "height: 16px; width: 16px;", classes: "favico", src: "icon.png", ontap: "showPopUpRecents"},
					{kind: "onyx.InputDecorator", fit: true, classes: "inputMainDec", alwaysLooksFocused: false, components: [
							{name: "UrlField", kind: "onyx.Input", selectOnFocus: true, defaultFocus: false, classes: "mainInput truncating-text", onfocus: "mainFocused", onchange: "", placeholder: "Type the url...", components: [
								{kind: "onyx.Spinner", name: "loadSpinner", classes: "loadspinner", onStop: "spinnerStop"}
							]}		
					]},
					{kind: "onyx.Button", name: "goButton", content: "Go!", onclick: "inputUrlChange"},
					{kind: "onyx.IconButton", name: "Home", src: "assets/home-icon.png", onclick: "goHome"}	
			]},
			{kind: "onyx.ProgressBar", progress: 100, classes: "loadingbar", name: "loadingBar"}, 
			{classes: "horizontal-shadow-top"},
			{name: "mainScroller", fit: true, kind: "enyo.Scroller", touch: true, fixedTime: false, classes: "mainScroll", horizontal: "hidden", onScroll: "onScroll", onScrollStart: "onScrollStart", ondragstart: "dragStart", onmousedown: "mouseDown", onclick: "mouseDown", components: [
                        {name: "Desktop", kind: "enyo.Control", classes: "desktop enyo-selectable", allowHtml: true, ontap: "linkClicked", onhold: "desktopHold", onflick: "flick", ongesturestart: "gestureStart", ongesturechange: "gestureChange", ongestureend: "gestureEnd"},
                        {name: "LoadingNextContainer", kind: "enyo.Control", classes: "desktop enyo-selectable", allowHtml: true, content: "<div id='loading-next'><img src='lib/onyx/images/spinner-light.gif'/><br>Loading next part...</div>"},
                        {name: "Recent", components: [
						]}		           
			]},
			{name: "DonateButton", kind: "enyo.Control", allowHtml: true, style: "text-align: center; height: 50px"},
			{name: "statuspanel", classes: "status-shadow", content: ""},
			{classes: "horizontal-shadow-bottom"},
            {kind: "onyx.Toolbar", classes: "bottomtoolbar", name: "bottomPane", layoutKind: "FittableColumnsLayout", components: [
				  {name: "BackButton", kind: "onyx.Icon", src:"assets/menu-icon-back.png", onclick: "goBack", disabled: true},
				  {fit: true, classes: "center-in-fittable", components: [
					  {name: "smallerTextButton", classes: "center-icon", kind: "onyx.Icon", src:"assets/format_font_size_less.png",  onclick: "smallerText"},
					  {name: "panelButton", classes: "center-icon", kind: "onyx.Icon", src:"lib/onyx/images/more.png",  onclick: "Settings"},
					  {name: "biggerTextButton", classes: "center-icon", kind: "onyx.Icon", src:"assets/format_font_size_more.png",  onclick: "biggerText"},	
	  
				  ]},
				  {name: "ForwardButton", kind: "onyx.Icon", src:"assets/menu-icon-forward.png",  onclick: "goForward", disabled: true}
			]}
		 ]},		 
		{name: "popupRecents", kind: "onyx.Popup", allowHtml: true, centered: true, floating: true, scrim: true, scrimWhenModal: false, components: [
			{content: "Add to Favorites?", name: "AddFavPopUp", classes: "truncating-text"},
			{tag: "br"},
			{kind:"onyx.Button", content: "Yes", value: 1, classes: "onyx-affirmative", ontap:"recentsPopUpButtonTapped"},
			{kind:"onyx.Button", content: "No", value: 0, classes: "onyx-negative", ontap:"recentsPopUpButtonTapped"}
		]},
		{name: "popupRecentsButton", kind: "onyx.Popup", allowHtml: true, centered: true, floating: true, scrim: true, components: [
			{content: "Rename or Delete Favorite?"},
			{tag: "br"},
			{kind: "onyx.InputDecorator", components: [
					{kind: "onyx.Input", name: "ModifyFavPopUp", onkeypress: "inputFavModify", placeholder: "Enter new name...", selectOnFocus: true}
			]},
			{tag: "p"},
			{kind:"onyx.Button", name: "firstChoiceRecentsButton", content: "Rename", classes: "onyx-blue", value: 1, ontap:"renameRecent"},
			{kind:"onyx.Button", name: "secondChoiceRecentsButton", content: "Delete", classes: "onyx-negative", value: 0, ontap:"removeRecent"},
			{tag: "br"},
		]},
		{kind: "Pullout", name: "pullout", classes: "pullout", onTextSize: "TextSize", onLoadImages: "loadImages", onSelectable: "selectableText", onPullout: "Settings", onNight: "night"}
     ],
     
    create: function (){

        this.inherited(arguments);
        
        //enyo.gesture.drag.holdPulseDefaultConfig.delay = 600;
        
        this.$.LoadingNextContainer.hide();
        this.$.loadSpinner.stop();
        this.$.goButton.hide();
        this.$.loadingBar.hide();
        this.full = false;

		/* Get preferences */
		/* fix for http://forums.enyojs.com/discussion/1149/appstart-on-webos-old-screens-get-shown */
		this.getPrefs();
		//enyo.asyncMethod(this, "getPrefs", "start");

		this.$.UrlField.setAttribute("x-palm-disable-auto-cap", true);

		//this.$.Desktop.addStyles("font-size: " + this.appPrefs.fontSize*window.devicePixelRatio + "% !important");

		
		/* DEBUG */
		//this.$.UrlField.setValue("m.idnes.cz");	
		//this.resize();
	
    },
       
    load: function() {
		// fix layout once all the images are loaded
		this.resize();
		this.$.mainScroller.applyStyle("font-size", this.appPrefs.fontSize + "%");
		this.$.Main.addRemoveClass("night", this.appPrefs.night);
		
		if(enyo.platform.webos) {
			window.PalmSystem.setWindowOrientation(this.appPrefs.lock);
		};


		this.goHome();
	},
	
	cleanup: function () {
		this.savePrefs();
	},
	
	getPrefs: function (action) {
		/* get prefs from the cookie if they exist */
		var cookie = enyo.getCookie("winnerAppPrefs");
		//enyo.log("COOKIES: ", cookie);
		if (cookie) {
			// if it exists, else use the default
			this.appPrefs = enyo.mixin(this.appPrefs, enyo.json.parse(cookie));
		};
		
		/* goHome for the first start */
		if (action == "start") this.goHome();
	},
	savePrefs: function () {
		//this.log("Saving Prefs", enyo.json.stringify(this.appPrefs));
		enyo.setCookie("winnerAppPrefs", enyo.json.stringify(this.appPrefs));
	},
	
	spinnerStop: function() {
		this.$.loadSpinner.stop();
		//this.resize();
	},

  onWebSuccess: function(inSender, inData) {
	//enyo.log("SUCCESS", inData);
	
    if (!inData) return; //if there is nothing in the response then return early.
    this.dataReceived += parseInt(inData.ajax.xhrResponse.headers["content-length"]);
    this.appPrefs.dataTotal += parseInt(inData.ajax.xhrResponse.headers["content-length"]);
	this.processHTML(inData.data);
	clearTimeout(this.errorLoadTimer);
  },
  
  onWebFailure: function(inSender, inData) {
    if (!inData) return; //if there is nothing in the response then return early.
    this.dataReceived = 0;  
	 this.errorLoadTimer = setTimeout((function(){
		this.$.Desktop.setContent('Error while loading page....');
		this.spinnerStop();
	 }).bind(this), 5000);
	
	 
  },
  
  processHTML: function (data) {

		
	  var nextUrl = this.getNextUrlFromRawData(data);
	  var partialHtml = this.removeGoogleBanners(data);
	  if (this.appPrefs.night) partialHtml = this.replaceColors(partialHtml);
	  
	  this.page++;
	  
	  
	  
	  this.$.LoadingNextContainer.hide();
	  
	  /* Important: use innerHTML, because getContent doesn`t contain
	   * a changes of attributes */
	  this.$.Desktop.setContent(document.getElementById(this.$.Desktop.id).innerHTML + partialHtml);
	  
	  	/* ToDo: Save images to localStorage,
		 * this time is done the base64 encoding */
		 if (!this.appPrefs.noImg) {
			this.saveImagesToStorage(this.page);
		 };
		 
		/* If the page is more than one page long */
		if (nextUrl) {
			this.nextUrlLink = "http://www.google.com" + nextUrl;
			
			if (this.appPrefs.perpartes) {
			    this.spinnerStop();
			    this.$.goButton.hide();
				this.$.Home.show();
			} else {
				this.$.web.setUrl(this.nextUrlLink);
				this.$.web.send();
				if (this.notScrolledYet) this.$.mainScroller.scrollToTop();
			};
		/* If the page is only one page long */
		} else {
			
			this.spinnerStop();
			this.$.goButton.hide();
			this.$.Home.show();

			this.nextUrlLink = null;

		};
		
		try {
				/* I expect that the article name is longer than 30 characters */
				if (this.page == 1 && this.appPrefs.autoScroll && this.history[this.index].articleName && (this.history[this.index].articleName.length > 30)) {	
					this.scrollToArticle(this.history[this.index].articleName);
				};
		} catch (error) {
			enyo.log(error);
		};

		this.statusPanel(this.bytesToSize(this.dataReceived), 2);
			
	 this.naviButtons();
	 this.scrollEndFired = false;
	 this.resize();
	 

  },
  
  removeGoogleBanners: function (data) {
	  
	  	/* Here is the magic of removing google banners, links processing, etc... */
	  	  
	 	/* remove top banner */
	  	data = data.substring(data.indexOf("<div>", data.indexOf("background-color:#eff3fa")), data.length);
		/* remove bottom banner */
      	data = data.substring(0, data.indexOf("<div style='margin-left:-.5em;margin-right:-.5em;margin-bottom:-.5em;border-top:1px solid #ccc;background-color:#eff3fa;padding:4px'>"));
      
		/* remove alt`s */
		regex = new RegExp("alt=''", 'g');
		data = data.replace(regex, "");
		
		if (this.appPrefs.noImg) {
			/* images src to absolute path */
			var regex = new RegExp("img src='/", 'g');
			data = data.replace(regex, "img src='images/image-generic.png' title='http://www.google.com/");		
		} else {
			/* images src to absolute path */
			var regex = new RegExp("img src='/", 'g');
			data = data.replace(regex, "img src='' alt='http://www.google.com/");
		};
		
		/* hrefs to google path */
		regex = new RegExp("href='/", 'g');
		data = data.replace(regex, "href='http://www.google.com/");
		
		/* It looks better, if after image etc. ends as line break */
		regex = new RegExp("'/>", 'g');
		data = data.replace(regex, "'/><br>");
		
		/* remove any font-size settings for availability to change it */
		regex = new RegExp("font-size:?medium", 'g');
		data = data.replace(regex, "font-size:" + this.appPrefs.fontSize*1.1 + "%");
		
		regex = new RegExp("font-size:?small", 'g');
		data = data.replace(regex, "font-size:" + this.appPrefs.fontSize*0.9 + "%");
		
		
		/* change local path to http origin */
		regex = new RegExp("file://", 'g');
		data = data.replace(regex, "http://");
		
		/* put all data inside div element */
		
		data = "<div id='page" + (this.page+1) + "'>" + data + "</div>";
      
      return data;
      
  },
  
  getNextUrlFromRawData: function (data) {
	  
	  var nextUrlData = data.substring(data.lastIndexOf("<div style='margin-left:-.5em;margin-right:-.5em;margin-bottom:-.5em;border-top:1px solid #ccc;background-color:#eff3fa"), data.length);   
      nextUrlData = nextUrlData.substring(0, nextUrlData.indexOf("<form action='/search'>"));     
      var nextUrl = $(nextUrlData).find("a").attr("href");
      
      return nextUrl;
	  
  },
  
  linkClicked: function(inSender, inEvent) {

	 inEvent.preventDefault();
	 inEvent.cancelBubble = true;
	 
	 this.dataReceived = 0;
	 this.resetLoadingBar();
	 this.setLoadingBar(0);
	 this.notScrolledYet = true;

	 //enyo.log("LINK: ", inEvent.target.getAttribute("src"));
	 //enyo.log("TYPE: ", inEvent.type);
	 var link = this.findLinkParent(inEvent.target, this.hasNode());
	 var linkImg = null;
	 
	 //enyo.log("FOUND LINK: ", link);
	 
	 if (!link) {
		 
		 
		 /* It the target is not a link and contains an img tag */
		if ((inEvent.target.tagName.toLowerCase() == "img") && this.appPrefs.noImg) {
		 
		 //enyo.log("TARGET IS NOT A LINK AND CONTAINS IMG TAG: ");
		 
		 /* If was NOT shown yet */
		 if (inEvent.target.getAttribute("src") == "assets/image-generic.png") {
			 //enyo.log("was NOT shown yet: ");
			 inEvent.target.src = inEvent.target.title; //change back original img src instead of image-generic.png
			 inEvent.target.removeAttribute("title"); //remove title attribute from img
			 /* Check the image byte size */
			 this.$.head.setUrl(inEvent.target.src);
			 this.$.head.send();
		 /* If was shown yet */
		 } else {
			 //enyo.log("was shown yet: " + linkImg);
			 };
		};

		return; //if there is nothing in the response then return early.

	 } else {
		 
		 /* If the target is a link */
		 if ((inEvent.target.tagName.toLowerCase() == "img") && this.appPrefs.noImg) {
		 
		 //enyo.log("TARGET IS LINK AND CONTAINS IMG TAG: ");
		 
		 /* If was NOT shown yet */
		 if (inEvent.target.getAttribute("src") == "assets/image-generic.png") {
			 //enyo.log("was NOT shown yet: ");
			 inEvent.target.parentNode.title = inEvent.target.parentNode.href; //temporary switch the href to title
			 inEvent.target.parentNode.removeAttribute("href"); //disable the link action
			 inEvent.target.src = inEvent.target.title; //change back original img scr instead of image-generic.png
			 inEvent.target.removeAttribute("title"); //remove title attribute from img

			 /* Check the image byte size */
			 this.$.head.setUrl(inEvent.target.src);
			 this.$.head.send();
			 return; //just load the image, and then do nothing
		 /* If it was shown yet */
		 } else {
			 inEvent.target.parentNode.setAttribute("src") = inEvent.target.parentNode.getAttribute("title");
			 //enyo.log("was shown yet: " + linkImg);
			 };
		};	 
	 };

	 /* change the visited link color */
	 //inEvent.target.style = "color: purple;";
	 
	 //ToDo: doesn works this way... fix me
	 /* Save the changes to the html code */

	 this.history[this.index].html = true;

	 sessionStorage.setItem(this.index, document.getElementById(this.$.Desktop.id).innerHTML);

	 this.$.loadSpinner.start();

	 this.history[this.index].scrollTop = this.$.mainScroller.getScrollTop();
	 this.history[this.index].nextUrlLink = this.nextUrlLink;
	 this.history[this.index].night = this.appPrefs.night;

	 /* Important: Count the index here, not on the other place */
	 this.index++;
	 
	 this.page = 0;
	 
	 this.history[this.index] = [];
	 this.history[this.index].articleName = inEvent.target.innerText;
	 this.history[this.index].realUrl = "http" + link.substring(link.lastIndexOf("://"), link.length);
	 
	 this.history[this.index].base = link.substring(link.lastIndexOf("://")+3, link.indexOf("/", link.lastIndexOf("://")+3));
	 this.history[this.index].nameForUrlField = this.history[this.index].base + ": " + inEvent.target.innerHTML;
	 this.$.UrlField.setValue(this.history[this.index].nameForUrlField);
	 
	 this.wholeHtml = "";
	 
	 this.$.Desktop.setContent("");
	 
	 this.$.web.setUrl(link + this.getUrlSuffix());
     this.$.web.send();

  },
  
  findLinkParent: function(a, b) {
	var c = a;
	while (c && c != b) {
	if (c.href) return c.href;
	c = c.parentNode;
	}
  },
  
  inputUrlChange: function(inRequest, inEvent) {

	//inEvent.preventDefault();
	this.resetLoadingBar();
	this.setLoadingBar(0);
	this.dataReceived = 0;
	this.notScrolledYet = true;
	this.$.UrlField.onchange = "";
    var pre = "";
    var UrlFieldValue = this.$.UrlField.getValue();
    this.index++;
    this.history[this.index] = [];
    this.lastUrl = this.urlPrefix + UrlFieldValue + this.getUrlSuffix();
    if (UrlFieldValue.indexOf("http://") == -1) pre = "http://";
    this.history[this.index].realUrl = pre + UrlFieldValue;
    this.history[this.index].nameForUrlField = this.history[this.index].realUrl;
    this.$.UrlField.setValue(this.history[this.index].realUrl);
    this.wholeHtml = "";
    
    this.log("URL:", this.lastUrl);
    this.$.Desktop.setContent("");
    
    this.page = 0;
    
    this.$.web.setUrl(this.lastUrl);
    //this.$.web.setUrl("/gwt/x?u=http://m.idnes.cz&wsc=fa&ct=pg1&whp=30");
    this.$.web.send();
    
    /* try to get favicon from real URL head */
    this.$.favicon.setSrc(this.getFavicon(this.history[this.index].realUrl));
    
    /* Hide the recent page buttons */
    this.$.Recent.hide();
     
     this.$.loadSpinner.start();
     try {
		this.history[this.index].scrollTop = 0;
	} catch (error) {};
	
	/* FIXME: If I use blur here, it fires and onchange event and run this function twice again!
	 * Thus I disabled onchange event and start it again only when focused - see onfocus handler */	
	this.$.UrlField.hasNode().blur();
	
	this.$.keyDownSignal.onkeydown = "handleKeyDown";
	
	/* Hides the donate button control */
	this.$.DonateButton.hide();
	this.resize();

  },
  
    goBack: function (inSender, inEvent) {
		
	this.resetLoadingBar();
	
	try {
		if (this.history[this.index-1].html) {
			inEvent.preventDefault();
			this.history[this.index].scrollTop = this.$.mainScroller.getScrollTop();

			sessionStorage.setItem(this.index, document.getElementById(this.$.Desktop.id).innerHTML);
			this.history[this.index].html = true;
			this.history[this.index].nextUrlLink = this.nextUrlLink;
			this.index--;
			this.nextUrlLink = this.history[this.index].nextUrlLink;
			this.wholeHtml = this.history[this.index].html;
			this.animate(this.$.Desktop, 200, -1);
			setTimeout((function(){		
				this.$.Desktop.setContent(sessionStorage.getItem(this.index));	
				this.$.mainScroller.setScrollTop(this.history[this.index].scrollTop);
				this.$.UrlField.setValue(this.history[this.index].nameForUrlField);
				this.naviButtons();
				//this.$.Desktop.applyStyle("font-size", this.appPrefs.fontSize*window.devicePixelRatio + "%");
			 }).bind(this), 200);
		 
			
		};
	} catch (e) {};
	},
	
	goForward: function (inSender, inEvent) {
		
	this.resetLoadingBar();
		
	try {	
		if (this.history[this.index+1].html) {
			inEvent.preventDefault();
			this.history[this.index].scrollTop = this.$.mainScroller.getScrollTop();
			sessionStorage.setItem(this.index, document.getElementById(this.$.Desktop.id).innerHTML);
			this.history[this.index].html = true;
			this.history[this.index].nextUrlLink = this.nextUrlLink;
			this.index++;
			this.nextUrlLink = this.history[this.index].nextUrlLink;
			this.wholeHtml = this.history[this.index].html;
			this.animate(this.$.Desktop, 200, 1);
			setTimeout((function(){
			 this.$.Desktop.setContent(sessionStorage.getItem(this.index));
			 this.$.mainScroller.setScrollTop(this.history[this.index].scrollTop);
			 this.$.UrlField.setValue(this.history[this.index].nameForUrlField);
			 this.naviButtons();
			}).bind(this), 200);
		};	
	} catch (e) {};
	},
	
	biggerText: function () {
		this.appPrefs.fontSize = this.appPrefs.fontSize + 10;
		//this.$.Desktop.applyStyle("font-size", this.appPrefs.fontSize*window.devicePixelRatio + "%");
		this.$.mainScroller.applyStyle("font-size", this.appPrefs.fontSize + "%");
		this.$.pullout.refresh();
	},
	
	smallerText: function () {
		this.appPrefs.fontSize = this.appPrefs.fontSize - 10;
		//this.$.Desktop.applyStyle("font-size", this.appPrefs.fontSize*window.devicePixelRatio + "%");
		this.$.mainScroller.applyStyle("font-size", this.appPrefs.fontSize + "%");
		this.$.pullout.refresh();	
	},
	
	naviButtons: function () {
		if (this.history[this.index+1]) {
			this.$.ForwardButton.setDisabled(false);
		} else {
			this.$.ForwardButton.setDisabled(true);
			};
			
		if (this.history[this.index-1]) {
			this.$.BackButton.setDisabled(false);
		} else {
			this.$.BackButton.setDisabled(true);
			};
		
	},
	
	mainFocused: function() {

		this.$.goButton.show();
		this.$.Home.hide();
		
		/* Change the field content to real url instead of name of article */
		try {
			this.$.UrlField.setValue(this.history[this.index].realUrl);
		} catch (e) {};
		this.$.UrlField.onchange = "inputUrlChange";
		this.resize();
	},
	
	scrollToArticle: function(articleName) {
		
		if (!this.notScrolledYet) return;

		var previousContent = document.getElementById(this.$.Desktop.id).innerHTML;	
		//find only the first match - this is probably our article name
		var regex = new RegExp(articleName.substring(1, articleName.length), 'mi');
		previousContent = previousContent.replace(regex, "<span id='scrollhere'>" + articleName.substring(1, articleName.length) + "</span>");
		this.$.Desktop.setContent(previousContent);
		try {
			document.getElementById("scrollhere").scrollIntoView(true);
			this.notScrolledYet = false;
		} catch (error) {
			enyo.log("Can't scroll to article name...");
			};
		
	},
	
	handleKeyDown: function(inSender, inEvent) {
		if (inEvent.keyIdentifier == "Back") return;
        inEvent.preventDefault();
        this.$.UrlField.selectOnFocus = false;
        //this.$.UrlField.hasNode().focus();
        this.$.UrlField.focus();
        this.$.UrlField.setValue(String.fromCharCode(inEvent.keyCode).toLowerCase());
        this.$.keyDownSignal.onkeydown = "";
        this.$.UrlField.selectOnFocus = true;
    },
    
    TextSize: function (inSender, inEvent) {
		this.$.mainScroller.applyStyle("font-size", + inEvent.value + "%");
	},
	
	Settings: function(inSender, inEvent) {
		this.cleanup();
		this.$.pullout.refresh();
		this.$.pullout.toggleMinMax();
	},
	
	selectableText: function(inSender, inEvent) {	
		this.$.Desktop.removeClass(this.$.Desktop.classes);		
		var classes = inEvent.value ? "desktop enyo-selectable" : "desktop enyo-unselectable";	
		this.$.Desktop.addClass(classes);
		enyo.log(this.$.Desktop.classes);
	},
	
	showPopup: function (text) {
		
		this.$.Popup.setContent(text);
		this.$.Popup.show();
	},
	
	statusPanel: function (text, time) {
		
	 /* first of all clear previous timeout */
	 clearTimeout(this.panelTimer);
	
	 if (!time) {
		 time = 1;
	 };
	 this.$.statuspanel.addClass("active");
	 this.$.statuspanel.setContent(text);
	 this.panelTimer = setTimeout((function(){
		this.$.statuspanel.removeClass("active");
	 }).bind(this), time*1000);	
	},
	
	byteSizeFromUrl: function(inSender, inData) {	
		var byteSize = 0;
		byteSize = parseInt( inData.ajax.xhrResponse.headers["content-length"] );
		this.appPrefs.dataTotal += byteSize;
		this.dataReceived += byteSize;
		this.statusPanel(this.bytesToSize(this.dataReceived), 2);
		return byteSize;	
	},
	
	bytesToSize: function(bytes) {
		var sizes = ['Bytes', 'kB', 'MB', 'GB', 'TB'];
		if (bytes == 0) return 'n/a';
		var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
		if (i == 0) return bytes + ' ' + sizes[i]; 
		return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
	},
	
	getUrlSuffix: function(link) {
		var suffix = this.appPrefs.page1 ? "" : "&wsc=fa&ct=pg1&whp=30";
		return suffix;
	},
	
	onScroll: function(inSender, inEvent) {

		if (this.nextUrlLink && (inEvent.originator.bottomBoundary + this.$.mainScroller.getScrollTop()) > -100) {
			this.$.mainScroller.onScroll = null;
			this.scrollerVertHeight = inEvent.originator.bottomBoundary;
			this.scrollEndFired = true;
			this.$.LoadingNextContainer.show();
			//this.$.mainScroller.scrollToBottom();
			this.$.mainScroller.scrollTo(0, -inEvent.originator.bottomBoundary);
			this.$.web.setUrl(this.nextUrlLink);
			this.$.web.send();
			this.$.loadSpinner.start();
			this.nextUrlLink = null;
		};
		return true;
	},
	
	onScrollStart: function(inSender, inEvent) {
		this.notScrolledYet = false;
		this.$.mainScroller.onScroll = "onScroll";
		this.scrollerVertHeight = inEvent.originator.bottomBoundary;
	},
	
	animate: function(element, time, direction) {

		element.setStyle("-webkit-transition-property: all; -webkit-transition-duration: " + time/1000 + "s; -webkit-transition-timing-function: ease-out; -webkit-transform: translateX(" + direction*(-window.innerWidth) + "px); opacity: 0;");
		setTimeout((function(){
			 element.setStyle("-webkit-transition-property: none; -webkit-transition-duration: " + 0 + "s; -webkit-transition-timing-function: linear; -webkit-transform: translateX(" + direction*window.innerWidth + "px); opacity: 0;");
		 }).bind(this), time);
		 setTimeout((function(){
			 element.setStyle("-webkit-transition-property: all; -webkit-transition-duration: " + time/1000 + "s; -webkit-transition-timing-function: ease-in; -webkit-transform: translateX(0px); opacity: 1;");
		 }).bind(this), time*2);
	 
	},
	
	getFavicon: function(url) {
		//var src = "http://g.etfv.co/" + url;
		/* use secret Google call */
		var src = "http://www.google.com/s2/favicons?domain=" + url;
		return src;
	},
	
	favclick: function(inSender, inEvent) {
		this.$.UrlField.setValue(inSender.content);
		this.inputUrlChange(inSender, inEvent);
		
	},
	
	goRecent: function(inSender, inEvent) {
		this.$.UrlField.setValue(inSender.page);
		this.inputUrlChange();		
	},
	
	getRecents: function() {
		/* This function gets the recents from the cookies and set the buttons to the first page */
		
		this.$.Recent.destroyClientControls();

		var recents = this.appPrefs.recents;
		
		this.$.Recent.createComponent(
			{kind: "onyx.Groupbox", components: [
				{tag: "br"},
				{kind: "onyx.GroupboxHeader", content: "Winner v0.0.9"},
				{content: "<b>w</b>ebOS <b>In</b>telligent <b>Ne</b>ws <b>R</b>eader<br>Author: Jan Heřman (72ka)", allowHtml: true, style: "padding: 8px;"},
			]},{owner: this}
		);
		
		/* Add Favorites header only if they exists */
		if (recents.length > 0) {
			this.$.Recent.createComponent(
				{name: "Favorite", kind: "onyx.GroupboxHeader", content: "Favorites (" + recents.length + ")", classes: "desktop-header"}, {owner: this}
			);
		};

		for (var i = 0; i < recents.length; i++) {
			
			if (!localStorage.getItem(recents[i].favicon)) {		
				this.statusPanel("Please Re-Add the " + recents[i].name + " due to v0.0.8 update...", 5);
			};
						
			this.$.Recent.createComponent(
				{name: "Favorite" + i, ID: i, kind: "onyx.Button", classes: "recentButton", ontap: "goRecent" , onhold: "onRecentButtonHold", page: recents[i].url, recname: recents[i].name, components: [
					{kind: "onyx.Icon", src: localStorage.getItem(recents[i].favicon), style: "width: 16px; height: 16px", classes: "recent"},
					{content: recents[i].name, classes: "truncating-text"}
				]}, {owner: this}
				);		
		};	
		this.$.Recent.render();
		this.resize();
	},
	
	addRecent: function() {
				
				
			this.$.favico.setUrl(this.getFavicon(this.history[this.index].realUrl));
			this.$.favico.send();

	},
	
	favicoResponse: function(inSender, response) {

		var toAdd = {};

		toAdd.url = this.history[this.index].realUrl;
		toAdd.name = this.history[this.index].realUrl.substring(this.history[this.index].realUrl.indexOf(".")+1);
		
		toAdd.index = this.appPrefs.recents.length;
		
		/* Save the base64 encoded image to the HTML5 localStorage under URL indentifier */
		localStorage.setItem(this.history[this.index].realUrl, this.responseBase64Encode(response.data));
		
		toAdd.favicon = this.history[this.index].realUrl;
		
		this.appPrefs.recents.push(toAdd);
		
		this.savePrefs();
		
		this.statusPanel("Favorite saved...", 4);
			
	},
	
	onRecentButtonHold: function(inSender, inEvent) {

		this.$.ModifyFavPopUp.setValue(inSender.recname);

		/* Disable auto-capitalization on webOS devices */
		this.$.ModifyFavPopUp.setAttribute("x-palm-disable-auto-cap", "true");
        this.$.ModifyFavPopUp.setAttribute("x-palm-title-cap", null);

		this.recentToModify = inSender;

		this.$.popupRecentsButton.show();

		this.$.ModifyFavPopUp.focus();
	},
	
	removeRecent: function(inSender) {
		
		/* delete from HTML5 localStorage */
		localStorage.removeItem(this.recentToModify.page);
		
		this.appPrefs.recents.splice(this.recentToModify.ID, 1);
		
		this.recentToModify.destroy();
		
		this.recentToModify = null;
		
		this.$.popupRecentsButton.hide();
			
		this.savePrefs();	
		
		this.statusPanel("Favorite deleted...", 4);
		
		/* Update the number of favorites on the header */
		this.$.Favorite.setContent("Favorites (" + this.appPrefs.recents.length + ")");
		
		this.$.Recent.render();

	},
	
	renameRecent: function(inSender) {
		
		for (var i = 0; i < this.appPrefs.recents.length; i++) {
			if (this.appPrefs.recents[i].name == this.recentToModify.recname ) {
				this.appPrefs.recents[i].name = this.$.ModifyFavPopUp.getValue();
				};
		};	
		
		this.savePrefs();
		
		this.getRecents();
			
		this.recentToModify = null;
		
		this.$.popupRecentsButton.hide();

		this.statusPanel("Favorite renamed...", 2);

		this.$.Recent.render();
	
	},

	inputFavModify: function(inSender, inEvent) {
		if (inEvent.keyCode == 13) {
			this.renameRecent();
		}
	},
	
	recentsPopUpButtonTapped: function(inSender) {
		
		if(inSender.value == 1) {
			this.addRecent();
		}
		
		this.$.popupRecents.hide();
		
	},
	
	showPopUpRecents: function() {
		
		try {	
			this.$.AddFavPopUp.setContent("Add " + this.history[this.index].realUrl.substring(this.history[this.index].realUrl.indexOf(".")+1) + " to Favorites?");
			this.$.popupRecents.show();
		} catch (error) {};
	},
	
	goHome: function() {
		
		this.$.mainScroller.scrollToTop();

		this.clearHistory();
		
		this.resetLoadingBar();

		var donateHTML = '<form action="https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=5CTRZJLKKUBS4&lc=CZ&item_name=Jan%20Herman&currency_code=USD&bn=PP%2dDonationsBF%3abtn_donate_SM%2egif%3aNonHosted" target="_blank" href="https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=5CTRZJLKKUBS4&lc=CZ&item_name=Jan%20Herman&currency_code=USD&bn=PP%2dDonationsBF%3abtn_donate_SM%2egif%3aNonHosted" method="post"><input type="image" src="assets/donate.gif" style="text-align: center" border="0" name="submit" alt="PayPal - The safer, easier way to pay online!"></form>';
        
        this.$.Desktop.setContent('');

		this.$.DonateButton.setContent(donateHTML);
		
		this.$.DonateButton.show();
		
		this.$.UrlField.setValue("");
		this.$.favicon.setSrc("icon.png");
		
		
		/* Get Recent pages */
		this.getRecents();
		
		this.$.Recent.show();
		
		this.resize();
		
	},
	
	clearHistory: function () {
		
		this.nextUrlLink = null;
		
		this.$.ForwardButton.setDisabled(true);
		this.$.BackButton.setDisabled(true);
		
		this.index = 0;
		this.history = [];
		this.history[this.index] = [];
	},
	
	saveImagesToStorage: function(page) {
	
		/* Get all images src and request the base64 src */
		
		var images = document.getElementById("page" + page).getElementsByTagName("img");
		
		if (images.length == 0) { 
			this.setLoadingBar(100);
			this.resetLoadingBar(500);
			return;
			};
		
		for (var i = 0; i < images.length; i++) {
			var height = images[i].getAttribute("height");
			var width = images[i].getAttribute("width");
			if (height && width && (images[i].src.indexOf("base64") == -1)) {
				if (document.getElementById(images[i].alt) == null) {
				images[i].id = images[i].alt;
				/* "alt" attribute is a src of original data set */
				this.getBinary(images[i].alt);
				
				} else {					
					/* This part sets the same src for the repeating images */
					var imageToOnLoad = document.getElementById(images[i].alt);

					imageToOnLoad.onload =(function(x,y, page){
							return function() {
									var images = document.getElementById("page" + page).getElementsByTagName("img");
									for (var i = 0; i < images.length; i++) {
										if (images[i].alt == y.alt) {
												images[i].src = y.src;
											};
										};		
							};
					})(images[i],imageToOnLoad, page);
				};
			};
		};		
	},
	
	countImageBytes: function(byteSize) {
		byteSize = parseInt( byteSize );
		this.appPrefs.dataTotal += byteSize;
		this.dataReceived += byteSize;
		this.statusPanel(this.bytesToSize(this.dataReceived), 2);	
	},
	
	getBinary: function(file) {
		
		this.getImageDemands++;
		this.$.image.setUrl(file);
		this.$.image.send();
	},
	
	base64Encode: function(inSender, response) {

	   var responseText = response.data;
	   this.getImageDemands--;
	   var newProgress = (this.currentProgress) + Math.round((100 - this.currentProgress)/this.getImageDemands);

	   /* Count the image size to bytes counter */
	   this.countImageBytes(response.ajax.xhrResponse.headers["content-length"]);

		/* encode image to base64 - this old method is necessary for all webOS devices.
		 * For newer devices is much better to use other native browser code,
		 * like create canvas and then toDataURl()
		 */
		 
		var outSrc = this.responseBase64Encode(responseText);
		
		try {
			document.getElementById(response.ajax.url).src = outSrc;
		} catch (error) {
			enyo.log("Error setting image base64: ", error);
		};

	   this.setLoadingBar(newProgress);
	   if (this.getImageDemands == 0) {	
			this.resetLoadingBar(500);
		};
	},
	
	responseBase64Encode: function (responseText) {
		
		for (var responseText = responseText, responseTextLen = responseText.length, binary = "", i = 0; i < responseTextLen; ++i) {
		  binary += String.fromCharCode(responseText.charCodeAt(i) & 255)
		};
		
		return 'data:image/png;base64,' + window.btoa(binary);
		
	},
	
	desktopHold: function(inSender, inEvent) {

		if (this.full) {
			if (enyo.platform.webos) enyo.webos.setFullScreen(false);
			this.full = false;
			this.$.mainPane.setShowing(!this.landscape);
			this.$.bottomPane.setShowing(!this.landscape);
			this.$.loadingBar.setStyle("top: 42px;");
			this.$.statuspanel.setStyle("bottom: 56px;");
			this.statusPanel("Fullscreen deactivated", 2);
		} else {
			if (enyo.platform.webos) enyo.webos.setFullScreen(true);
			this.full = true;
			this.$.mainPane.setShowing(false);
			this.$.bottomPane.setShowing(false);
			this.$.loadingBar.setStyle("top: -8px;");
			this.$.statuspanel.setStyle("bottom: 1px;");
			this.statusPanel("Fullscreen activated", 2);
		};
		this.resize();
		
		
	},
	
	resetLoadingBar: function(delay) {
		
		if (!delay) {var delay = 0}; 
		
		this.currentProgress = 0;
		this.getImageDemands = 0;
		
		var time = setTimeout((function(){
				this.$.loadingBar.hide();
				this.$.loadingBar.setProgress(0);
		}).bind(this), delay);
		
	},
	
	setLoadingBar: function(value) {
		this.currentProgress = value;
		this.$.loadingBar.show();
		this.$.loadingBar.setProgress(value);
	},
	
	
	mouseDown: function(inSender, inEvent) {
		inEvent.target = null;
		inEvent.cancelBubble = true;
		inEvent.bubbles = false;
		inEvent.preventDefault();
	},
	
	dragStart: function(inSender, inEvent) {
		if (inEvent.horizontal) {
			inEvent.preventDefault();
			// Prevent drag propagation on horizontal drag events
			return true;
		}
	},
	
	donate: function() {
		enyo.log("DONATE: ");
	},
	
    aboutClick: function(){
		//reserved
    },
    
    night: function(){
		
		this.$.Main.addRemoveClass("night", this.appPrefs.night);
		
		if (!this.appPrefs.night) {
				document.getElementById(this.$.Desktop.id).innerHTML = "";
				this.clearHistory();
				this.$.web.send();
			} else {				
				this.$.Desktop.setContent(this.replaceColors(document.getElementById(this.$.Desktop.id).innerHTML));
			};	
	},
    
    invertColor: function(colorToInvert){

		var inverted = null;
		var color = new RGBColor(colorToInvert);

		if (color.ok) { 
					inverted = 'rgb(' + (255 - color.r) + ', ' + (255 - color.g) + ', ' + (255 - color.b) + ')';
				};

		return inverted;
	},
	
	replaceColors: function(data) {
		
		var pos = data.indexOf('color:');
		var color = "";
		
		while (pos !== -1)
		{
			color = data.substring(pos+6,pos+14);
			data = data.replace(color, this.invertColor(color));
			pos = data.indexOf('color:', pos+6);
		};
		
		return data
	},
	
	gestureStart: function(inSender, e){
	
		//reserved

	},

	gestureChange: function(inSender, e){
			e.preventDefault();
			var size = Math.round(this.appPrefs.fontSize*Math.sqrt(e.scale));
			this.$.mainScroller.applyStyle("font-size", size + "%");
			this.statusPanel("Size: " + size + "%", 1);
	},
	gestureEnd: function(inSender, e){
		
		this.appPrefs.fontSize = this.appPrefs.fontSize*Math.sqrt(e.scale);
		this.$.pullout.refresh();
		this.resize();
	},
	
	flick: function(inSender, inEvent) {
		
	if ((inEvent.xVelocity > 1) && !(this.$.BackButton.getDisabled())) {
		this.goBack(null, inEvent);
		};
	
	if ((inEvent.xVelocity < -1) && !(this.$.ForwardButton.getDisabled())) {
		this.goForward(null, inEvent);
		};
	
	},
	
	resizeHandler: function(inSender, inEvent) {
		this.landscape = (window.innerWidth > window.innerHeight) ? true : false;
		this.$.mainPane.setShowing(!this.landscape && !this.full);
		this.$.bottomPane.setShowing(!this.landscape && !this.full);
		this.$.loadingBar.hide();
	}
});

