// @ts-check
/** @typedef {import("../typings").HtmlTagObject} HtmlTagObject */
/**
 * @file
 * This file provides to helper to create html as a object representation as
 * those objects are easier to modify than pure string representations
 *
 * Usage:
 * ```
 * const element = createHtmlTagObject('h1', {class: 'demo'}, 'Hello World');
 * const html = htmlTagObjectToString(element);
 * console.log(html) // -> <h1 class="demo">Hello World</h1>
 * ```
 */

/**
 * All html tag elements which must not contain innerHTML
 * @see https://www.w3.org/TR/html5/syntax.html#void-elements
 */
const voidTags = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr'];

/**
 * Turn a tag definition into a html string
 * @param {HtmlTagObject} tagDefinition
 *  A tag element according to the htmlWebpackPlugin object notation
 *
 * @param xhtml {boolean}
 *   Wether the generated html should add closing slashes to be xhtml compliant
 */
function htmlTagObjectToString (tagDefinition, xhtml) {
  const attributes = Object.keys(tagDefinition.attributes || {})
    .filter(function (attributeName) {
      return tagDefinition.attributes[attributeName] !== false;
    })
    .map(function (attributeName) {
      if (tagDefinition.attributes[attributeName] === true) {
        return xhtml ? attributeName + '="' + attributeName + '"' : attributeName;
      }
      return attributeName + '="' + tagDefinition.attributes[attributeName] + '"';
    });
  return '<' + [tagDefinition.tagName].concat(attributes).join(' ') + (tagDefinition.voidTag && xhtml ? '/' : '') + '>' +
    (tagDefinition.innerHTML || '') +
    (tagDefinition.voidTag ? '' : '</' + tagDefinition.tagName + '>');
}

/**
 * Static helper to create a tag object to be get injected into the dom
 *
 * @param {string} tagName
 * the name of the tag e.g. 'div'
 *
 * @param {{[attributeName: string]: string|boolean}} [attributes]
 * tag attributes e.g. `{ 'class': 'example', disabled: true }`
 *
 * @param {string} [innerHTML]
 *
 * @returns {HtmlTagObject}
 */
function createHtmlTagObject (tagName, attributes, innerHTML) {
  return {
    tagName: tagName,
    voidTag: voidTags.indexOf(tagName) !== -1,
    attributes: attributes || {},
    innerHTML: innerHTML
  };
}

/**
 * The `HtmlTagArray Array with a custom `.toString()` method.
 *
 * This allows the following:
 * ```
 *   const tags = HtmlTagArray.from([tag1, tag2]);
 *   const scriptTags = tags.filter((tag) => tag.tagName === 'script');
 *   const html = scriptTags.toString();
 * ```
 *
 * Or inside a string literal:
 * ```
 *   const tags = HtmlTagArray.from([tag1, tag2]);
 *   const html = `<html><body>${tags.filter((tag) => tag.tagName === 'script')}</body></html>`;
 * ```
 *
 */
class HtmlTagArray extends Array {
  toString () {
    return this.join('');
  }
}

function createAsyncLoaders(window, document, baseAssetTags){
  var voidTags = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr'];
  function setAttributes(node, attributes){
    var keys = Object.keys(attributes);
    for(var i = 0; i <  keys.length; i++){
      var attribute = document.createAttribute(keys[i])
      attribute.value = attributes[keys[i]];
      node.attributes.setNamedItem(attribute);
    }
  }
  var loader = function(){
    var alreadyLoaded = {};
    var load = function(scriptObj) {

      var src = scriptObj.attributes.src, tagName = scriptObj.tagName;
      if (alreadyLoaded[src]) {
        return alreadyLoaded[src];
      }

      alreadyLoaded[src] = new Promise((resolve, reject) => {
        if(tagName){
          var voidTag = voidTags.indexOf(tagName) !== -1
          var script = document.createElement(tagName);
          setAttributes(script, scriptObj.attributes);
          if(scriptObj.innerHTML) {
            script.innerHTML = scriptObj.innerHTML;
          }
          script.addEventListener(
            "load",
            () => {
              resolve(script);
            },
            false
          );
          script.addEventListener("error", () => reject(script), false);
          document.head.appendChild(script);
        }
      });
      return alreadyLoaded[src];
    };

    return function(scriptsObj) {
      if (Array.isArray(scriptsObj)) {
        return Promise.all(scriptsObj.map(load));
      } else {
        return load(scriptsObj);
      }
    };
  };

  const assetTags = [...baseAssetTags.headTags, ...baseAssetTags.bodyTags];
  window.isAssetsLoading = true;
  loader()(assetTags).finally(function(){
    window.isAssetsLoading = false;
  });
}
module.exports = {
  HtmlTagArray: HtmlTagArray,
  createHtmlTagObject: createHtmlTagObject,
  htmlTagObjectToString: htmlTagObjectToString,
  createAsyncLoaders: createAsyncLoaders
};
