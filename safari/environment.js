/* global safari: false */

import _ from 'lodash';

import resCss from '../lib/css/res.scss';

import { createMessageHandler } from '../lib/environment/common/messaging';
import * as Init from '../lib/core/init';

// DOM Collection iteration
NodeList.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];
HTMLCollection.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];

// Safari has a ridiculous bug that causes it to lose access to safari.self.tab if you click the back button.
// this stupid one liner fixes that.
window.onunload = () => {};

// since safari's built in extension stylesheets are treated as user stylesheets,
// we can't inject them that way.  That makes them "user stylesheets" which would make
// them require !important everywhere - we don't want that, so we'll inject this way instead.
_.defer(() => Init.headReady.then(() => { // deferred because of the circular dependency between init and environment
	const linkTag = document.createElement('link');
	linkTag.rel = 'stylesheet';
	linkTag.href = safari.extension.baseURI + resCss;
	document.head.appendChild(linkTag);
}));

const {
	_handleMessage,
	sendMessage,
	sendSynchronous,
	addListener,
	addInterceptor,
} = createMessageHandler((type, obj) => safari.self.tab.dispatchMessage(type, obj));

safari.self.addEventListener('message', ({ name: type, message: obj }) => {
	_handleMessage(type, obj);
});

export {
	sendMessage,
	sendSynchronous,
	addListener,
};

addInterceptor('permissions', () => true);

addInterceptor('deleteCookies', cookies => {
	for (const { name } of cookies) {
		document.cookie = `${name}=null;expires=${Date.now()}; path=/;domain=reddit.com`;
	}
});

// The iframe hack doesn't work anymore, so Safari has no way to add urls to history
addInterceptor('addURLToHistory', () => {});

// XXX Not implemented; default to not visited to avoid potenial side-effects
addInterceptor('isURLVisited', () => false);

// Safari has no pageAction
addInterceptor('pageAction', () => {});
