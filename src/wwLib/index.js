import emitter from 'tiny-emitter/instance';
import services from './services/index.js';
import { useIconsStore } from '@/pinia/icons';

 /* wwFront:start */
// eslint-disable-next-line no-undef
import plugin_2bd1c688_31c5_443e_ae25_59aa5b6431fb from '@/components/plugins/plugin-2bd1c688-31c5-443e-ae25-59aa5b6431fb/src/wwPlugin.js';
import plugin_832d6f7a_42c3_43f1_a3ce_9a678272f811 from '@/components/plugins/plugin-832d6f7a-42c3-43f1-a3ce-9a678272f811/src/wwPlugin.js';
/* wwFront:end */

import { computed, reactive } from 'vue';

export default {
    ...services,
     $on(event, fn) {
        emitter.on(event, fn);
    },
    $once(event, fn) {
        emitter.once(event, fn);
    },
    $emit(event, ...args) {
        if (!event) {
            return;
        }
        emitter.emit(event, ...args);
    },
    $off(event, fn) {
        emitter.off(event, fn);
    },
     front: {},
    $focus: null,
    env: process.env.NODE_ENV,
    async initFront({ router, store }) {
 
        this.front.router = router;
        /* wwFront:start */
        this.$store = store;
        /* wwFront:end */

        //Init services
        this.wwLog.init();

 
        wwLib.logStore.verbose('Starting the application...');
        await this.wwWebsiteData.init();
        this.wwLang.init(router);

        /* wwFront:start */
        // eslint-disable-next-line no-undef
        wwLib.wwPluginHelper.registerPlugin('plugin-2bd1c688-31c5-443e-ae25-59aa5b6431fb', plugin_2bd1c688_31c5_443e_ae25_59aa5b6431fb);
wwLib.wwPluginHelper.registerPlugin('plugin-832d6f7a-42c3-43f1-a3ce-9a678272f811', plugin_832d6f7a_42c3_43f1_a3ce_9a678272f811);
        /* wwFront:end */

 
        services.scrollStore.start();
        services.keyboardEventStore.start();
    },
     // TODO: Verify with Alexis, still uses wwImageMultiLang
    getResponsiveStyleProp({ store, style, uid, states = [], prop }) {
        store = store || wwLib.getFrontWindow().wwLib.$store;
        if (!style && uid) {
            const wwObject = this.$store.getters['websiteData/getWwObjects'][uid];
            if (!wwObject) return '';
            style = (wwObject._state || {}).style || {};
        }

        const screenSizes = store.getters['front/getScreenSizes'];
        const screenSize = store.getters['front/getScreenSize'];

        let value = '';

        for (const media in screenSizes) {
            if (style[media] && typeof style[media][prop] !== 'undefined') {
                value = style[media][prop];
            }
            if (media === screenSize) {
                break;
            }
        }
        for (const state of states) {
            for (const media in screenSizes) {
                if (style[`${state}_${media}`] && style[`${state}_${media}`][prop]) {
                    value = style[`${state}_${media}`][prop];
                }
                if (media === screenSize) {
                    break;
                }
            }
        }

        return value;
    },
    globalContext: reactive({
        page: computed(() => {
            const page = wwLib.$store.getters['websiteData/getPage'];
            if (!page) return {};
            else if (!page.cmsDataSetPath) return { ...pageSanitizer(page) };
            return { ...pageSanitizer(page), data: wwLib.$store.getters['data/getPageCollectionData'] };
        }),
        pageParameters: computed(() => {
            const pageParameters = Object.values(wwLib.$store.getters['data/getPageParameterVariables']);
            const pageParametersValueMap = {};
            for (const pageParameter of pageParameters) pageParametersValueMap[pageParameter.id] = pageParameter.value;
            return pageParametersValueMap;
        }),
        pages: computed(() => {
            const pages = wwLib.$store.getters['websiteData/getPages'];
            const pagesValueMap = {};
            for (const page of pages) pagesValueMap[page.id] = pageSanitizer(page);
            return pagesValueMap;
        }),
        colors: computed(() => {
            const theme = wwLib.$store.getters['front/getTheme'];
             /* wwFront:start */
            // eslint-disable-next-line no-unreachable, no-undef
            return theme === 'dark' ? {} : {};
            /* wwFront:end */
        }),
        spacings:
         /* wwFront:start */
        // eslint-disable-next-line no-unreachable, no-undef
        {},
        /* wwFront:end */
        typographies:
         /* wwFront:start */
        // eslint-disable-next-line no-unreachable, no-undef
        {},
        /* wwFront:end */
        browser: computed(() => {
            const router = wwLib.manager ? wwLib.getEditorRouter() : wwLib.getFrontRouter();
            const currentRoute = router.currentRoute.value;
            let currentQueries = currentRoute.query;
             return {
                url: window.location.origin + currentRoute.fullPath,
                path: currentRoute.path,
                // verify if auth plugin
                 /* wwFront:start */
                // eslint-disable-next-line no-dupe-keys
                source: currentQueries._source,
                /* wwFront:end */
                query: currentQueries,
                domain: window.location.hostname,
                baseUrl: window.location.origin,
                breakpoint: wwLib.$store.getters['front/getScreenSize'],
                environment: wwLib.getEnvironment(),
                theme: wwLib.$store.getters['front/getTheme'],
            };
        }),
        screen: services.scrollStore.screen,
        componentPositionInfo: services.scrollStore.componentPositionInfo,
    }),

    pageData: computed(() => {
        const lang = wwLib.$store.getters['front/getLang'];
        const cmsDataSetPath = wwLib.$store.getters['websiteData/getPage'].cmsDataSetPath;
        if (!cmsDataSetPath) {
            return { lang };
        }

        return { lang, data: wwLib.$store.getters['data/getPageCollectionData'] };
    }),

    getEnvironment() {
        return wwLib.manager
            ? 'editor'
            : window.location.host.includes(
                  // TODO: add staging2 ?
                  '-staging.' + (process.env.WW_ENV === 'staging' ? import.meta.env.VITE_APP_PREVIEW_URL : '')
              )
            ? 'staging'
            : window.location.host.includes(import.meta.env.VITE_APP_PREVIEW_URL)
            ? 'preview'
            : 'production';
    },

    useBaseTag() {
        return (
            wwLib.getEnvironment() === 'production' &&
            window.wwg_designInfo.baseTag &&
            window.wwg_designInfo.baseTag.href
        );
    },

    getBaseTag() {
        let baseTag = window.wwg_designInfo.baseTag?.href || '';
        if (!baseTag.startsWith('/')) {
            baseTag = '/' + baseTag;
        }
        if (!baseTag.endsWith('/')) {
            baseTag += '/';
        }
        return baseTag;
    },

    /**
     * @PUBLIC_API
     */
    getFrontWindow() {
        if (document.querySelector('.ww-manager-iframe')) {
            return document.querySelector('.ww-manager-iframe').contentWindow;
        }
        return window;
    },

    /**
     * @PUBLIC_API
     */
    getFrontDocument() {
        return this.getFrontWindow().document;
    },

    /**
     * @PUBLIC_API
     */
    getFrontRouter() {
        return this.front.router;
    },

    /**
     * @PUBLIC_API
     */
    getEditorWindow() {
         // eslint-disable-next-line no-unreachable
        return null;
    },

    /**
     * @PUBLIC_API
     */
    getEditorDocument() {
         // eslint-disable-next-line no-unreachable
        return null;
    },

    /**
     * @PUBLIC_API
     */
    getEditorRouter() {
        return this.editor.router;
    },

    /**
     * @PUBLIC_API
     * @DEPRECATED wwLib.wwApp.goTo
     */
    goTo(...args) {
        wwLib.wwLog.warn('wwLib.goTo is DEPRECATED, use wwLib.wwApp.goTo instead');
        wwLib.wwApp.goTo(...args);
    },

    /**
     * @PUBLIC_API
     * @DEPRECATED wwLib.wwUtils.getStyleFromToken
     */
    getStyleFromToken(...args) {
        // wwLib.wwLog.warn('wwLib.getStyleFromToken is DEPRECATED, use wwLib.wwUtils.getStyleFromToken instead');
        return wwLib.wwUtils.getStyleFromToken(...args);
    },

    /**
     * @PUBLIC_API
     * @DEPRECATED wwLib.wwUtils.getTypoFromToken
     */
    getTypoFromToken(...args) {
        // wwLib.wwLog.warn('wwLib.getTypoFromToken is DEPRECATED, use wwLib.wwUtils.getTypoFromToken instead');
        return wwLib.wwUtils.getTypoFromToken(...args);
    },

    /**
     * @PUBLIC_API
     * @DEPRECATED
     */
    element(value) {
        wwLib.wwLog.warn('wwLib.element is DEPRECATED');
        if (typeof value === 'object') {
            return { isWwObject: true, ...value };
        } else {
            return { isWwObject: true, type: value };
        }
    },

    /**
     * @PUBLIC_API
     * @DEPRECATED wwLib.wwUtils.resolveObjectPropertyPath
     */
    resolveObjectPropertyPath(...args) {
        // wwLib.wwLog.warn(
        //     'wwLib.resolveObjectPropertyPath is DEPRECATED, use wwLib.wwUtils.resolveObjectPropertyPath instead'
        // );
        return wwLib.wwUtils.resolveObjectPropertyPath(...args);
    },

    /**
     * @PUBLIC_API
     * @DEPRECATED wwLib.wwutils.getTextStyleFromContent
     */
    getTextStyleFromContent(...args) {
        // wwLib.wwLog.warn(
        //     'wwLib.getTextStyleFromContent is DEPRECATED, use wwLib.wwUtils.getTextStyleFromContent instead'
        // );
        return wwLib.wwUtils.getTextStyleFromContent(...args);
    },

    /**
     * @PUBLIC_API
     * @DEPRECATED wwLib.wwWorkflow.executeGlobal
     */
    async executeWorkflow(...args) {
        wwLib.wwLog.warn('wwLib.executeWorkflow is DEPRECATED, use wwLib.wwWorkflow.executeGlobal instead');
        return wwLib.wwWorkflow.executeGlobal(...args);
    },

    /**
     * @PUBLIC_API
     * @EDITOR
     * @DEPRECATED wwLib.wwEditor.findParentUidByFlag
     */
    findParentUidByFlag(...args) {
        wwLib.wwLog.warn('wwLib.wwEditor.findParentUidByFlag is DEPRECATED, use wwLib.findParentUidByFlag instead');
        return wwLib.wwEditor.findParentUidByFlag(...args);
    },

    /**
     * @PUBLIC_API
     * @EDITOR
     * @DEPRECATED wwLib.wwEditor.selectParentByFlag
     */
    selectParentByFlag(...args) {
        wwLib.wwLog.warn('wwLib.wwEditor.selectParentByFlag is DEPRECATED, use wwLib.selectParentByFlag instead');
        return wwLib.wwEditor.selectParentByFlag(...args);
    },

    /**
     * @PUBLIC_API
     * @DEPRECATED wwLib.wwElement.useCreate
     */
    useCreateElement() {
        wwLib.wwLog.warn('wwLib.useCreateElement is DEPRECATED, use wwLib.wwElement.useCreate instead');
        return this.wwElement.useCreate();
    },

    /**
     * @PUBLIC_API
     * @DEPRECATED wwLib.wwElement.useLayoutStyle
     */
    useLayoutStyle() {
        wwLib.wwLog.warn('wwLib.useLayoutStyle is DEPRECATED, use wwLib.wwElement.useLayoutStyle instead');
        return wwLib.wwElement.useLayoutStyle();
    },

    /**
     * @PUBLIC_API
     */
    useIcons() {
        const store = useIconsStore();
        return {
            getIcon: store.getIcon,
        };
    },
};

function pageSanitizer(page) {
    const keysToInclude = [
        'id',
        'name',
        'folder',
        'metaImage',
        'pageLoaded',
        'paths',
        'langs',
        'meta',
        'title',
        'sections',
        'pageUserGroups',
    ];

    const _page = {};
    keysToInclude.forEach(key => {
        _page[key] = page[key];
    });

    _page.meta && delete _page.meta.__typename;
    for (const section of _page.sections || []) {
        delete section.__typename;
    }

    const lang = wwLib.$store.getters['front/getLang'];
    if (_page.paths) _page.path = _page.paths[lang] || _page.paths.default;
    else _page.path = null;

    _page.lang = lang;

    return _page;
}
