/*global define*/

define([
    'dpo8core',
    'backbone',
], function (DPO, Backbone) {
    'use strict';

    /**
     * @class MainRouter
     * @extends Backbone.Router
     */
    var MainRouter = Backbone.Router.extend({
        stringifyMatrix: function stringifyMatrix(state, view) {
            var order = ['target', 'home', 'product', 'design', 'customize', 'print', 'ctx'],
                url = '/', //Backbone.history.root,
                m = [];
            for (var i = 0; i < order.length; i++) {
                var row = state[order[i]] || {},
                    array = [order[i]],
                    keys = Object.keys(row);

                for (var j = 0; j < keys.length; j++) {
                    var key = keys[j],
                        value = row[key];
                    if (value) {
                        array.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
                    }
                }

                if (array.length > 1) {
                    m.push(array.join(';'));
                }
            }
            m.push('view?' + view);
            url += m.join('/');
            return url;
        }
    });

    return MainRouter;
});