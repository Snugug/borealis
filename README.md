# Borealis [![Build Status](https://travis-ci.org/Snugug/borealis.svg)](https://travis-ci.org/Snugug/borealis) [![Coverage Status](https://img.shields.io/coveralls/Snugug/borealis.svg)](https://coveralls.io/r/Snugug/borealis?branch=1.x.x) [![Code Climate](https://codeclimate.com/github/Snugug/borealis/badges/gpa.svg)](https://codeclimate.com/github/Snugug/borealis) [![Bower version](https://badge.fury.io/bo/borealis.svg)](https://github.com/Snugug/borealis/releases/latest)
### Image width based responsive images

By the end of 2013, the average web page served [1,030Kb of images](http://www.sitepoint.com/average-page-weights-increase-32-2013/), much to the chagrin of low bandwidth and pay-per-kilobyte users. The need to serve smaller images where appropriate, and to be able to control the scale and crop of images at all sizes, is imperative to creating a light weight and editorially rich web experiences. This is where [responsive images](http://responsiveimages.org/) come in. Unfortunately, we don't have a standard solution yet, and of those proposed, images will be swapped based on viewport information, not element information. Until we have a standard solution, you've got to pick your favorite hack.

Based on the blazing fast and light weight [eq.js](https://github.com/Snugug/eq.js), **borealis** provides a bare-bones image width based responsive image solution. Designed as a relatively easy to use drop-in solution to JavaScript powered responsive images, it weighs in at about 2.4KB minified, about 1.3KB gzipped, and requires no external dependencies. Simply drop **borealis** on to your site and set the `borealis-srcs` attribute to your image and you're ready to go!

## Installation

Installation is super easy. You can either pull down a copy from GitHub here, or you can install from [Bower](http://bower.io):

```bash
bower install borealis --save
```

Then, add either `borealis.js` or `borealis.min.js` to your HTML, and you're ready to rock!

## Usage

In order to use **borealis**, you need to both include `borealis.js` on your site and set up the `data-borealis-srcs` attribute on your desired image. `data-borealis-srcs` needs to be written in `key: value` pairs separated by a comma `,`, with the key being the `min-width` pixel width when you would like to swap out an image and the value being the URL to the image. The first item in `data-borealis-srcs` should not have a key and will be the default. In order to prevent extra image requests, [do not include the `src` attribute](http://wilto.github.io/srcn-polyfills/) in the image definition.

```html
<img data-borealis-srcs="/images/default.jpg, 300: /images/foo.jpg, 500: http://foo.com/bar.jpg, 900: http://qux.com/baz.jpg" alt="Responsive Images powered by Borealis!">
```

When **borealis** has determined what size your image is, it will add the appropriate image URL to the image's `src` attribute. If the image is smaller than the smallest size, the default will be loaded in. If you did not write your sizes in order, fear not, they will be sorted for you.

**borealis** also adds `borealis` to allow you to utilize **borealis** in your own function calls. It will handle your `onload` event and all `resize` events, querying your DOM to determine what nodes need to be queried each time. If you AJAX in any nodes that you would like to query, you need to trigger the query yourself. This is easy though! Just load up your nodes into an array or a NodeList and pass that to `borealis.query(nodes)`, and **borealis** will work its magic. `borealis.query()` also takes a callback as a second argument with optional `nodes` parameter (for the nodes that were worked on) that will be fired once all of the images have been processed.

In order to ensure that **borealis** is able to work its magic, when the DOM is loaded, all images with `data-borealis-srcs` will get `width: 100%; height: auto` styling applied to them. To apply these styles to images that aren't loaded on initial load, call `borealis.styleImages(nodes)`. This will ensure that images continue to grow so **borealis** can pick up on their width changes while ensuring their aspect ratios stay natural.

**borealis** neither does any image manipulation nor deals in multi-density image swapping (commonly *high-res* images). Instead, you need to cut your own images and size them appropriately. Instead of multi-density image swapping, you are encouraged to use [compressive images](http://filamentgroup.com/lab/rwd_img_compression/). To further reduce image file size, where appropriate, you should also serve [progressive jpegs](http://calendar.perfplanet.com/2012/progressive-jpegs-a-new-best-practice/). **borealis** does not lazy load images in as the best way to optimize resource loading is to [burst data transfer and return to idle](http://chimera.labs.oreilly.com/books/1230000000545/ch08.html#_burst_your_data_and_return_to_idle).

## Browser Support

**borealis** uses modern JavaScript, but can [supports older browsers as well](#a-note-on-ie8older-browser-support). It has been tested in the following browsers but is likely to support more:

* IE8+
* Firefox 3.5+
* Chrome
* Safari
* Opera 10.0+
* iOS Safari
* Opera Mini
* Android Browser
* Blackberry Browser
* Opera Mobile
* Chrome for Android
* Firefox for Android
* IE Mobile

### A note on IE8/Older Browser Support

There are three files provided: `borealis.min.js`, `borealis.polyfilled.min.js`, and `polyfills.min.js`. `borealis.polyfilled.min.js` includes the polyfills needed to run **borealis** in older browsers that are missing some newer JavaScript niceties (yes, this includes IE8+) and `polyfills.js` just includes the polyfills. While these allow for a drop-in solutions using just what's provided here, a better solution (and where a bunch of the polyfills come from), consider using something like a [polyfill service](https://github.com/Financial-Times/polyfill-service) for a more robust and well-rounded solution.

The specific polyfills included are as follows:

* [`Object.getPrototypeOf`](http://kangax.github.io/compat-table/es5/#Object.getPrototypeOf)
* [`window.requestAnimationFrame`](http://caniuse.com/#feat=requestanimationframe)
* [`Event.DOMContentLoaded`](http://caniuse.com/#feat=domcontentloaded)

## Technical Mumbo Jumbo

**borealis** has been tested in all modern browsers with thousands of images all requesting images. The limiting factor performance wise is JavaScript's native `offsetWidth` calculation, which is required for each element; hey, it's an element query after all! Browsers are also super slow at actually painting all of those images, so be aware. We work on reducing read/write layout thrashing by grouping reads separately from writes.

The process for determining which `src` to load is primarily greedy for the default, then greedy for the largest size. If the element is neither smaller than its smallest size nor larger than its largest state, it then traverses each size to determine which state is correct. It does this by comparing one size to the next size up, ensuring that the current size is both greater than or equal to the defined `min-width` value and less than the next size's `min-width`.

Performance wise, the script handles itself very well even with thousands of nodes. With this current test setup of around 2.2k nodes, it can parse all of the nodes, calculate the size, and apply the proper attributes in about 40ms. We're employing [requestAnimationFrame](http://www.html5rocks.com/en/tutorials/speed/animations/) to reduce layout thrashing and produce smooth layout and resize. **borealis** also comes with the full [requestAnimationFrame Polyfill](http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/) by Erik Möller and Paul Irish.

### tl;dr

`offsetWidth` and image painting are slow, `requestAnimationFrame` reduces layout thrashing, **borealis** is greedy for default then largest sizes, with great power comes great responsibility.
