const assets = function(){
    const APP_SHELL_CACHE = 'appShell-v19'
    const DYNAMIC_CACHE = 'dynamicData';
    const STATIC_ASSETS = [
        '/',
        '/index.html',
        '/offline.html',
        '/src/js/idb.js',
        '/utils/iDButils.js',
        '/src/js/app.js',
        '/src/js/feed.js',
        '/src/js/material.min.js',
        '/src/css/app.css',
        '/src/css/feed.css',
        '/src/images/main-image.jpg',
        'https://fonts.googleapis.com/css?family=Roboto:400,700',
        'https://fonts.googleapis.com/icon?family=Material+Icons',
        'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
    ];

    const NTC_ASSETS = ['https://pwabasics-199ce.firebaseio.com/posts.json']
    return {
        APP_SHELL_CACHE,
        DYNAMIC_CACHE,
        STATIC_ASSETS,
        NTC_ASSETS
    }
}();