module.exports = {
  "globDirectory": "public/",
  "globPatterns": [
    "**/*.{html,js,css,json}",
    "src/images/*.{png,jpg}"
  ],
  "swDest": "public/sw.js",
  "globIgnores":[
    "../workbox-config.js",
    "help/**" 
  ]
};