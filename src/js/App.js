enyo.kind({
    classes: "app enyo-fit enyo-unselectable",
    name: "App",
    published: {
        appPrefs: {
			fontSize: 100,
			noImg: false,
			autoScroll: true,
			dataTotal: 0,
		},
		wholeHtml: "",
        history: [],
        index: 0,
        base: "",
        urlPrefix: "http://www.google.com/gwt/x?u=",
        urlSuffix: "&wsc=fa&ct=pg1&whp=30",
        dataReceived: 0,
        dataNow: 0,		
    },
    components: [
		 {kind: "Signals", onload: "load"},
		 {kind: "Signals", onbackbutton: "goBack"},
		 {kind: "Signals", name: "keyDownSignal", onkeydown: "handleKeyDown"},
         {name: "web", kind: "enyo.WebService", url: "", handleAs: "text", method: "GET", onResponse: "onWebSuccess", onError: "onWebFailure"},
         {name: "head", kind: "enyo.WebService", method: "HEAD", onResponse: "byteSizeFromUrl", onError: ""},
         
         {kind: "FittableRows", classes: "enyo-fit", components: [        
			 {name: "mainPane", kind: "onyx.Toolbar", layoutKind: "FittableColumnsLayout", classes: "toolbar", components: [
					{kind: "onyx.InputDecorator", fit: true, classes: "inputMainDec", alwaysLooksFocused: false, components: [
						//{kind: "onyx.IconButton", src: "icon.png"},
							{name: "UrlField", kind: "onyx.Input", selectOnFocus: true, defaultFocus: false, classes: "mainInput", onfocus: "mainFocused", onchange: "", placeholder: "Type the url...", components: [
								{kind: "onyx.Spinner", name: "loadSpinner", classes: "loadspinner", onStop: "spinnerStop"}
							]}				
					]},
					
					{kind: "onyx.Button", name: "goButton", content: "Go!", onclick: "inputUrlChange"}	
			]},
			{classes: "horizontal-shadow-top"},
			{name: "mainScroller", fit: true, kind: "enyo.Scroller", touch: true, fixedTime: true, classes: "mainScroll", horizontal: "hidden", maxHeightChanged: "scrollerHeight",  ondragstart: "dragStart", onmousedown: "mouseDown", onclick: "mouseDown", components: [				
                        {name: "Desktop", kind: "enyo.Control", classes: "desktop enyo-selectable", allowHtml: true, ontap: "linkClicked"}
                  
			]},
			{name: "statuspanel", classes: "status-shadow", content: ""},
			{classes: "horizontal-shadow-bottom"},
            {kind: "onyx.Toolbar", classes: "bottomtoolbar", layoutKind: "FittableColumnsLayout", components: [
				  {name: "BackButton", kind: "onyx.Icon", src:"images/menu-icon-back.png", onclick: "goBack", disabled: true},
				  {fit: true, classes: "center-in-fittable", components: [
					  {name: "smallerTextButton", classes: "center-icon", kind: "onyx.Icon", src:"images/format_font_size_less.png",  onclick: "smallerText"},
					  {name: "panelButton", classes: "center-icon", kind: "onyx.Icon", src:"lib/onyx/images/more.png",  onclick: "Settings"},
					  {name: "biggerTextButton", classes: "center-icon", kind: "onyx.Icon", src:"images/format_font_size_more.png",  onclick: "biggerText"},	
	  
				  ]},
				  {name: "ForwardButton", kind: "onyx.Icon", src:"images/menu-icon-forward.png",  onclick: "goForward", disabled: true}
			]}
		 ]},
		 {kind: "Pullout", name: "pullout", classes: "pullout", onTextSize: "TextSize", onLoadImages: "loadImages", onSelectable: "selectableText", onPullout: "Settings"},
		 {name: "Popup", kind: "onyx.Popup", centered: true, floating: true, classes:"onyx-sample-popup", style: "padding: 10px;"},
     ],
     
    create: function (){

        this.inherited(arguments);
        this.$.loadSpinner.stop();
        this.$.goButton.hide();
        
        this.$.Desktop.setContent('<div id="main"></p><b>wInNeR</b> - <b>w</b>ebOS <b>I</b>ntelligent <b>N</b>ews <b>R</b>eader</div> by Jan Heřman (72ka) - ENYO 2 ALPHA VERSION!!</p>Type your favorite mobile (or non-mobile) news webpage...</p><img src="1.5/icon.png" />');
		this.$.UrlField.setAttribute("x-palm-disable-auto-cap", true);

		/* Get preferences */
		this.getPrefs();
		
		this.$.Desktop.addStyles("font-size: " + this.appPrefs.fontSize*window.devicePixelRatio + "%");
		
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
	
	getPrefs: function () {
		//get prefs from the cookie if they exist
		var cookie = enyo.getCookie("winnerAppPrefs");
		enyo.log("COOKIES: ", cookie);
		if (cookie) {
			// if it exists, else use the default
			this.appPrefs = enyo.mixin(this.appPrefs, enyo.json.parse(cookie));
		};
	},
	savePrefs: function () {
		//this.log("Saving Prefs");
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
			this.$.web.setUrl("http://www.google.com" + nextUrl);
			this.$.web.send();
			this.$.mainScroller.scrollToTop();
		} else {
			
			//enyo.log("Processed Article (INDEX " + this.index + "): " + this.history[this.index].articleName);
			try {
				/* I expect that the article name is longer than 30 characters */
				if (this.appPrefs.autoScroll && this.history[this.index].articleName && (this.history[this.index].articleName.length > 30)) {	
					this.scrollToArticle(this.history[this.index].articleName);
				};
			} catch (error) {
				enyo.log(error);
				};

			this.$.UrlField.setValue(this.history[this.index].nameForUrlField);
			
			this.$.goButton.hide();
			
			//fixes the text aligning in input... good to resize for some other reasons too
			this.resized();
			this.spinnerStop();
			};

		this.$.Desktop.setContent("");
		this.$.Desktop.setContent(this.history[this.index].html);
		
		if (!this.appPrefs.noImg) {
			this.getSizeImagesOnPage(partialHtml);
		};
		this.statusPanel(this.bytesToSize(this.dataReceived), 2);
			
	 this.naviButtons();
  },
  
  removeGoogleBanners: function (data) {
	  
	  	/* Here is the magic of removing google banners, links processing, etc... */
	  	  
	 	/* remove top banner */
	  	data = data.substring(data.indexOf("<div>", data.indexOf("<div style='background-color:#eff3fa")), data.length);
		/* remove bottom banner */
      	data = data.substring(0, data.indexOf("<div style='background-color:#eff3fa"));
      
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
		
		/* change local path to http origin */
		regex = new RegExp("file://", 'g');
		data = data.replace(regex, "http://");	
      
      return data;
      
  },
  
  getNextUrlFromRawData: function (data) {
	  
	  var nextUrlData = data.substring(data.lastIndexOf("<div style='background-color:#eff3fa"), data.length);   
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
			 inEvent.target.src = inEvent.target.title; //change back original img scr instead of image-generic.png
			 inEvent.target.removeAttribute("title"); //remove title attribute from img
			 this.history[this.index].html = document.getElementById("app_Desktop").innerHTML;
			 /* Check the image byte size */
			 this.$.head.setUrl(inEvent.target.src);
			 this.$.head.send();
			 //return; //just load the image, and then do nothing
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

	 /* Important: Count the index here, not on other place */
	 this.index++;
	 
	 this.history[this.index] = [];
	 this.history[this.index].articleName = inEvent.target.innerText;
	 this.history[this.index].realUrl = "http" + link.substring(link.lastIndexOf("://"), link.length);
	 
	 this.history[this.index].base = link.substring(link.lastIndexOf("://")+3, link.indexOf("/", link.lastIndexOf("://")+3));
	 this.history[this.index].nameForUrlField = this.history[this.index].base + ": " + inEvent.target.innerHTML;

	 //enyo.log("Stored Article (INDEX " + this.index + "): " + this.history[this.index].articleName);
	 
	 this.wholeHtml = "";
	 
	 this.$.Desktop.setContent("");
	 
	 this.$.web.setUrl(link + this.urlSuffix);
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

	inEvent.preventDefault();
	this.dataReceived = 0;
	this.$.UrlField.onchange = "";
    var pre = "";
    var UrlFieldValue = this.$.UrlField.getValue();
    this.index++;
    this.history[this.index] = [];
    this.lastUrl = this.urlPrefix + UrlFieldValue + this.urlSuffix;
    if (UrlFieldValue.indexOf("http://") == -1) pre = "http://";
    this.history[this.index].realUrl = pre + UrlFieldValue;
    this.history[this.index].nameForUrlField = this.history[this.index].realUrl;
    this.$.UrlField.setValue(this.history[this.index].realUrl);
    this.wholeHtml = "";
    
    this.$.Desktop.setContent("");
    
    this.$.web.setUrl(this.lastUrl);
    this.$.web.send();
     
     this.$.loadSpinner.start();
     try {
		this.history[this.index].scrollTop = 0;
	} catch (error) {};
	
	/* FIXME: If I use blur here, it fires and onchange event and run this function twice again!
	 * Thus I disabled onchange event and start it again only when focused - see onfocus handler */	
	this.$.UrlField.hasNode().blur();
	
	this.$.keyDownSignal.onkeydown = "handleKeyDown";

  },
  
    goBack: function (inSender, inEvent) {
	try {
		if (this.history[this.index-1].html) {
			inEvent.preventDefault();
			this.history[this.index].scrollTop = this.$.mainScroller.getScrollTop();
			this.history[this.index].html = document.getElementById("app_Desktop").innerHTML;
			this.index--;
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
			this.index++;
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
		var regex = new RegExp(articleName, 'mi');
		//enyo.log("REGEX", regex);
		previousContent = previousContent.replace(regex, "<span id='scrollhere'>" + articleName + "</span>");
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
        this.$.UrlField.hasNode().focus();
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
	
	animate: function(element, time, direction) {

		element.setStyle("-webkit-transition-property: all; -webkit-transition-duration: " + time/1000 + "s; -webkit-transition-timing-function: ease-out; -webkit-transform: translateX(" + direction*(-window.innerWidth) + "px); opacity: 0;");
		setTimeout((function(){
			 element.setStyle("-webkit-transition-property: none; -webkit-transition-duration: " + 0 + "s; -webkit-transition-timing-function: linear; -webkit-transform: translateX(" + direction*window.innerWidth0 + "px); opacity: 0;");
		 }).bind(this), time);
		 setTimeout((function(){
			 element.setStyle("-webkit-transition-property: all; -webkit-transition-duration: " + time/1000 + "s; -webkit-transition-timing-function: ease-in; -webkit-transform: translateX(0px); opacity: 1;");
		 }).bind(this), time*2);
	 
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
	
    aboutClick: function(){
		//reserved
    }
});
