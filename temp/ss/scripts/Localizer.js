define(['dpo8core'], function (DPO) {
    'use strict';

    function Localizer(parentWindow, app) {
        this.parentWindow = parentWindow;
        this.app = app;
        this.l10n = this.parentWindow.navigator.mozL10n;
        this.languageCode = this.parentWindow.navigator.mozL10n.language.code;
    }

    DPO.mixin(Localizer.prototype, {
        onClearLogClick: function () {
            var me = this,
                logger = me.wnd.document.getElementById('log');
            logger.innerHTML = '';
        },

        onRefreshClick: function () {
            var me = this,
                doc = this.wnd.document,
                el = doc.getElementById('spreadsheet-id'),
                spreadsheetId = el.value,
                locale = this.l10n.ctx.getLocale(this.languageCode);

            var url = 'https://spreadsheets.google.com/feeds/cells/';
            url += spreadsheetId;
            url += '/1/public/values?alt=json-in-script&callback=?';

            var keyMap = {},
                locMap = {};

            $.getJSON(url).success(function (data) {
                var entries = data.feed.entry;
                for (var i = 1; i < entries.length; i++) {
                    var e = entries[i],
                        col = e['gs$cell'].col - 0,
                        row = e['gs$cell'].row - 0,
                        value = e.content['$t'],
                        key;
                    switch (col) {
                        case 1:
                            keyMap[row] = value;
                            break;
                        case 2:
                            key = keyMap[row];
                            if (key && locale.entries[key]) {
                                locale.entries[key] = value;
                            }
                            locMap[key] = value;
                            break;
                    }
                }
            }).error(function (message) {
                console.error('error' + message);
            }).complete(function () {
                var body = me.parentWindow.document.getElementsByTagName('body')[0];
                me.l10n.translateFragment(body);
            });
        },

        lastRuleIndex: undefined,
        lastEl: undefined,

        onMouseOver: function onMouseOver(e) {
            var me = this,
                target = $(e.target),
                key = target.data('l10n-id'),
                doc = me.parentWindow.document,
                sheet = doc.styleSheets[0];
            if (me.lastRuleIndex !== undefined) {
                sheet.deleteRule(me.lastRuleIndex);
                me.lastRuleIndex = undefined;
            }

            if (me.lastEl !== undefined) {
                me.lastEl.removeClass('display-l10n-key');
                me.lastEl = undefined;
            }

            if (key) {
                var l10n = me.l10n.getAttributes(e.target);

                if (!l10n.id) {
                    return false;
                }

                var entity = me.l10n.ctx.getEntity(l10n.id, l10n.args);
                console.log(entity);

                var el = me.wnd.document.createElement('div'),
                    logger = me.wnd.document.getElementById('log'),
                    text = '';
                if (typeof entity === 'string') {
                    text = 'key: ' + key + ' (' + me.l10n.get(key) + ');';
                } else {
                    var argsKeys = Object.keys(entity.attrs || {});
                    for (var i = 0; i < argsKeys.length; i++) {
                        var k = argsKeys[i],
                            v = entity.attrs[k];
                        text += 'key: ' + key + '.' + k + ' (' + v + ');';
                    }
                }

                el.textContent = text;
                logger.appendChild(el);

                // sheet.insertRule('.display-l10n-key::after { content: "' + key + '"; position: absolute; left: 0; top: 100%}', 1);
                // me.lastEl = target;
                // me.lastEl.addClass('display-l10n-key');
                // me.lastRuleIndex = 1;
            }
        },

        start: function start() {
            var me = this;
            me.wnd = me.parentWindow.open('/dpo8/content/localizer.html', '_blank', 'width=300, height=600');
            $(me.wnd).load(function () {
                var doc = me.wnd.document,
                    button = doc.getElementById('refresh-l10n');
                button.addEventListener('click', me.onRefreshClick.bind(me));

                button = doc.getElementById('clear-log');
                button.addEventListener('click', me.onClearLogClick.bind(me));

                me.parentWindow.document.addEventListener('mouseover', me.onMouseOver.bind(me));
            });

            me.parentWindow.addEventListener('beforeunload', function () {
                me.stop();
            }, false);
        },

        stop: function () {
            var me = this;
            if (me.wnd) {
                me.wnd.close();
            }
            me.wnd = null;
            me.doc = null;
        }
    });

    return Localizer;
});