/*global requirejs*/
'use strict';

requirejs.config({
    paths: {
        jquery: '/bower_components/jquery/dist/jquery',
        backbone: '/bower_components/backbone/backbone',
        underscore: '/bower_components/underscore/underscore',
        Snap: '/bower_components/Snap.svg/dist/snap.svg',
        opentype: '/bower_components/opentype.js/dist/opentype',
        mousetrap: '/bower_components/mousetrap/mousetrap',
        StackTrace: '/bower_components/stacktrace-js/dist/stacktrace-with-promises-and-json-polyfills',
        uaParser: '/bower_components/ua-parser-js/dist/ua-parser.min',
        dpo8core: '/scripts/dpo.core',
        templates: '/scripts/templates',
        html5sortable: '/bower_components/html5sortable/jquery.sortable',
        screenFull: '/scripts/screenfull',
        'select2': '/bower_components/select2/dist/js/select2.full',
        dragdealer: '/bower_components/skidding--dragdealer/src/dragdealer',
        'jquery-inputmask': '/bower_components/jquery.inputmask/dist/jquery.inputmask.bundle',
        'jquery-file-download': '/bower_components/jquery-file-download/src/Scripts/jquery.fileDownload',
        moment: '/bower_components/moment/min/moment-with-locales.min',
        draggabilly: '/bower_components/draggabilly/dist/draggabilly.pkgd',
        'cryptojs.core': '/bower_components/cryptojslib/components/core',
        'cryptojs.cipher-core': '/bower_components/cryptojslib/components/cipher-core',
        'cryptojs.aes': '/bower_components/cryptojslib/components/aes',
        'cryptojs.base64': '/bower_components/cryptojslib/components/enc-base64'
    },
    wrapShim: true,
    shim: {
        'cryptojs.core': {
            exports: 'CryptoJS'
        },
        'cryptojs.cipher-core': {
            deps: ['cryptojs.core'],
            exports: 'CryptoJS'
        },
        'cryptojs.aes': {
            deps: ['cryptojs.cipher-core'],
            exports: 'CryptoJS'
        },
        'cryptojs.base64': {
            deps: ['cryptojs.core'],
            exports: 'CryptoJS'
        },

        opentype: {},
        html5sortable: {
            deps: ['jquery']
        },
        'jquery-file-download': {
            deps: ['jquery']
        },
        StackTrace: {
            exports: 'StackTrace'
        },
        uaParser: {
            exports: 'uaParser'
        },
        dragdealer: {
            deps: ['jquery']
        }
    },
    baseUrl: '/scripts'
});

requirejs([
    'dpo8core',
    'jquery',
    'underscore',
    'moment',
    'StackTrace',
    'uaParser',
    'Localizer',
    'MainRouter',
    'jquery-file-download'
], function (DPO, $, _, moment, StackTrace, uaParser, Localizer, MainRouter) {
    window.DPO = window.DPO || DPO;
    window.StackTrace = window.StackTrace || StackTrace;

    var browserInfo = (new uaParser()).getResult();

    function sid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    }

    DPO.def('Application', function () {
        /**
         *
         * @class DPO.Application
         * @memberof DPO
         * @property {DPO.render.DeviceColorSpace} colorSpace
         * @property {DPO.bll.Context} context
         * @property {DPO.text.FontMetrics} availableFonts
         * @property {DPO.fc.Configuration} flowConfig
         * @property {DPO.text.UnitConverter} converter
         * @property {DPO.text.LayoutManager} layoutManager
         * @property (DPO.dal.DAL) endpoint
         * @property {MainRouter} mainRoute
         * @property (number) scrollBarWidth
         * @property (number) scrollBarWidth
         * @constructor
         */
        function Application() {
            var me = this,
                versionEl = $('meta[name=dpo-version]');

            me.sid = sid();
            me.version = versionEl.prop('content');
            me.resetObservable();
            me.scrollBarWidth = me.getScrollBarWidth();
            me.onBeforeUnload = me.onBeforeUnload.bind(me);
            // me.analyticsChain = new AnalyticsActionChain();
            me.processLocation();
            DPO.bll.HttpProjectStorage.prototype.loadingImgURL = '/images/loading.svg';
        }

        DPO.mixin(Application.prototype, DPO.mixins.Observable);
        DPO.mixin(Application.prototype, {
            endpointsMap: {
                USP: 'http://dpo.print.avery.com/dpo8/rest/',
                USPP: 'http://beta.ec2.avery.com/dpo8/rest/',
                UST: 'http://dpotest.print.avery.com/dpo8/rest/',
                EUT: 'http://test.print.avery.com/dpo8/rest/',
                EUP: 'http://secure.print.avery.com/dpo8/rest/',
                DEV: 'http://abele.avery.com/dpo8/rest/',
                LOCAL: 'http://local.avery.com/dpo8/rest/'
            },

            //TODO Change to public service host
            // loggingURL: 'http://localhost:8080/log',
            loggingURL: 'http://log.ec2.avery.com/log',

            getScrollBarWidth: function getScrollBarWidth() {
                var inner = document.createElement('p');
                inner.style.width = '100%';
                inner.style.height = '200px';

                var outer = document.createElement('div');
                outer.style.position = 'absolute';
                outer.style.top = '0px';
                outer.style.left = '0px';
                outer.style.visibility = 'hidden';
                outer.style.width = '200px';
                outer.style.height = '150px';
                outer.style.overflow = 'hidden';
                outer.appendChild(inner);

                document.body.appendChild(outer);
                var w1 = inner.offsetWidth;
                outer.style.overflow = 'scroll';
                var w2 = inner.offsetWidth;

                if (w1 === w2) {
                    w2 = outer.clientWidth;
                }

                document.body.removeChild(outer);

                return (w1 - w2);
            },

            getStaticContentLink: function getHelpLink() {
                var docRootEl = $('meta[name=dpo-doc-root]'),
                    docRoot = docRootEl.prop('content'),
                    docLocalesEl = $('meta[name=dpo-doc-locales]'),
                    docLocales = docLocalesEl.prop('content'),
                    locales = docLocales.split(','),
                    code = 'en-US';
                if (document.webL10n) {
                    code = document.webL10n.getLanguage();
                }

                if (navigator.mozL10n) {
                    code = navigator.mozL10n.language.code;
                }

                var path = 'en-US';
                for (var i = 0; i < locales.length; i++) {
                    var c1 = locales[i].trim();
                    if (c1.toUpperCase() === code.toUpperCase()) {
                        path = c1;
                    }
                }

                var location = document.location;
                path = location.protocol + '//' + location.host + '/' + docRoot + path + '/';

                return path;
            },

            getLocalizationTextForKey: function getLocalizationTextForKey(key) {
                var msg;
                if (document.webL10n) {
                    msg = document.webL10n.get(key);
                }
                if (navigator.mozL10n) {
                    msg = navigator.mozL10n.get(key);
                }
                return msg;
            },

            processLocation: function processLocation() {
                var me = this,
                    isNode = (typeof process !== 'undefined'),
                    location = document.location,
                    path = location.pathname,
                    regexp = /\/target;(.+?)\//,
                    res = regexp.exec(path),
                    target, ep;
                if (isNode) {
                    target = 'US_en';
                } else {
                    target = res[1].match(/name=([a-zA-z_]+)/)[1];
                    ep = res[1].match(/ep=([a-zA-z_]+)/)[1];
                    ep = ep.toUpperCase();
                    ep = me.endpointsMap[ep] ? ep : 'DEV';
                    me.ep = ep;
                }

                if (location.port - 0 < 9000) {
                    me.addBeforeUploadListener();
                }

                var url = me.endpointsMap[me.ep].replace(/^https?:/, document.location.protocol);
                me._target = target;
                me._endpoint = new DPO.dal.DAL(url, target);

                // TODO: Uncomment to enable request logging
                DPO.resetAspect(DPO.dal.Request.prototype);
                DPO.applyAspect({
                    send: {
                        scope: me,
                        before: me.beforeRequestSend
                    }
                }, DPO.dal.Request.prototype);

                var cls = target + ' ' + (window.navigator.standalone ? ' black-translucent' : '');
                $('body').addClass(cls);
            },

            beforeRequestSend: function beforeRequestSend(ctx) {
                var me = this;
                var target = ctx.target;

                function parseResponse(json) {
                    try {
                        var obj = JSON.parse(json);
                        return {
                            obj: obj,
                            error: null
                        };
                    } catch (e) {
                        return {
                            obj: null,
                            error: e
                        };
                    }
                }

                function errorHandler() {
                    var status = target.xhr.status,
                        code = status - (status % 100),
                        contentType = target.xhr.getResponseHeader('Content-Type') || '',
                        mimeType = contentType.split(';')[0],
                        obj, parseResult = {};

                    if (code === 200) {
                        return;
                    }

                    switch (mimeType) {
                        case 'application/json':
                            parseResult = parseResponse(target.xhr.responseText);
                            obj = parseResult.obj;
                            break;
                        default:
                            obj = target.xhr.response;
                            break;
                    }

                    var errorInfo = {
                        request: {},
                        metrics: {},
                        response: {
                            status: target.xhr.status,
                            statusText: target.xhr.statusText,
                            responseData: {}
                        }
                    };

                    target.metrics.elapsedTime = new Date() - target.metrics.startTime;
                    DPO.mixin(errorInfo.request, target);
                    delete errorInfo.request.metrics;
                    DPO.mixin(errorInfo.metrics, target.metrics);
                    DPO.mixin(errorInfo.response.responseData, obj);

                    switch (code) {
                        case 400:
                            me.logError(errorInfo, null, 'Client error: in ' + target.buildURL());
                            break;
                        case 500:
                            me.logError(errorInfo, null, 'Server error: in ' + target.buildURL());
                            break;
                    }
                }

                target.metrics = {
                    startTime: new Date() - 0,
                    errTime: (new Date()) - 0
                };
                target.listen({
                    'error': errorHandler,
                    'load': errorHandler
                });
            },

            parseState: function (url) {
                url = url || location.href;

                var me = this,
                    root = location.protocol + '//' + location.host,
                    route = me._routeToRegExp('*path'),
                    fragment = url.slice(root.length - 1),
                    params = me._extractParameters(route, fragment);
                return params;
            },

            generateLogInfo: function generateLogInfo() {
                var logInfo = {
                    sid: this.sid,
                    version: this.version,
                    browserInfo: browserInfo,
                    matrix: {},
                    request: {},
                    metrics: {
                        errTime: (new Date()) - 0
                    },
                    error: {}
                };

                var stateArr = this.parseState();
                var state = stateArr[0];
                var view = stateArr[1];

                DPO.mixin(logInfo.matrix, state);
                logInfo.matrix.view = view;
                logInfo.matrix.url = document.location.href;

                //At this moment we have all params from matrix URL
                return logInfo;
            },


            addBeforeUploadListener: function addBeforeUploadListener() {
                window.addEventListener('beforeunload', this.onBeforeUnload);
            },

            removeBeforeUploadListener: function removeBeforeUploadListener() {
                window.removeEventListener('beforeunload', this.onBeforeUnload);
            },

            onBeforeUnload: function onBeforeUnload(event) {
                var msg = this.getLocalizationTextForKey('page-unload-msg-text');
                if (typeof event === 'undefined') {
                    event = window.event;
                }

                if (event) {
                    event.returnValue = msg;
                }
                return msg;
            },

            downloadByUrl: function downloadByUrl(url) {
                // Back-end part support additional query parameter "attachment"
                // In case of true HTTP server will add Content-Disposition header to response
                // This feature allows file download without opening embedded plugins
                if (url.indexOf('.pdf') !== -1) {
                    if (url.indexOf('?') === -1) {
                        url += '?attachment=true';
                    } else {
                        url += '&attachment=true';
                    }
                }

                $.fileDownload(url);
            },

            /**
             * Handle fallback font loading
             * @memberof DPO.Application#
             */
            onFallbackFontLoaded: function onFallbackFontLoaded() {
                this.layoutManager.resetObservable();
                this.launch();
            },

            applyMerge: function (dest, src) {
                function getItemById(id) {
                    if (!id) {
                        return null;
                    }

                    for (var i = 0; i < dest.items.length; i++) {
                        if (dest.items[i].id === id) {
                            return dest.items[i];
                        }
                    }

                    return null;
                }

                for (var i = 0; i < src.items.length; i++) {
                    var s = src.items[i],
                        d = getItemById(s.id);
                    if (d != null) {
                        var index = dest.items.indexOf(d);
                        dest.items[index] = s;
                    } else {
                        dest.items.push(s);
                    }
                }
            },

            applyRemove: function (dest, src) {
                function getItemById(id) {
                    if (!id) {
                        return null;
                    }

                    for (var i = 0; i < dest.items.length; i++) {
                        if (dest.items[i].id === id) {
                            return dest.items[i];
                        }
                    }

                    return null;
                }

                function getItemByValue(value) {
                    for (var i = 0; i < dest.items.length; i++) {
                        if (dest.items[i].value === value) {
                            return dest.items[i];
                        }
                    }

                    return null;
                }

                for (var i = 0; i < src.items.length; i++) {
                    var s = src.items[i],
                        d = getItemById(s.id);
                    if (d == null && s.value) {
                        d = getItemByValue(s.value);
                    }

                    if (d != null) {
                        var index = dest.items.indexOf(d);
                        dest.items.splice(index, 1);
                    }
                }
            },

            /**
             * Handle flow configuration
             * @memberof DPO.Application#
             */
            onFlowConfigFetched: function onFlowConfigFetched(fc) {
                var me = this;
                var fonts = fc.fonts.getAll();

                me._availableFonts = DPO.text.DefaultMetrics.createSubset(fonts);

                if (!me.layoutManager) {
                    var fontsURL = fc.getResourceURL('dpo8-fonts');
                    if (fontsURL[fontsURL.length - 1] !== '/') {
                        fontsURL += '/';
                    }

                    DPO.text.DefaultMetrics.defineFontFaces(document, fontsURL);
                    me._layoutManager = new DPO.text.LayoutManager(fontsURL, DPO.text.DefaultMetrics, {
                        layoutMap: {
                            'shrinkwrap': DPO.text.ShrinkWrapLayout,
                            'wrapshrink': DPO.text.WrapShrinkLayout,
                            'wrap': DPO.text.WrapShrinkLayout,
                            'shrink': DPO.text.ShrinkWrapLayout,
                            'fit': DPO.text.WrapShrinkLayout
                        }
                    });
                    me._context = new DPO.bll.Context(null, me.layoutManager, null, null, null, me.endpoint);
                    me._layoutManager.on('fonts:loaded', me.onFallbackFontLoaded, me);
                    me._layoutManager.loadFontMap({});
                }

                var url = fc.getResourceURL('dpo8-color-transform'),
                    colorSpace = null;
                if (url) {
                    colorSpace = new DPO.render.DeviceColorSpace(url);
                }

                me.colorSpace = colorSpace;
                me._context.colorSpace = colorSpace;
                me._context.flowConfig = fc;
                me._flowConfig = fc;
                me._converter = new DPO.text.UnitConverter(fc.locale);
                me.fire('changed:flow-config', [me, fc]);
                me.launch();
            },

            /**
             * Handle error callbacks
             * @memberof DPO.Application#
             */
            onFail: function onFail() {
                console.log(arguments);
            },

            handleGlobalErrors: function (app) {
                var me = app;

                window.onerror = function globalErrorLogger(msg, file, line, col, error) {
                    if (typeof error === "string") {
                        StackTrace.generateArtificially({
                            filter: function (frame) {
                                return !!frame.functionName;
                            }
                        }).then(function (stackFrames) {
                            me.logError({}, stackFrames, msg);
                        }).catch(function (e) {
                            console.error(e);
                        });
                    } else {
                        StackTrace.fromError(error).then(function (stackFrames) {
                            me.logError({}, stackFrames, msg);
                        }).catch(function (e) {
                            console.error(e);
                        });
                    }

                    return true;
                };
            },

            /**
             * Launches application if possible
             * @memberof DPO.Application#
             */
            launch: function launch() {
                var me = this,
                    l10nReady = navigator.mozL10n && navigator.mozL10n.readyState === 'complete',
                    canLaunch = false;
                l10nReady = l10nReady || document.webL10n && document.webL10n.getReadyState() === 'complete';
                canLaunch = canLaunch && me.layoutManager && me.layoutManager.fallbackFont;
                canLaunch = canLaunch && me.flowConfig;
                canLaunch = canLaunch && l10nReady;
                canLaunch = canLaunch && me.wadl !== undefined;

                if (canLaunch) {
                    this.handleGlobalErrors(me);

                    me.staticContentLink = me.getStaticContentLink();
                    // me.mainRoute = new MainRouter();

                    var params = me.parseState()[0];

                    if (params.target.lm && !me.localizer) {
                        $(document.body).addClass('l10n-mode');
                        me.localizer = new Localizer(window, DPO.app);
                        me.localizer.start();
                    }

                    return;
                }

                if (!l10nReady) {
                    setTimeout(me.launch.bind(me), 100);
                }
            },

            /**
             * Updates flow configuration
             * @memberof DPO.Application#
             * @param {string|object} [productOrParams]
             * @param {bool} [force]
             */
            updateFlowConfig: function updateFlowConfig(productOrParams, force) {
                var me = this,
                    params = {};
                if (productOrParams) {
                    params = typeof productOrParams === 'object' ? productOrParams : {
                        productId: productOrParams
                    };
                }

                if (_.isEqual(params, me.currentFlowParams) && !force) {
                    return;
                }

                me.currentFlowParams = params;
                me.endpoint.fetchFlowConfiguration(params, me.onFlowConfigFetched, me.onFail, me);
            },

            loadWADL: function fetchWADL() {
                var me = this;

                function Loaded(response) {
                    me.wadl = response;

                    var results = DPO.dal.Versions.check(me.endpoint, me.wadl, true);
                    for (var i = 0; i < results.missing.length; i++) {
                        var info = results.missing[i];
                        console.warn('Method ' + info.url + ' is not supported. DAL.' + info.prop + ' was disabled');
                    }

                    me.launch();
                }

                function Failed() {
                    console.warn('Failed to load WADL');
                    me.wadl = null;
                    me.launch();
                }

                me.endpoint.fetchWADL(Loaded, Failed, me);
            },

            /**
             * Starts DPO8 Application
             * @memberof DPO.Application#
             */
            start: function start() {
                var me = this;
                me.loadWADL();
                me.updateFlowConfig();

                if (navigator.mozL10n) {
                    navigator.mozL10n.once(me.launch.bind(me));
                }
            },

            /**
             * Creates project flow for current project context
             * @memberof DPO.Application#
             * @returns {DPO.bll.ProjectFlow}
             */
            createProjectFlow: function createProjectFlow() {
                var ctx = this.context,
                    flow = new DPO.bll.ProjectFlow(this.endpoint);
                flow.project = ctx.project;
                flow.projectData = ctx.projectData;
                flow.provider = ctx.provider;
                flow.storage = ctx.storage;
                return flow;
            },

            logError: function logError(errorInfo, stackframes, errorMsg) {
                var me = this;
                var req = new XMLHttpRequest();

                var log = DPO.mixin(me.generateLogInfo(), errorInfo);

                if (stackframes) {
                    log.error = {
                        message: errorMsg,
                        stack: stackframes
                    }
                }

                log.errorName = errorMsg;

                req.open('post', me.loggingURL);
                req.setRequestHeader('Content-Type', 'application/json');

                req.send(JSON.stringify(log));
            },

            isIE10: function isIE10() {
                return Function('/*@cc_on return document.documentMode===10@*/')(); // jshint ignore:line
            },

            detectIE: function detectIE(useragent) {
                return /(msie|trident |rv:).?(10|11\.\d)/i.test(useragent);
            },

            storeAppStateToProject: function storeAppStateToProject() {
                var ctx = DPO.app.context,
                    project = ctx.project,
                    pt = ctx.projectTransformer;
                pt.setHintValue(project, 'dpo8-app-state', JSON.stringify(ctx.state));
            }
        });

        Object.defineProperty(Application.prototype, 'target', {
            get: function get() {
                return this._target;
            }
        });

        Object.defineProperty(Application.prototype, 'endpoint', {
            get: function get() {
                return this._endpoint;
            }
        });

        Object.defineProperty(Application.prototype, 'availableFonts', {
            get: function get() {
                return this._availableFonts;
            }
        });

        Object.defineProperty(Application.prototype, 'flowConfig', {
            get: function get() {
                return this._flowConfig;
            }
        });

        Object.defineProperty(Application.prototype, 'converter', {
            get: function get() {
                return this._converter;
            }
        });

        Object.defineProperty(Application.prototype, 'layoutManager', {
            get: function get() {
                return this._layoutManager;
            }
        });

        Object.defineProperty(Application.prototype, 'context', {
            get: function get() {
                return this._context;
            },

            /**
             * @param {DPO.bll.Context} value
             */
            set: function set(value) {
                var me = this;
                if (me._context === value) {
                    return;
                }

                var projectData = value.projectData || {},
                    project = value.project || {};

                // Initialize internal context state
                var state = {
                    userChoices: {
                        backSideViewed: false,
                        backSideChosen: false,
                        addSheetApproved: false
                    },
                    ghsWizard: {
                        casNumberFound: true
                    },
                    projectSaveStatus: {
                        savedToComputer: false
                    }
                };

                if (value.project) {
                    var stateJSON = value.projectTransformer.getHintValue(value.project, 'dpo8-app-state'),
                        sheet = value.selector.selectSheets()[0],
                        obj = null;
                    state.userChoices.backSideViewed = !!projectData.id || sheet.back == null;
                    state.userChoices.backSideChosen = !!projectData.id || project.designTheme === 'Blank' || sheet.back == null;
                    try {
                        obj = JSON.parse(stateJSON);
                        state.userChoices = DPO.mixin(state.userChoices, obj.userChoices);
                        state.ghsWizard = DPO.mixin(state.ghsWizard, obj.ghsWizard);
                        state.projectSaveStatus = DPO.mixin(state.projectSaveStatus, obj.projectSaveStatus);
                    } catch (e) {
                        DPO.emptyFn(e);
                    }
                }

                value.state = state;

                me._context = value;

                var flowParams = {},
                    pd = value.projectData || {},
                    product = pd.product || {};
                if (product) {
                    flowParams.productId = product.id;
                }

                if (value.project && value.project.designCategory) {
                    flowParams.designCategory = value.project.designCategory;
                }

                if (value.project && value.project.designTheme) {
                    flowParams.designTheme = value.project.designTheme;
                }
                me.updateFlowConfig(flowParams);
                me.fire('changed:context', [me, value]);
            }
        });

        return Application;
    });

    $(function () {
        DPO.app = new DPO.Application();
        DPO.app.start();
    });
});