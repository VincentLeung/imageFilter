# imageFilter
Cordova plugin: image filter

This plugin provides some image filters (e.g. Anonymous face filter, Sepia tone filter).

This plugin defines a global `imageFilter` object, and a method `applyFilter`

```javascript
imageFilter.applyFilter(args, successCallBack, errorCallBack);
```
1. args is an object and it contains
  * `srcUrl` - url of the source image
  * filter object that contains name of the filter, and optional filter options.  E.g. `{name:'SepiaTone', intensity: 0.7}`

2. argument of successCallBack is url of the filtered image

## Example
```javascript
var heroImage = document.getElementById('heroImg');
var anonymousFaceFilter = {name:'AnonymousFaces'};
var args = {srcUrl: heroImage.src, filter: anonymousFaceFilter};
var successCallBack = function(filteredImageUrl){
  heroImage.src = filteredImageUrl;
};
var errorCallBack = function() {
  console.log("something wrong");
};

imageFilter.applyFilter(args, successCallBack, errorCallBack);
```

## Installation
```javascript
cordova plugin add kimberley-plugin-imagefilter
```

# Supporting platform
* iOS

# Coming soon ...
* More filters
* Other platform like Android
