/**
 * @module link/linkediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { downcastAttributeToElement } from '@ckeditor/ckeditor5-engine/src/conversion/downcast-converters';
import { upcastElementToAttribute, upcastAttributeToAttribute } from '@ckeditor/ckeditor5-engine/src/conversion/upcast-converters';
import URNLinkCommand from './urnlinkcommand';
import URN_UnlinkCommand from './urn-unlinkcommand';
import { createLinkElement, ensureSafeUrn } from './utils';
import bindTwoStepCaretToAttribute from '@ckeditor/ckeditor5-engine/src/utils/bindtwostepcarettoattribute';
import findLinkRange from './findlinkrange';
import '../theme/link.css';

const HIGHLIGHT_CLASS = 'ck-link_selected';

/**
 * The urnLink engine feature.
 *
 * It introduces the `xlink:href="urn"` attribute in the model which renders to the view as a `<span xlink:href="urn!fragment">` element
 * as well as `'urn'` and `'unlink'` commands.
 *
 * @extends module:core/plugin~Plugin
 */
export default class URNLinkEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	init() {
		
		const editor = this.editor;

		// Allow xlink:href attribute on all inline nodes.
		editor.model.schema.extend( '$text', { allowAttributes: 'xlink:href' } );

		editor.conversion.for( 'dataDowncast' )
			.add( downcastAttributeToElement( { model: 'xlink:href', view: createLinkElement } ) );

		editor.conversion.for( 'editingDowncast' )
			.add( downcastAttributeToElement( { model: 'xlink:href', view: ( urn, writer ) => {
				return createLinkElement( ensureSafeUrn( urn ), writer );
			} } ) );

		editor.conversion.for( 'upcast' )
			// TODO: conversor original sobrescrito
			// .add( upcastElementToAttribute( {
			.add( upcastAttributeToAttribute( {
				view: {
					key: 'xlink:href' 
					// name: 'span',
					// attributes: {
					// 	'xlink:href': true
					// }
				},
				model: {
					key: 'xlink:href',
					value: viewElement => viewElement.getAttribute( 'xlink:href' )
				}
			} ) );

		// Create linking commands.
		editor.commands.add( 'urn', new URNLinkCommand( editor ) );
		editor.commands.add( 'unlink', new URN_UnlinkCommand( editor ) );

		// Enable two-step caret movement for `xlink:href` attribute.
		bindTwoStepCaretToAttribute( editor.editing.view, editor.model, this, 'xlink:href' );

		// Setup highlight over selected link.
		this._setupLinkHighlight();
	}

	/**
	 * Adds a visual highlight style to a link in which the selection is anchored.
	 * Together with two-step caret movement, they indicate that the user is typing inside the link.
	 *
	 * Highlight is turned on by adding `.ck-link_selected` class to the link in the view:
	 *
	 * * the class is removed before conversion has started, as callbacks added with `'highest'` priority
	 * to {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher} events,
	 * * the class is added in the view post fixer, after other changes in the model tree were converted to the view.
	 *
	 * This way, adding and removing highlight does not interfere with conversion.
	 *
	 * @private
	 */
	_setupLinkHighlight() {
		const editor = this.editor;
		const view = editor.editing.view;
		const highlightedLinks = new Set();

		// Adding the class.
		view.document.registerPostFixer( writer => {
			const selection = editor.model.document.selection;

			console.log('selection:', selection);

			if ( selection.hasAttribute( 'xlink:href' ) ) {
				const modelRange = findLinkRange( selection.getFirstPosition(), selection.getAttribute( 'xlink:href' ), editor.model );
				const viewRange = editor.editing.mapper.toViewRange( modelRange );

				// There might be multiple `span` elements in the `viewRange`, for example, when the `span` element is
				// broken by a UIElement.
				for ( const item of viewRange.getItems() ) {
					if ( item.is( 'span' ) ) {
						writer.addClass( HIGHLIGHT_CLASS, item );
						highlightedLinks.add( item );
					}
				}
			}
		} );

		// Removing the class.
		editor.conversion.for( 'editingDowncast' ).add( dispatcher => {
			// Make sure the highlight is removed on every possible event, before conversion is started.
			dispatcher.on( 'insert', removeHighlight, { priority: 'highest' } );
			dispatcher.on( 'remove', removeHighlight, { priority: 'highest' } );
			dispatcher.on( 'attribute', removeHighlight, { priority: 'highest' } );
			dispatcher.on( 'selection', removeHighlight, { priority: 'highest' } );

			function removeHighlight() {
				view.change( writer => {
					for ( const item of highlightedLinks.values() ) {
						writer.removeClass( HIGHLIGHT_CLASS, item );
						highlightedLinks.delete( item );
					}
				} );
			}
		} );
	}
}
