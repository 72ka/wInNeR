enyo.kind({
    classes: "app enyo-fit enyo-unselectable",
    name: "App",
    published: {
        appPrefs: {
			fontSize: 100,
			noImg: false,
			autoScroll: true,
			dataTotal: 0,
			page1: false,
			perpartes: false,
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
		 {kind: "Signals", onload: "load"},
		 {kind: "Signals", onbackbutton: "goBack"},
		 {kind: "Signals", name: "keyDownSignal", onkeydown: "handleKeyDown"},
         {name: "web", kind: "enyo.WebService", url: "", handleAs: "text", method: "GET", onResponse: "onWebSuccess", onError: "onWebFailure"},
         {name: "head", kind: "enyo.WebService", method: "HEAD", onResponse: "byteSizeFromUrl", onError: ""},
         
         
         {kind: "FittableRows", name: "Main", classes: "enyo-fit", components: [        
			 {name: "mainPane", kind: "onyx.Toolbar", layoutKind: "FittableColumnsLayout", classes: "toolbar", components: [
				 {name: "favicon", kind: "onyx.Icon", style: "height: 16px; width: 16px;", classes: "favico", src: "icon.png", ontap: "showPopUpRecents"},
					{kind: "onyx.InputDecorator", fit: true, classes: "inputMainDec", alwaysLooksFocused: false, components: [
						//{name: "favicon", kind: "onyx.Icon", style: "height: 16px; width: 16px;", classes: "favico", src: "icon.png", ontap: "addRecent"},
							{name: "UrlField", kind: "onyx.Input", selectOnFocus: true, defaultFocus: false, classes: "mainInput truncating-text", onfocus: "mainFocused", onchange: "", placeholder: $L("Type the url..."), components: [
								{kind: "onyx.Spinner", name: "loadSpinner", classes: "loadspinner", onStop: "spinnerStop"}
							]}				
					]},
					
					{kind: "onyx.Button", name: "goButton", content: "Go!", onclick: "inputUrlChange"},
					{kind: "onyx.IconButton", name: "Home", src: "images/home-icon.png", onclick: "goHome"}	
			]},
			{classes: "horizontal-shadow-top"},
			{name: "mainScroller", fit: true, kind: "enyo.Scroller", touch: true, fixedTime: true, classes: "mainScroll", horizontal: "hidden", onScroll: "onScroll", onScrollStart: "onScrollStart", ondragstart: "dragStart", onmousedown: "mouseDown", onclick: "mouseDown", components: [				
                        {name: "Desktop", kind: "enyo.Control", classes: "desktop enyo-selectable", allowHtml: true, ontap: "linkClicked", onhold: "desktopHold"},
                        {name: "Recent", components: [
						]}             
			]},
			{name: "DonateButton", kind: "enyo.Control", allowHtml: true, style: "text-align: center;"},
			{name: "statuspanel", classes: "status-shadow", content: ""},
			{classes: "horizontal-shadow-bottom"},
            {kind: "onyx.Toolbar", classes: "bottomtoolbar", name: "bottomPane", layoutKind: "FittableColumnsLayout", components: [
				  {name: "BackButton", kind: "onyx.Icon", src:"images/menu-icon-back.png", onclick: "goBack", disabled: true},
				  {fit: true, classes: "center-in-fittable", components: [
					  {name: "smallerTextButton", classes: "center-icon", kind: "onyx.Icon", src:"images/format_font_size_less.png",  onclick: "smallerText"},
					  {name: "panelButton", classes: "center-icon", kind: "onyx.Icon", src:"lib/onyx/images/more.png",  onclick: "Settings"},
					  {name: "biggerTextButton", classes: "center-icon", kind: "onyx.Icon", src:"images/format_font_size_more.png",  onclick: "biggerText"},	
	  
				  ]},
				  {name: "ForwardButton", kind: "onyx.Icon", src:"images/menu-icon-forward.png",  onclick: "goForward", disabled: true}
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
		{kind: "Pullout", name: "pullout", classes: "pullout", onTextSize: "TextSize", onLoadImages: "loadImages", onSelectable: "selectableText", onPullout: "Settings"}
     ],
     
    create: function (){

        this.inherited(arguments);
        
        this.$.loadSpinner.stop();
        this.$.goButton.hide();

		/* Get preferences */
		/* fix for http://forums.enyojs.com/discussion/1149/appstart-on-webos-old-screens-get-shown */
		enyo.asyncMethod(this, "getPrefs", "start");

		this.$.UrlField.setAttribute("x-palm-disable-auto-cap", true);

		this.$.Desktop.addStyles("font-size: " + this.appPrefs.fontSize*window.devicePixelRatio + "% !important");
		
		/* DEBUG */
		//this.$.UrlField.setValue("m.idnes.cz");	
	
    },
       
    load: function() {
		// fix layout once all the images are loaded
		this.resized();
	},
	
	cleanup: function () {
		this.savePrefs();
	},
	
	getPrefs: function (action) {
		//get prefs from the cookie if they exist
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
	  this.wholeHtml = this.wholeHtml + partialHtml;
	  this.history[this.index].html = this.wholeHtml;

		if (nextUrl) {
			this.nextUrlLink = "http://www.google.com" + nextUrl;
			
			if (this.appPrefs.perpartes) {
				this.page++;
				//enyo.log("PAGE: ", this.page);

			    this.spinnerStop();
			    this.$.goButton.hide();
				this.$.Home.show();
				this.resized();
			} else {
				this.$.web.setUrl(this.nextUrlLink);
				this.$.web.send();
				this.$.mainScroller.scrollToTop();
			};
		} else {
			
			this.$.goButton.hide();
			this.$.Home.show();
			
			//fixes the text aligning in input... good to resize for some other reasons too
			this.resized();
			this.spinnerStop();
			this.nextUrlLink = null;
			//enyo.log("PAGE LAST: ", this.page+1);
			this.page = 1;
			};

		//this.$.Desktop.setContent("");
		this.$.Desktop.setContent(this.history[this.index].html);
		//this.$.UrlField.setValue(this.history[this.index].nameForUrlField);
		
		try {
				/* I expect that the article name is longer than 30 characters */
				if (this.page == 1 && this.appPrefs.autoScroll && this.history[this.index].articleName && (this.history[this.index].articleName.length > 30)) {	
					this.scrollToArticle(this.history[this.index].articleName);
				};
		} catch (error) {
			enyo.log(error);
		};
		
		//this.history[this.index].nextUrlLink = this.nextUrlLink;
		
		if (!this.appPrefs.noImg) {
			this.getSizeImagesOnPage(partialHtml);
		};
		this.statusPanel(this.bytesToSize(this.dataReceived), 2);
			
	 this.naviButtons();
	 this.scrollEndFired = false;
  },
  
  removeGoogleBanners: function (data) {
	  
	  	/* Here is the magic of removing google banners, links processing, etc... */
	  	  
	 	/* remove top banner */
	  	data = data.substring(data.indexOf("<div>", data.indexOf("background-color:#eff3fa")), data.length);
		/* remove bottom banner */
      	data = data.substring(0, data.indexOf("<div style='margin-left:-.5em;margin-right:-.5em;margin-bottom:-.5em;border-top:1px solid #ccc;background-color:#eff3fa;padding:4px'>"));
      
		if (this.appPrefs.noImg) {
			/* images src to absolute path */
			var regex = new RegExp("img src='/", 'g');
			data = data.replace(regex, "img src='images/image-generic.png' title='http://www.google.com/");		
		} else {
			/* images src to absolute path */
			var regex = new RegExp("img src='/", 'g');
			data = data.replace(regex, "img src='http://www.google.com/");
		};
		
		/* hrefs to google path */
		regex = new RegExp("href='/", 'g');
		data = data.replace(regex, "href='http://www.google.com/");
		
		/* It looks better, if after image etc. ends as line break */
		regex = new RegExp("'/>", 'g');
		data = data.replace(regex, "'/><br>");
		
		/* remove any font-size settings for availability to change it */
		regex = new RegExp("font-size:?medium", 'g');
		data = data.replace(regex, "font-size:" + this.appPrefs.fontSize*window.devicePixelRatio*1.1 + "%");
		
		regex = new RegExp("font-size:?small", 'g');
		data = data.replace(regex, "font-size:" + this.appPrefs.fontSize*window.devicePixelRatio*0.9 + "%");
		
		
		/* change local path to http origin */
		regex = new RegExp("file://", 'g');
		data = data.replace(regex, "http://");	
      
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
		 if (inEvent.target.getAttribute("src") == "images/image-generic.png") {
			 //enyo.log("was NOT shown yet: ");
			 inEvent.target.src = inEvent.target.title; //change back original img src instead of image-generic.png
			 inEvent.target.removeAttribute("title"); //remove title attribute from img
			 this.history[this.index].html = document.getElementById("app_Desktop").innerHTML;
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
		 
		 /* It the target is a link */
		 if ((inEvent.target.tagName.toLowerCase() == "img") && this.appPrefs.noImg) {
		 
		 //enyo.log("TARGET IS LINK AND CONTAINS IMG TAG: ");
		 
		 /* If was NOT shown yet */
		 if (inEvent.target.getAttribute("src") == "images/image-generic.png") {
			 //enyo.log("was NOT shown yet: ");
			 inEvent.target.parentNode.title = inEvent.target.parentNode.href; //temporary switch the href to title
			 inEvent.target.parentNode.removeAttribute("href"); //disable the link action
			 inEvent.target.src = inEvent.target.title; //change back original img scr instead of image-generic.png
			 inEvent.target.removeAttribute("title"); //remove title attribute from img
			 this.history[this.index].html = document.getElementById("app_Desktop").innerHTML;
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

	//enyo.log("LINK PROCESSED: " + link + linkImg);

	
	 /* change the visited link color */
	 //inEvent.target.style = "color: purple;";
	 
	 //ToDo: doesn works this way... fix me
	 /* Save the changes to the html code */
	 this.history[this.index].html = document.getElementById("app_Desktop").innerHTML;
	 
	 this.$.loadSpinner.start();

	 this.history[this.index].scrollTop = this.$.mainScroller.getScrollTop();
	 this.history[this.index].nextUrlLink = this.nextUrlLink;

	 /* Important: Count the index here, not on other place */
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
	this.dataReceived = 0;
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
	this.resized();

  },
  
    goBack: function (inSender, inEvent) {
	try {
		if (this.history[this.index-1].html) {
			inEvent.preventDefault();
			this.history[this.index].scrollTop = this.$.mainScroller.getScrollTop();
			this.history[this.index].html = document.getElementById("app_Desktop").innerHTML;
			this.history[this.index].nextUrlLink = this.nextUrlLink;
			this.index--;
			this.nextUrlLink = this.history[this.index].nextUrlLink;
			this.wholeHtml = this.history[this.index].html;
			this.animate(this.$.Desktop, 200, -1);
			setTimeout((function(){	
			this.$.Desktop.setContent(this.history[this.index].html);
			this.$.mainScroller.setScrollTop(this.history[this.index].scrollTop);
			this.$.UrlField.setValue(this.history[this.index].nameForUrlField);
			this.naviButtons();
			 }).bind(this), 200);
		 
			
		};
	} catch (e) {};
	},
	
	goForward: function (inSender, inEvent) {
	try {	
		if (this.history[this.index+1].html) {
			inEvent.preventDefault();
			this.history[this.index].scrollTop = this.$.mainScroller.getScrollTop();
			this.history[this.index].html = document.getElementById("app_Desktop").innerHTML;
			this.history[this.index].nextUrlLink = this.nextUrlLink;
			this.index++;
			this.nextUrlLink = this.history[this.index].nextUrlLink;
			this.wholeHtml = this.history[this.index].html;
			this.animate(this.$.Desktop, 200, 1);
			setTimeout((function(){	
			 this.$.Desktop.setContent(this.history[this.index].html);
			 this.$.mainScroller.setScrollTop(this.history[this.index].scrollTop);
			 this.$.UrlField.setValue(this.history[this.index].nameForUrlField);
			 this.naviButtons();
			}).bind(this), 200);
		};	
	} catch (e) {};
	},
	
	biggerText: function () {
		this.appPrefs.fontSize = this.appPrefs.fontSize + 10;
		this.$.Desktop.addStyles("font-size: " + this.appPrefs.fontSize*window.devicePixelRatio + "%");
		this.$.pullout.refresh();
	},
	
	smallerText: function () {
		this.appPrefs.fontSize = this.appPrefs.fontSize - 10;
		this.$.Desktop.addStyles("font-size: " + this.appPrefs.fontSize*window.devicePixelRatio + "%");
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
		//enyo.log("FOCUSED");
		this.$.goButton.show();
		this.$.Home.hide();
		this.resized();
		/* Change the field content to real url instead of name of article */
		try {
			this.$.UrlField.setValue(this.history[this.index].realUrl);
		} catch (e) {};
		this.$.UrlField.onchange = "inputUrlChange";
	},
	
	scrollToArticle: function(articleName) {

		var previousContent = this.history[this.index].html;	
		//find only the first match - this is probably our article name
		var regex = new RegExp(articleName.substring(1, articleName.length), 'mi');
		//enyo.log("ARTICLENAME", articleName);
		previousContent = previousContent.replace(regex, "<span id='scrollhere'>" + articleName.substring(1, articleName.length) + "</span>");
		this.$.Desktop.setContent(previousContent);
		try {
			document.getElementById("scrollhere").scrollIntoView(true);
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
		this.$.Desktop.addStyles("font-size: " + inEvent.value*2*window.devicePixelRatio + "%");
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
	
	getSizeImagesOnPage: function(html) {
	
		/* Get all images src and send AJAX request for header only to get content-length */
		var byteSize = 0;
		var images = document.getElementById("app_Desktop").getElementsByTagName("img"); 
		for (var i = 0; i < images.length; i++) { 
			var height = images[i].getAttribute("height");
			var width = images[i].getAttribute("width"); 
			var src = images[i].getAttribute("src");
			if (height && width && images[i].getAttribute("src") != "images/image-generic.png" ) {
				this.$.head.setUrl(src);
				this.$.head.send();
			}
		};

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
		//enyo.log("EV", inEvent);
		//if (this.nextUrlLink && this.appPrefs.perpartes && !this.scrollEndFired && (inEvent.originator.bottomBoundary + this.$.mainScroller.getScrollTop()) > -100) {
		if (this.nextUrlLink && (inEvent.originator.bottomBoundary + this.$.mainScroller.getScrollTop()) > -100) {
			//enyo.log("END SCROLLER", inEvent.originator.bottomBoundary);
			this.$.mainScroller.onScroll = null;
			this.scrollerVertHeight = inEvent.originator.bottomBoundary;
			this.scrollEndFired = true;
			this.$.Desktop.addContent("<div id='loading-next'><img src='lib/onyx/images/spinner-light.gif'/><br>Loading next part...</div>");
			//this.$.mainScroller.scrollToBottom();
			this.$.mainScroller.scrollTo(0, -inEvent.originator.bottomBoundary);
			this.$.web.setUrl(this.nextUrlLink);
			this.$.web.send();
			this.$.loadSpinner.start();
			this.nextUrlLink = null;
			//enyo.log("END SCROLLER2", this.scrollerVertHeight);
		};
		return true;
	},
	
	onScrollStart: function(inSender, inEvent) {
		//enyo.log("BOUNDARY START", inEvent.originator.bottomBoundary);
		this.$.mainScroller.onScroll = "onScroll";
		this.scrollerVertHeight = inEvent.originator.bottomBoundary;
		//enyo.log("TOP", this.$.mainScroller.getScrollTop());
	},
	
	animate: function(element, time, direction) {

		element.setStyle("-webkit-transition-property: all; -webkit-transition-duration: " + time/1000 + "s; -webkit-transition-timing-function: ease-out; -webkit-transform: translateX(" + direction*(-window.innerWidth) + "px); opacity: 0;");
		setTimeout((function(){
			 element.setStyle("-webkit-transition-property: none; -webkit-transition-duration: " + 0 + "s; -webkit-transition-timing-function: linear; -webkit-transform: translateX(" + direction*window.innerWidth0 + "px); opacity: 0;");
		 }).bind(this), time);
		 setTimeout((function(){
			 element.setStyle("-webkit-transition-property: all; -webkit-transition-duration: " + time/1000 + "s; -webkit-transition-timing-function: ease-in; -webkit-transform: translateX(0px); opacity: 1;");
		 }).bind(this), time*2);
	 
	},
	
	getFavicon: function(url) {
		var src = "http://g.etfv.co/" + url;
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
				{kind: "onyx.GroupboxHeader", content: "Winner v0.0.6"},
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
			this.$.Recent.createComponent(
				{name: "Favorite" + i, ID: i, kind: "onyx.Button", classes: "recentButton", ontap: "goRecent" , onhold: "onRecentButtonHold", page: recents[i].url, recname: recents[i].name, components: [
					{kind: "onyx.Icon", src: recents[i].favicon, style: "width: 16px; height: 16px", classes: "recent"},
					{content: recents[i].name, classes: "truncating-text"}
				]}, {owner: this}
				);		
		};	
		this.$.Recent.render();
	},
	
	addRecent: function() {
		
			var toAdd = {};

			toAdd.url = this.history[this.index].realUrl;
			toAdd.name = this.history[this.index].realUrl.substring(this.history[this.index].realUrl.indexOf(".")+1);
			toAdd.favicon = "http://g.etfv.co/" + this.history[this.index].realUrl;
			toAdd.index = this.appPrefs.recents.length;
			
			this.appPrefs.recents.push(toAdd);
			
			this.savePrefs();
			
			this.statusPanel("Favorite saved...", 4);
	
	},
	
	onRecentButtonHold: function(inSender, inEvent) {
		
		inEvent.preventDefault();

		this.$.ModifyFavPopUp.setValue(inSender.recname);

		/* Disable auto-capitalization on webOS devices */
		this.$.ModifyFavPopUp.setAttribute("x-palm-disable-auto-cap", "true");
        this.$.ModifyFavPopUp.setAttribute("x-palm-title-cap", null);

		this.recentToModify = inSender;

		this.$.popupRecentsButton.show();

		this.$.ModifyFavPopUp.focus();
	},
	
	removeRecent: function(inSender) {
		
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
		
		this.nextUrlLink = null;
		
		this.$.ForwardButton.setDisabled(true);
		this.$.BackButton.setDisabled(true);
		
		this.clearHistory();

		var donateHTML = '<form action="https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=5CTRZJLKKUBS4&lc=CZ&item_name=Jan%20Herman&currency_code=USD&bn=PP%2dDonationsBF%3abtn_donate_SM%2egif%3aNonHosted" target="_blank" href="https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=5CTRZJLKKUBS4&lc=CZ&item_name=Jan%20Herman&currency_code=USD&bn=PP%2dDonationsBF%3abtn_donate_SM%2egif%3aNonHosted" method="post"><input type="image" src="images/donate.gif" style="text-align: center" border="0" name="submit" alt="PayPal - The safer, easier way to pay online!"></form>';
        
        this.$.Desktop.setContent('');

		this.$.DonateButton.setContent(donateHTML);
		
		this.$.DonateButton.show();
		
		this.$.UrlField.setValue("");
		this.$.favicon.setSrc("icon.png");
		
		
		/* Get Recent pages */
		this.getRecents();
		
		this.$.Recent.show();
		
		this.resized();
		
	},
	
	clearHistory: function () {
		this.history = [];
	},
	
	desktopHold: function(inSender, inEvent) {
		//enyo.log("HOLD", this.$.mainPane.getAttribute("style"));
		if (this.$.mainPane.getAttribute("style")) {
			this.$.mainPane.show();
			this.$.bottomPane.show();
			this.statusPanel("Fullscreen deactivated", 2);
		} else {
			this.$.mainPane.hide();
			this.$.bottomPane.hide();
			this.statusPanel("Fullscreen activated", 2);
		};
		this.resized();
		
		
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
    }
});

