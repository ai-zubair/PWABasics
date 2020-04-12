module.exports = {
  "globDirectory": "public/",
  "globPatterns": [
    "**/*.{html,js,css,json}",
    "src/images/*.{png,jpg}"
  ],
  "globIgnores":[
    "../workbox-config.js",
    "help/**" 
  ],
  "swSrc":"public/sw-base.js",
  "swDest": "public/sw.js",
  // "runtimeCaching":[
  //   {
  //     "urlPattern":new RegExp(/.*(?:firebasestorage\.googleapis)\.com.*$/),
  //     "handler":"StaleWhileRevalidate",
  //     "options":{
  //       "cacheName":"firebasestorage"
  //     }
  //   },
  //   {
  //     "urlPattern":/.*(?:googleapis|gstatic)\.com.*$/,
  //     "handler":"StaleWhileRevalidate",
  //     "options":{
  //       "cacheName":"google-fonts"
  //     }
  //   },
  //   {
  //     "urlPattern":"https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css",
  //     "handler":"StaleWhileRevalidate",
  //     "options":{
  //       "cacheName":"mdl"
  //     }
  //   }
  // ]
};