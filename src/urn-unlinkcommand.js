/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module link/unlinkcommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import findLinkRange from './findlinkrange';

/**
 * The unlink command. It is used by the {@link module:link/link~Link link plugin}.
 *
 * @extends module:core/command~Command
 */
export default class URN_UnlinkCommand extends Command {
	/**
	 * @inheritDoc
	 */
	refresh() {
		this.isEnabled = this.editor.model.document.selection.hasAttribute( 'xlink:href' );
	}

	/**
	 * Executes the command.
	 *
	 * When the selection is collapsed, removes the `xlink:href` attribute from each node with the same `xlink:href` attribute value.
	 * When the selection is non-collapsed, removes the `xlink:href` attribute from each node in selected ranges.
	 *
	 * @fires execute
	 */
	execute() {
		const model = this.editor.model;
		const selection = model.document.selection;

		model.change( writer => {
			// Get ranges to unlink.
			const rangesToUnlink = selection.isCollapsed ?
				[ findLinkRange( selection.getFirstPosition(), selection.getAttribute( 'xlink:href' ), model ) ] : selection.getRanges();

			// Remove `xlink:href` attribute from specified ranges.
			for ( const range of rangesToUnlink ) {
				writer.removeAttribute( 'xlink:href', range );
			}
		} );
	}
}
