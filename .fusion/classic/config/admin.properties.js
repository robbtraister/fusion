;(function (root) {
    var contextPath = window.location.pathname.substring(0, window.location.pathname.indexOf("/",2));
    /** This is a horrible hack, but exists to support running PageBuilder at any
     * context path.  If PageBuilder is running on the root context, the first
     * subfolder in location.window is "/admin", so reset the contextPath to the root.
     */
    contextPath = (contextPath === "/admin") ? contextPath = "" : contextPath;

    var angular = window.angular;
    var devices = [
        { name: "Your Browser",  width: '',    height: '' },
        { name: "iPhone 6",        width:  375,    height:  667, rotate : true },
        { name: "iPhone 6+",        width:  414,    height:  736, rotate : true },
        { name: "Galaxy S3",     width:  320,    height:  499, rotate : true },
        { name: "Galaxy Note 2", width:  360,    height:  567, rotate : true },
        { name: "Nexus 4",       width:  384,    height:  519, rotate : true },
        { name: "Nexus 7",       width:  600,    height:  794, rotate : true },
        { name: "Kindle Fire",   width:  600,   height: 1024, rotate : true },
        { name: "iPad",          width:  768,    height:  927, rotate : true },
        { name: "PC (720p) ",     width: 1280,    height:  720 },
        { name: "PC (1080p)",    width: 1920,    height: 1080 },
        { name: "Future (4K)",   width: 3840,    height: 2160 },
        { name: "Custom ",       variableWidth: true,    variableHeight: true }
    ];

    root.adminConfig =  {
        contextPath        : contextPath,
        templatePath       : contextPath + '/admin/app/edit/directives/custom-field/templates',
        adminComponentsPath: contextPath + '/admin/app/admin-resources/js/components',
        defaultChainWrapper    : "default-chain",
        featureSelector    : ".pb-feature",
        layoutItemSelector:  ".pb-layout-item",
        pbRootSelector     : "#pb-root",
        requiredMetaFields : ['title'],
        lockedMetaFields   : [],
        hiddenMetaFields   : [],
        siteService: false,
        devices            : devices,
        pluginDebug: 'v10.5', //new Date().getTime() for debug
        orgId: 'pbFusion',
        orgName: 'PB Fusion',
        adminHeartbeat: '',
        advancedMode: false,
        multiUser: true,
        useStage: true,
        forFusion: true
    };
    if(angular){
        angular.module('pb.adminConfig').constant('adminConfig', root.adminConfig);
    }
}(window));
