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
};