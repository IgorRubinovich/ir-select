# ir-select

# Tagging-style multiselect box for Polymer 1.0

This is a tagging-style custom element built entirely from the ground up on [Polymer](http://www.polymer-project.org) and iron-components.
Aims to provide the same functionality as Selectize, Chosen2 and friends, using only vanilla JS and Polymer.

Integrates with native form posting values upon submit as expected - no additional code required ([but how?](#native-form-integration)).

## Usage

				<ir-select
					placeholder="Type a tag..."
					data-source="http://example.com/"
					query-by-label="fields=title&query=.*[query].*&limit=[max-suggestions]"
					query-by-value="fields=id&q="

					max-suggestions="10"
					min-length="3"
					
					data-path="envelope.data"
					value-path="value"
					label-path="label"
					
					prevent-default="true"

					pre-type="<text to search for when the box is empty>"
					
					name="mySelectBox"
					clone-to-native="true"

					allow-create="false"
				>
					<ir-select-item label="label1" value="24"></iron-select-item>
					<ir-select-item label="label2" value="42"></iron-select-item
				</ir-select>


### Setting selection
- Preset in DOM: upon initialization (on 'ready') ir-select will pick up its Light DOM for `ir-select-item` elements and update its value accordingly. Use standard DOM operations to add/remove `iron-select-item`-s during runtime and iron-select will update its value instantly.
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

iron-select solves this by adding a hidden native input to the  form it belongs to, and reflecting its `.value` property to the hidden field. The name of the hidden field is determined by iron-input's `.name` property. You know the rest of the story.
Granted, this somewhat breaks the encapsulation and further experiments will show whether it's possible to have the input under iron-select's own light dom. However the benefits of not having to have any further js processing of the element overweigh this (subtle? temporary?) downside.

## Events
- item-added, item-removed speak for themselves
- change is fired when item was added or removed, after the more specific events above.
- item-duplicate will fire when a duplicate is being added
- item-unknown will fire when an item without value at valuePath is being added

## Style
Minimal styling is set internally.

- `iron-select-item` elements live in the Light DOM they may be styled by component user just like any element.
- Use `.ir-select-item-focus` class to to style item in focus.

The intent is to make the component fully customizable.

## User navigation
As expected:
- Left and right keys navigate selected items, backspace deletes the selection in focus
- Up and down keys navigate suggestions, Enter selects highlighter suggestion


## Key todos
- Option for visual feedback on duplicates and unknowns
- Style customization
- "Offline" suggestions from a predefined range of choices a-la native select
- Tests

## Contribution
Issues and pull requests are most welcome. Fork it [here](https://github.com/IgorRubinovich/ir-select).

## License
[MIT](http://opensource.org/licenses/MIT)
