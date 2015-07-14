# iron-select

## Tagging-style multiselect box for Polymer 1.0

This is a tagging-style custom element built entirely from the ground up on [Polymer](http://www.polymer-project.org) and iron-components.
Aims to provide the same functionality as Selectize, Chosen2 and friends, using only vanilla JS and Polymer.

## Usage:

		<iron-select
			// placeholder for the input element
			placeholder
			
			// url to query
			dataSource
			
			//  query parameters to query by label
			dataSourceQueryByLabel
			dataSourceQueryByValue
			dataSourceQueryField
			
			// minimum length of string to query
			minLength

			// label and value fields on the received objects
			valueField ["value"]
			labelField ["label"]
			
			// prevents submission when hitting enter inside the box
			preventDefault [true]
			
			// allows adding (new) element without value
			allowCreate
			
			value
			>
			<iron-select-item label="label1" value="label1">
			<iron-select-item label="label2" value="label2">
		</iron-select>

## Notes
* iron-select-item presets may be added in HTML as above or omitted
* use ironSelect.select = [<array of value objects>] to set selection during runtime


This component is functional but is still a work in progress. Pull requests are welcome.


## Key todos:
* Currently expects a raw array of objects from remote data source. Add an optional transform parameter with callback to traverse any server response.
* Support multi = false
* More eventing
* Better docs
* Tests
* Demo
* Proper packaging for customelements.io

### Pull requests 
are most welcome

