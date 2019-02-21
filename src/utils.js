/**
 * @module link/utils
 */

const linkElementSymbol = Symbol( 'linkElement' );

const ATTRIBUTE_WHITESPACES = /[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205f\u3000]/g; // eslint-disable-line no-control-regex
const SAFE_URL = /^(?:(?:urn:lex:br):|[^a-z]|[a-z+.-]+(?:[^a-z+.:-]|$))/i;

/**
 * Returns `true` if a given view node is the link element.
 *
 * @param {module:engine/view/node~Node} node
 * @returns {Boolean}
 */
export function isLinkElement( node ) {
	return node.is( 'attributeElement' ) && !!node.getCustomProperty( linkElementSymbol );
}

/**
 * Creates link {@link module:engine/view/attributeelement~AttributeElement} with provided `xlink:href` attribute.
 *
 * @param {String} urn
 * @returns {module:engine/view/attributeelement~AttributeElement}
 */
export function createLinkElement( urn, writer ) {
	// Priority 5 - https://github.com/ckeditor/ckeditor5-link/issues/121.
	const linkElement = writer.createAttributeElement( 'span', { 'xlink:href': urn, class: 'lexml-url'}, { priority: 5 } );
	writer.setCustomProperty( linkElementSymbol, true, linkElement );

	return linkElement;
}

/**
 * Returns a safe URL based on a given value.
 *
 * An URL is considered safe if it is safe for the user (does not contain any malicious code).
 *
 * If URL is considered unsafe, a simple `"#"` is returned.
 *
 * @protected
 * @param {*} urn
 * @returns {String} Safe URN.
 */
export function ensureSafeUrn( urn ) {
	
	urn = String( urn );

	return isSafeUrl( urn ) ? urn : '#';
}

// Checks whether the given URL is safe for the user (does not contain any malicious code).
//
// @param {String} url URL to check.
function isSafeUrl( url ) {
	const normalizedUrl = url.replace( ATTRIBUTE_WHITESPACES, '' );

	return normalizedUrl.match( SAFE_URL );
}
