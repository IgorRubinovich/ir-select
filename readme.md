# ir-select

## Tagging-style multiselect box for Polymer 1.0

This is a tagging-style custom element built entirely from the ground up on [Polymer](http://www.polymer-project.org) and iron-components.
Aims to provide the same functionality as Selectize, Chosen2 and friends, using only vanilla JS and Polymer.

Integrates with native form posting values upon submit as expected - no additional code required.

## Docs and demo 
See the component page: [http://igorrubinovich.github.io/ir-select/](http://igorrubinovich.github.io/ir-select/)

## Usage

				<ir-select
					placeholder="Type a tag..."
					dataSource="http://example.com/"
					query-by-label="fields=title&query=.*[query].*"
					query-by-value="fields=id&q="
					
					minLength="3"
					
					data-path="envelope.data"
					value-path="value"
					label-path="label"
					
					preventDefault="true"
					
					name="mySelectBox"
					cloneToNative="true"

					allow-create="false"
				>
					<ir-select-item label="label1" value="24"></ir-select-item>
					<ir-select-item label="label2" value="42"></ir-select-item
				</ir-select>


### Setting selection
- Preset in DOM: upon initialization (on 'ready') ir-select will pick up its Light DOM for `ir-select-item` elements and update its value accordingly. Use standard DOM operations to add/remove `ir-select-item`-s during runtime and ir-select will update its value instantly.
- Add and remove ir-select-items dynamically during runtime and the component will update its values
- Use `.setSelection()` to replace the entire set of selected items

### Getting selection
#### Dynamic integration
- The `.value` property, is always up to date, with a comma-separated list of values. If allowCreate is true `.value` may also contain labels - in such case it's up to the user to be able to tell labels from values.
- .getSelected() retuns an array of objects with labels and values at labelPath and valuePath respectively
- Events are fired for various conditions - see below.

<a name="native-form-integration"></a>
#### Native form integration
You might have been puzzled about how exactly a non-native component may be submitted as part of a static form. You might also be aware that it's not possibble to append child elements to input elements. Thus it's not possible to enrich an input with shadow dom. 

ir-select solves this by adding a hidden native input to the  form it belongs to, and reflecting its `.value` property to the hidden field. The name of the hidden field is determined by iron-input's `.name` property. You know the rest of the story.
Granted, this somewhat breaks the encapsulation and further experiments will show whether it's possible to have the input under ir-select's own light dom. However the benefits of not having to have any further js processing of the element overweigh this (subtle? temporary?) downside.


## Contribution
Issues and pull requests are most welcome. Fork it [here](https://github.com/IgorRubinovich/ir-select).

## License
[MIT](http://opensource.org/licenses/MIT)
