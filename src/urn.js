/**
 * @module urn/urn
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import URNLinkEditing from './urnlinkediting';
import URNLinkUI from './urnlinkui';

/**
 * The urn plugin.
 *
 * This is a "glue" plugin which loads the {@link module:link/linkediting~LinkEditing link editing feature}
 * and {@link module:link/linkui~LinkUI link UI feature}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class URN extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ URNLinkEditing , URNLinkUI ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'URN';
	}
}
