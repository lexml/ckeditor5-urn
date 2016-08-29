/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Command from '../core/command/command.js';
import findLinkRange from './findlinkrange.js';

/**
 * The unlink command. It is used by the {@link Link.Link link feature}.
 *
 * @memberOf link
 * @extends core.command.Command
 */
export default class UnlinkCommand extends Command {
	/**
	 * @see core.command.Command
	 * @param {core.editor.Editor} editor
	 */
	constructor( editor ) {
		super( editor );

		/**
		 * Flag indicating whether command is active. For collapsed selection it means that typed characters will have
		 * the command's attribute set. For range selection it means that all nodes inside have the attribute applied.
		 *
		 * @observable
		 * @member {Boolean} core.command.ToggleAttributeCommand#value
		 */
		this.set( 'hasValue', undefined );

		this.listenTo( this.editor.document.selection, 'change:attribute', () => {
			this.hasValue = this.editor.document.selection.hasAttribute( 'linkHref' );
		} );
	}

	/**
	 * Executes the command.
	 *
	 * When selection is collapsed then remove `linkHref` attribute from each stick node with the same `linkHref` attribute value.
	 *
	 * When selection is non-collapsed then remove `linkHref` from each node in selected ranges.
	 *
	 * @protected
	 */
	_doExecute() {
		const document = this.editor.document;
		const selection = document.selection;

		document.enqueueChanges( () => {
			// Get ranges to unlink.
			const rangesToUnlink = selection.isCollapsed ?
				[ findLinkRange( selection.getFirstPosition(), selection.getAttribute( 'linkHref' ) ) ] : selection.getRanges();

			// Keep it as one undo step.
			const batch = document.batch();

			// Remove `linkHref` attribute from specified ranges.
			for ( let range of rangesToUnlink ) {
				batch.removeAttribute( range, 'linkHref' );
			}
		} );
	}
}
