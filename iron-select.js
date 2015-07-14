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
		is : 'iron-select',
		
		handleControlKeys : function (e) {
			var val, that = this;

			if(this.itemInFocus && ([KEYS.LEFT, KEYS.RIGHT, KEYS.BACKSPACE].indexOf(e.keyCode) == -1))
			{
				this.itemInFocus.blur();
				delete this.itemInFocus;
			}
				
			this.input.focus();
			switch(e.keyCode)
			{
				case KEYS.ENTER: 
					if(!this.input.value)
						return;
					
					val = this.$.selectBox.selectedItem ? this.suggestedOptions[this.$.selectBox.selected] : { title : this.input.value }
					
					this.addSelection(val);

					this.input.value = "";
					this.suggestedOptions = [];

					if(this.preventDefault)
						e.preventDefault();
					
					this.$.selectBox.select();
					
					break;

				case KEYS.ESC:
					this.suggestedOptions = [];

					this.$.selectBox.select();

					break;
					
				// up arrow - select previous item when iron-select is open
					case KEYS.UP: 
					if(!this.$.selectBox.selectedItem && this.$.selectBox.items.length) 
						this.$.selectBox.select	(this.$.selectBox.items[this.$.selectBox.items.length-1].value);
					else if(this.$.selectBox.selectedItem)
						this.$.selectBox.selectPrevious();						
						// this.input.value = this.$.selectBox.selectedItem.innerHTML						
					break;
				
				 // down arrow - select next item when iron-select is open
				case KEYS.DOWN:
					if(!this.$.selectBox.selectedItem && this.$.selectBox.items.length) 
						this.$.selectBox.select(0);
					else
						this.$.selectBox.selectNext();	
						// this.input.value = this.$.selectBox.selectedItem.innerHTML						
					break;
					
				// left arrow - focus on previous item
				case KEYS.LEFT:					
					if(this.input.value)
						break;

					var children = this.getChildItems(),
						focusIndex = children.length;
						
					if(!children.length) break
					
					if(this.itemInFocus) // if not set focusIndex defaults to last one
					{
						focusIndex = children.indexOf(this.itemInFocus);
						this.itemInFocus.blur();
					}
					
					if(!focusIndex && !(focusIndex === 0))
						break;
					
					if(focusIndex >	 0)
						focusIndex--;

					this.itemInFocus = children[focusIndex];
					this.itemInFocus.focus();	

					break;

				// right arrow - focus on next item
				case KEYS.RIGHT:
					if(this.input.value || !this.itemInFocus)
						break;

					var children = this.getChildItems(),
						focusIndex = 0;
						
					if(!children.length) break
					
					focusIndex = children.indexOf(this.itemInFocus);
					this.itemInFocus.blur();
					
					if(!focusIndex && !(focusIndex === 0))
						break;
					
					if(focusIndex < children.length-1)
					{
						focusIndex++;
						this.itemInFocus = children[focusIndex];
						this.itemInFocus.focus();
						
						break;
					}

					this.itemInFocus.blur();
					delete this.itemInFocus;

					break;

				// backspace or delete remove the itemInFocus
				case KEYS.BACKSPACE:
					if(this.input.value)
						break;

					var children = this.getChildItems();
					
					if(!children.length)
						break;
					
					var focusIndex = children.length;
					if(this.itemInFocus)
					{
						focusIndex = children.indexOf(this.itemInFocus),
						oldItemInFocus = this.itemInFocus;
						
						oldItemInFocus.close();
					}
					
					if(focusIndex > 0)
						focusIndex--;
					else if(children.length > 1)
						focusIndex++;

					this.itemInFocus = children[focusIndex];
					this.itemInFocus.focus();
					
					break;
			}
		},
		
		handleTyping : function(e)
		{
			if(e.keyCode in KEYSHASH)
				return;
			
			this.loadSuggestions();
		},
		
		loadSuggestions : function () {
			var that = this;
			
			if(this.input.value.length >= this.minLength)
			{
				var params = this.dataSourceQueryByLabel
				this.$.optionsLoader.url = this.dataSource +"?"
											+	encodeQuery(this.dataSourceQueryByLabel) + "&"
											+	this.dataSourceQueryField+"="+encodeURIComponent(".*" + this.input.value + ".*");

				this.$.optionsLoader.generateRequest();
			}
			else
				this.suggestedOptions = [];

		},
		
		getValue: function(obj, key) {
			return obj[key];
		},
		
		setPreselectedOptions : function(e) {
			//this.selected = this.loadedSelection
			var that = this;
			
			this.loadedSelection.forEach(function(o) { that.addSelection(o) });
			
			this.$.selectionLoader.url = "";
		},
		getChildren : function() {	
			var content = Polymer.dom(this.root).querySelector('content');
			return Polymer.dom(content).getDistributedNodes();
		},
		getChildItems : function() {	
			return this.getChildren().filter(function(n) { return n.is == 'iron-select-item' });
		},
		getSelected : function() {
			var that = this, 
				res = [];
				
			[].forEach.call(this.getChildItems(), function(o) { res.push(o.toObject(that.labelField, that.valueField)); } )
						
			return res;
		},
		
		isSelected : function(sel)
		{
			// has item with same val => true
			// val is 
			
			var lf = this.labelField, vf = this.valueField,
				val = sel[vf], label = sel[lf];
			
			return this.getSelected().filter(function(o) { 
												return 	o[vf] == val || 
														(o[lf] == label && typeof val == 'undefined' && typeof o[vf] == 'undefined' ) 
											}).length;
		},
		// adds selection where 
		// will check 

		/**
			* adds a selection
			* @param {object} [sel] should have sel[valueField] and/or sel[labelField] set
			
			* @example
			* adds iron-select-item with value set to 10
			* .addSelection({ value : 10, label : "tag1" });
			* @example
			* adds iron-select item with value set to "tag2" if allowCreate is true
			* .addSelection(label : "tag2" });
			* @returns {Number} Returns the value of x for the equation.
		*/
		addSelection : function(sel) {
			if(this.isSelected(sel))
				return;
			
			if(!sel[this.valueField] && !this.allowCreate)
				return;
			
			var item = document.createElement('iron-select-item');

			Polymer.dom(this).insertBefore(item, this.input);
			Polymer.dom.flush();			
			
			item.value = sel[this.valueField];
			item.label = sel[this.labelField];
	
			this.updateValue();
		},
		
		addFromSelector : function(e) {
			console.log(e.detail);
			var index = this.$.selectBox.items.indexOf(e.target);
			this.addSelection(this.suggestedOptions[this.$.selectBox.items.indexOf(e.target)]);

			// this.$.selectBox.select(-1);
			this.suggestedOptions = [];
		},
		
		updateValue : function() {
			var vf = this.valueField, lf = this.labelField;
			var selected = this.getSelected();
			//console.log('updating value', !selected.length ? '' : selected.map(function(o) { return o[vf] ? o[vf] : o[lf] }).filter(function (o) { return o } ).join(','));
			Polymer.dom(this).setAttribute('value', !selected.length ? '' : selected.map(function(o) { return o[vf] ? o[vf] : o[lf] }).filter(function (o) { return o } ).join(','));
		},
	
		_selectedChanged: function(changeRecord) 
		{
			var that = this,
				lf = this.labelField,
				vf = this.valueField;


			if(!this.selected.length) return;

			var missingLabels = this.selected.filter(function(sel) { return !sel[lf] && sel[that.valueField] });
			
			this.updateValue();
			
			if(!missingLabels.length)
				return

			var missingIdsList = missingLabels.map(function (sel) { return sel[that.valueField] }).join(",");

			this.$.selectionLoader.url = this.dataSource+"?" 
						+	encodeQuery(this.dataSourceQueryByValue) + "&"
						+	this.dataSourceQueryField+"="+missingIdsList;

			this.$.selectionLoader.generateRequest();
		
			
			this.fire('bind-value-changed', this.bindValue);
		},
		
		ready	: function() {

			this.input = document.createElement("input");
			

			this.input.is = "iron-input";
			Polymer.dom(this).appendChild(this.input);
			
			Polymer.dom.flush();

			var that = this;
			this.input.addEventListener('click', function () { console.log("click!"); that.loadSuggestions(); } );
			this.input.placeholder = this.placeholder;
			
			this.addEventListener('keyup', this.handleTyping);
			this.addEventListener('keydown', this.handleControlKeys);
			this.input.type = 'text';
			
			this.addEventListener('item-attached', function(ev) { 
				that.updateValue();
			});

			this.addEventListener('item-close', function(ev) {
				if(this.itemInFocus == ev.detail)
					delete this.itemInFocus;

				var that = this;
				setTimeout(function() {
					Polymer.dom(that).removeChild(ev.detail);
					that.updateValue();
				}, 300)

			})
		},
		
		_valueChanged: function()
		{
		},

		properties : {
			selected : 				{ type : Array,		value : [],				notify : true	},

			placeholder : 			{ type : String,	value : "type a tag",	notify : true	},
			multi : 				{ type : Boolean,	value : true,			notify : true	},

			dataSource : 			{ type : String,	value : "",				notify : true	},
			dataSourceQueryByLabel :{ type : String,	value : "",				notify : true	},
			dataSourceQueryByValue :{ type : String,	value : "",				notify : true	},
			dataSourceQueryField : 	{ type : String,	value : "q",			notify : true	},
			minLength :				{ type : Number,	value : 3,				notify : true	},

			labelField : 			{ type : String,	value : "label",		notify : true	},
			valueField : 			{ type : String,	value : "value",			notify : true	},

			preventDefault : 		{ type : Boolean,	value : true,			notify : true	},
	
			allowCreate : 			{ type : Boolean,	value : true },
			value : 				{ type : String,	value : "",				notify : true,  observer: '_valueChanged'	},
		},
		
		observers: [
			'_selectedChanged(selected.splices)'
		],
		
	});
	
	function encodeQuery(q)
	{
		if(!q) 
			return ""
		return q.split("&").map(function(pair) { var res = pair.split("="); return [res[0], encodeURIComponent(res[1])].join("=") }).join('&');
	}
})();