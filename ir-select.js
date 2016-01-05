(function () {
	var KEYS = {
		ENTER : 13,
		ESC : 27,
		UP : 38,
		DOWN : 40,
		LEFT : 37,
		RIGHT : 39,
		BACKSPACE : 8
	};
 	
	var KEYSHASH = {};
	Object.keys(KEYS).forEach(function(k) { KEYSHASH[KEYS[k]] = true });
		
	Polymer({
		is : 'ir-select',

/*
Fired when an item is added. The created ir-select-item is passed to handler inside `.detail` field.
@event item-added
*/
/*
Fired when an item is removed. The ir-select-item staged for removal is passed to handler inside `.detail` field.
@event item-removed
*/
/*
Fired when item was added or removed, after the more specific events above.
@event change
*/
/*
Fired when a duplicate item is added to selection. The item is not added to selection.
@event item-duplicate
*/
/*
Fired when item being added was not suggested, regardless of `allowCreate` value.
@event item-unknown
*/
/*
Fired adding the item would make number of selected items exceed `maxItems`.
@event item-overflow
*/
		
		
/**
Handles control characters upon keydown in the textbox.

@method _handleControlKeys
@access private
*/ 
		_handleControlKeys : function (e) {
			var val, children, that = this;

			//if([KEYS.DOWN, KEYS.UP].indexOf(e.keyCode) > -1)
			//	return;

			if([KEYS.LEFT, KEYS.RIGHT, KEYS.BACKSPACE].indexOf(e.keyCode) == -1)
			{				
				if(this.itemInFocus)
				{
					this.itemInFocus.blur();
					delete this.itemInFocus;
				}
			}
			else
			{
				if(e.target != this.input)
					e.preventDefault();

				children = this.getChildItems();
				if((e.target != this.input) && !children.length) 
					e.preventDefault();;

				this.$.overlay.close();
			}

			switch(e.keyCode)
			{
				case KEYS.LEFT:
					if(this.itemInFocus) // if not set focusIndex defaults to last one
					{
						focusIndex = children.indexOf(this.itemInFocus);
						this.itemInFocus.blur();
					}
					
					if(focusIndex >	 0)
						focusIndex--;
					else
						focusIndex = children.length - 1;

					if(this.itemInFocus = children[focusIndex])
						this.itemInFocus.focus();	

					break;

				// right arrow - focus on next item
				case KEYS.RIGHT:
					if(this.input.value || !this.itemInFocus)
						break;

					
					focusIndex = children.indexOf(this.itemInFocus);
					this.itemInFocus.blur();
					
					if(!focusIndex && !(focusIndex === 0))
						break;
					
					if(focusIndex < children.length-1)
					{
						focusIndex++;
						if(this.itemInFocus = children[focusIndex])
							this.itemInFocus.focus();
						
						break;
					}

					this.itemInFocus.blur();
					delete this.itemInFocus;

					break;

				// backspace removes the itemInFocus
				case KEYS.BACKSPACE:
					if(e.target == this.input && this.input.value)
						break;

					var focusIndex = children.length;
					if(this.itemInFocus)
					{
						focusIndex = children.indexOf(this.itemInFocus)						
						this.itemInFocus.close();						
					}
					
					if(focusIndex > 0)
						focusIndex--;
					else if(children.length > 1)
						this.focusIndex = children.length - 1;
					else
					{
						e.stopPropagation();
						e.stopImmediatePropagation();
					}

					if(this.itemInFocus = children[focusIndex])
						this.itemInFocus.focus();
										
					e.preventDefault();

					break;

				case KEYS.DOWN:
					this._showOverlay();
					if(!this.$.selectBox.selectedItem)
						this.$.selectBox.selected = 0;
					else
					{
						this.$.selectBox.selectNext();
						while(this.$.selectBox.selectedItem.isHidden)
							this.$.selectBox.selectNext();
					}
					break;
				
				case KEYS.UP:
					this._showOverlay();
					if(!this.$.selectBox.selectedItem)
						this.$.selectBox.selected = this.suggestions.length - 1;
					else
					{
						this.$.selectBox.selectPrevious();
						while(this.$.selectBox.selectedItem.isHidden)
							this.$.selectBox.selectPrevious();
					}
					break;
				
				case KEYS.ENTER:
					this._addFromSelector();
					e.preventDefault();
				
				default:
					this.input.focus();
			}
		},
/**
Handles alphanumeric on keyup in textbox.

@method _handleTyping
@access private
*/
		_handleTyping : function(e)
		{
			if([KEYS.ESC, KEYS.DOWN, KEYS.UP, KEYS.LEFT, KEYS.RIGHT, KEYS.BACKSPACE, KEYS.ENTER].indexOf(e.keyCode) > -1)
				return;					// we are either navigating or suggestions were closed in _handleControlKeys and we don't want to reopen them until next typing
			else
				this.input.focus();
			
			this._loadSuggestions();
		},
		
/**
Initiates loading of suggestions by optionsLoader 

@method _loadSuggestions
@access private
@param showOverlay - show or not the overlay upon load, true by default
*/
		_loadSuggestions : function (showOverlay) {
			var that = this, toSearch;

			toSearch = (this.input.value || this.preType).trim();
			
			if(this._lastSearch != toSearch)
				this._lastSearch = toSearch;
			else
				return;
			
			if(toSearch.length >= this.minLength)
			{	
				this.$.optionsLoader.url = constructQuery(this.dataSource, this.queryByLabel, toSearch);
				this.$.optionsLoader.generateRequest();
				//this.$.selectBox.select(0)
			}
			else
			{
				this.suggestedOptions = [];
			}
		},
		
		/**
		show suggestions dropdown

		@method _showOverlay
		@access private
		*/
		_showOverlay : function () {
			if(!this.suggestions || !this.suggestions.length)
			{
				this.$.overlay.close();
				return
			}
			
			this._fileterSelectedFromSuggested();

			//this.input.focus();

			if(this.$.overlay.opened)
				return;

			this.$.overlay.open();
			Polymer.dom.flush();
		},
		
		_onOverlayClosed : function() {
			this.async(function() {
				this.input.focus();
			});
		},

		_onOverlayOpened : function() {
			this.async(function() {
				this.input.focus();
			});
		},

/**
Picks up `ir-select-item`s that are part of the local DOM during initialization

@method _setPreselectedOptions
@access private
*/
		_setPreselectedOptions : function() {
			var that = this;
			
			// reach to the envelope data
			this.get(this.dataPath, this.loadedSelection)
				.forEach(function(o) { 
					that.addSelection(o) 
				});
			
			this.$.selectionLoader.url = "";
		},
/**
Shortcut method to access all items in content (ir-select-item and input only)

@method _getChildren
@access private
*/
		_getChildren : function() {	
			var content = Polymer.dom(this.root).querySelector('content');
			return Polymer.dom(content).getDistributedNodes();
		},
/**
Returns selection of ir-select-item elements in the light DOM.

@method getChildItems
*/
		getChildItems : function() {	
			return this._getChildren().filter(function(n) { return n.is == 'ir-select-item' });
		},
/**
Get selected data out of the currently selected ir-select-item elements. 

@method 
@return { Array } of objects with labels and values at labelPath and valuePath respectively
@access public
*/
		getSelected : function() {
			var that = this, 
				res = [];

			[].forEach.call(this.getChildItems(), function(o) { 
				res.push(o.toObject(that.labelField, that.valueField)); 
			})
						
			return res;
		},

/**
Get selected data out of the currently selected ir-select-item elements - flattened to simple label-value objects, ignoring
labelPath and valuePath

@method 
@return { Array } of objects with labels and values at o.label and o.value.
@access public
*/
		getSelectedFlat : function() {
			var that = this, 
				res = [];

			[].forEach.call(this.getChildItems(), function(o) { 
				res.push(o.toObject()); 
			})
						
			return res;
		},
		
/**
Check whether obj is in selection

@method
@param {Object} obj an object as with label and value at labelPath and valuePath respectively
@return {Boolean} `true` if item is in selection, false otherwise
@access public
*/
		isSelected : function(obj)
		{
			var lp = this.labelPath, 
				vp = this.valuePath,
				val = this.get(vp, obj), 
				label = this.get(lp, obj),
				that = this;
			
			return this.getSelected().filter(function(o) { 
												var v = o.value,
													l = o.label;
	
												return 	(v == val && val != 'undefined' && typeof v != 'undefined') || 
														(l == label && typeof val == 'undefined' && typeof v == 'undefined' ) 
											}).length;
		},



/**
Adds a single item to the selection.

@method
@param {Array} selection an array of objects with label and value at labelPath valuePath respectively
@return {Boolean} True if item was added, false otherwise
@access public
*/
		addSelection : function(obj) {
			var canAdd = true, t;

			if(!this.get(this.valuePath, obj))
			{
				this.fire('item-unknown', obj);
				if(!this.allowCreate)
					canAdd = false
				else
				if(typeof t != 'object')
				{
					t = {};
					this.set(this.valuePath, obj, t);
					this.set(this.labelPath, obj, t);
					
					obj = t;
				}
			}
			
			if(this.maxItems > 1 && this.getSelected().length + 1 > this.maxItems)
			{
				this.fire('item-overflow', obj);
				canAdd = false;
			}
			
			if(this.maxItems == 1 && this.getSelected().length)
			{
				this.setSelection([]);
			}
			
			if(this.isSelected(obj))
			{
				this.fire('item-duplicate', obj);
				canAdd = false;
			}

			if(!canAdd)
				return false;
			
			var item = document.createElement('ir-select-item');

			Polymer.dom(this).insertBefore(item, this.input);
			Polymer.dom.flush();			

			item.item = obj;
			item.value = this.get(this.valuePath, obj);
			item.label = this.get(this.labelPath, obj);

			this._updateValue();
			
			this.fire('item-added', item);
			this.fire('change');
		},
		
/*
adds selected suggestion to selection
@access private
*/
		_addFromSelector : function(item) {
			var that = this;
			
			item = item || (this.$.overlay.opened && this.$.selectBox.selectedItem && this.$.selectBox.selectedItem.item);
			
			if(item)
			{
				this.addSelection(item);
				this.$.overlay.resetFit();
				this.notifyPath("suggestions.splice");
				this.input.value = "";
			}
			else
			if(this.allowCreate && this.input.value.trim())
			{
				this.addSelection(this.input.value)
				this.input.value = "";
			}

			that.$.overlay.close();
			
			that.input.focus();
		},
		
		clickedSuggestion : function(e) {
			this._addFromSelector(e.target.item);
		},

/**
Updates `.value` attribute when selection changes
@access private
*/
		_updateValue : function() {
			var vp = this.valuePath, 
				lp = this.labelPath,
				selected = this.getSelected(),
				value, valueArr,
				that = this;

			valueArr = !selected.length ? [] : selected
												// if there's no value use label as value
												.map(function(o) { return o.value ? o.value : o.label; })
												// filter out empty
												.filter(function (o) { return o } )
			
			value = valueArr.join(',');

			Polymer.dom(this).setAttribute('value', value);

			if(this.nativeClone)
				this.nativeClone.setAttribute('value', value);
			
			this._fileterSelectedFromSuggested();
		},
		
		_fileterSelectedFromSuggested : function() {
			var that = this,
				i, j,
				valueArr,
				doHide,
				hiddenCount = 0;
				
			if(!this.suggestions)
				return;

			valueArr = this.getSelectedFlat().map(function(item) { return item.value });

			for(j = 0; j < this.suggestions.length; j++)
			{
				doHide = false;
				for(i = 0; i < valueArr.length; i++)
					if(valueArr[i] == that.suggestions[j][this.valuePath])
					{
						doHide = true;
						hiddenCount++;
					}

				that.set("suggestions." + j + ".isHidden", doHide);
			}
			
			this._maxSuggestions = this.maxSuggestions + hiddenCount;
			if(this._hiddenCount != hiddenCount)
			{
				this._hiddenCount = hiddenCount;
				//if(hiddenCount)
				//	this._loadSuggestions(false);
				
			}
		},

/**
Select items defined in the array. Previous selection is lost.
@param {Array} selection array of objects with labels and values at labelPath and valuePath respectively.
*/
		setSelection: function(selection) 
		{
			var that = this,
				lf = this.labelField,
				vf = this.valueField;

			this.getChildItems().forEach(function(c) { c.close(); });
				
			var missingLabels = selection.filter(function(sel) { return !that.get(lf, sel) && that.get(vf, sel) });			
			
			this._updateValue();
			
			if(!missingLabels.length)
				return

			var missingIdsList = missingLabels.map(function (sel) { return sel.value }).join(",");
			
			this.$.selectionLoader.url = constructQuery(this.dataSource, this.queryByValue, missingIdsList);
			this.$.selectionLoader.generateRequest();			
		},
		
		attached : function() {
			var that = this, form;
			this.input = document.createElement("input");
			
			this.input.is = "iron-input";
			Polymer.dom(this).appendChild(this.input);
			
			Polymer.dom.flush();

			this.set("positionTarget", this.input, this.$.overlay);
			
			this.input.addEventListener('click', function () { that._loadSuggestions(); } );
			this.input.placeholder = this.placeholder;

			this.addEventListener('keydown', this._handleControlKeys.bind(this));
			this.addEventListener('keyup', this._handleTyping.bind(this));

			this.$.selectBox.addEventListener('keydown', function(ev) {
				console.log('checking keydown on ir-select');
				var k = ev.keyCode || ev.which;
				if(document.activeElement == this.input || document.activeElement.is == 'ir-select-item' || (k != KEYS.BACKSPACE && k != KEYS.ENTER))
					return;
				
				ev.preventDefault();
				this.input.focus();
				
				//ev.stopPropagation();
				//ev.stopImmediatePropagation();
			}.bind(this));

			this.input.type = 'text';

			this.addEventListener('item-attached', function(ev) { 
				that._updateValue();
			});

			this.addEventListener('item-close', function(ev) {
				delete this.itemInFocus;
				
				this.fire('item-removed', ev.detail);
				
				if(!(ev.detail && Polymer.dom(ev.detail).parentNode == this))
					return;
				
				Polymer.dom(this).removeChild(ev.detail);
				Polymer.dom.flush();
				this._updateValue();
				this.fire('change');
			});			

			if(this.cloneToNative && (this.name || this.cloneToNativeTarget))
			{
				if(this.cloneToNativeTarget)
						this.nativeClone = document.querySelector(this.cloneToNativeTarget);
				else
				{
					this.nativeClone = document.createElement('input');
					this.nativeClone.setAttribute("type", "hidden");
					this.nativeClone.setAttribute("name", this.name);
					this.name = "";
					
					this._updateValue();
					
					Polymer.dom(this).appendChild(this.nativeClone, this);
				}
			}
			
			this._updateValue();

			this._maxSuggestions = this.maxSuggestions;
		},
		
		_getSuggestions : function() {
			var r = this.suggestedOptions;
			if(this.dataPath)
				r = this.get(this.dataPath, this.suggestedOptions);
			
			this.set("suggestions", r);
		},

		listeners : {
			"overlay.iron-overlay-closed" : "_onOverlayClosed"
		},
				
		properties : {
			/** Value to look for when the input box is empty */
			preType : 				{ type : String,		value : "",				notify : true	},

			/** Selects an entirely new set of values, old values are lost */
			selected : 				{ type : Array,		value : [],				notify : true	},

			/** input placeholder */
			placeholder : 			{ type : String,	value : "type a tag",	notify : true	},

			/** Maximum number of items that can be selected. -1 means unlimited. 1 allows automatic replacement of selection. */
			maxItems : 				{ type : Number,	value : -1,			notify : true	},

			/** Maximum number of items that can be selected. -1 means unlimited. 1 allows automatic replacement of selection. */
			maxSuggestions :		{ type : Number,	value : 10,			notify : true	},

			/** Url to query */
			dataSource : 			{ type : String,	value : "",				notify : true	},
/** 
Querystring template to query suggestions by label. If contains the string `"[query]"` it will be replaced by the
query value, otherwise query is appended to queryByLabel.
*/
			queryByLabel :{ type : String,	value : "",				notify : true	},

/** 
Querystring template to query suggestions by value. If contains the string `"[query]"` it will be replaced by the
query value, otherwise query is appended to queryByValue.
*/
			queryByValue :{ type : String,	value : "",				notify : true	},

			/** Minimum length of search query required to send a request to the server */
			minLength :				{ type : Number,	value : 3,				notify : true	},

			/** Object path to label field on received objects, default is "label" */
			dataPath :	 			{ type : String,	value : "",		notify : true	},

			/** Object path to label field on received objects, default is "label" */
			labelPath : 			{ type : String,	value : "label",		notify : true	},

			/** Object path to value field on received objects, default is "value" */
			valuePath : 			{ type : String,	value : "value",		notify : true	},

			/** Computed property equal to suggested options at dataPath */
			suggestions : { type : String,	value : "",	notify : true },

			/** Allows adding (new) element without value. The new label will be used instead of the value in `value` property. */
			allowCreate : 			{ type : Boolean },

/*
[read-only] a comma delimited list of "valueField" properties of the selected objects. 
@example [29,31,4,newlabel1,34]. 
*/
			value : 				{ type : String,	value : "",				notify : true },
			
/** 
	If cloneToNativeTarget is set ir-select value is reflected to the target element value.
	If element is inside a &lt;form&gt; tag and has a name set, a sibling hidden element with the same name is created and 
	its value is updated to reflect the ir-select element value. 
*/
			cloneToNative :			{ type : Boolean,	value : true },
			/** If cloneToNative is true this selector will be used as target. Must have a `.value` property (like an input field) */
			cloneToNativeTarget :   { type : String },
			
/* 
Specifies input name, has effect when `.cloneToNative` is true and the element is inside a form.
Under the hood a hidden &lt;input&gt; element with this name is created under the form dom to be submitted
like a regular input element. The value of the hidden element reflects the current ir-select's .value property. 
*/
			name :					{ type : String, value : "" }
		},
		
		observers: [
			// '_selectedChanged(selected.splices)'
			"_getSuggestions(suggestedOptions.splice)"
		],
		
	});
	
	function constructQuery(baseUrl, queryTemplate, value)
	{
		var queryString;
		
		value = encodeURIComponent(value),
		queryString = /\[query\]/.test(queryTemplate) ? queryTemplate.replace(/\[query\]/, value) : queryTemplate + value;
		
		if(/\[maxItems\]/.test(queryString))
			queryString = queryString.replace(/\[max-suggestions\]/, this._maxSuggestions);
			
		if(queryString && baseUrl && (baseUrl[baseUrl.length-1] != '?'))
			baseUrl += '?'
		
		return baseUrl + queryString;
	}
	
	function encodeQuery(q)
	{
		if(!q) 
			return ""
		return q.split("&").map(function(pair) { var res = pair.split("="); return [res[0], encodeURIComponent(res[1])].join("=") }).join('&');
	}
})();
 