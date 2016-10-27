'use strict';

Modernizr.load({
    test: window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver,
    yep: '/scripts/l10n.js',
    nope: '/scripts/webL10n.js'
});

(function () {
    var location = document.location,
        path = location.pathname;

    if (navigator.languages && navigator.languages.length === 0) {
        navigator.languages = [navigator.language];
    }
})();