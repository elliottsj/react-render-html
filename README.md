# react-render-html [![travis-ci](https://travis-ci.org/noraesae/react-render-html.svg)](https://travis-ci.org/noraesae/react-render-html)

No more dangerouslySetInnerHTML, render HTML as React element.

## How it works

It renders a provided HTML string into a React element.

```js
import renderHTML from 'react-render-html';

renderHTML("<a class='github' href='https://github.com'><b>GitHub</b></a>")
// => React Element
//    <a className="github" href="https://github.com"><b>GitHub</b></a>
```

It may be used in the `render` method in a React component:

```js
let App = React.createClass({
  render() {
    return (
      <div className='app'>
        {renderHTML(someHTML)}
      </div>
    );
  }
});
```

Or just by itself
```js
ReactDOM.render(renderHTML(someHTML), document.getElementById('app'));
```

If a provided HTML contains several top-level nodes, the function will return
an array of React elements.

```js
renderHTML('<li>hello</li><li>world</li>');
// => [React Element <li>hello</li>, React Element <li>world</li>]
```

### Custom renderers

Pass a function as the 2nd argument to `renderHTML` to customize how nodes are rendered:
```js
function renderNode(next) { /* ... */ }

renderHTML('<li>hello</li><li>world</li>', renderNode);
```

The function should have the signature
```js
renderNode(next: renderNode) => (renderNode: renderNode) => (node: ASTNode.<Element>, key: String) => ReactElement
```

Where `next` is the next renderer in the chain, `renderNode` is the entire chain, and `node` and `key` correspond to the current node being rendered.

For example, to replace the `href` attribute of all `<a>` elements, use:
```js
function replaceHref(next) {
  return next => renderNode => (node, key) => {
    const element = next(renderNode)(node, key);
    if (node.tagName === 'a') {
      return React.cloneElement(element, {
        href: 'https://example.com'
      });
    }
    return element;
  };
}

const htmlElement = renderHTML('<p><a class="hello" href="https://github.com">hihi</a></p>', replaceHref);
console.log(renderToStaticMarkup(htmlElement));
// <p><a class="hello" href="https://example.com">hihi</a></p>
```

Custom renders are composable: simply call `next` from within a renderer to get the resulting ReactElement from subsequent renders, and call `renderNode` if you need to render a node from scratch (e.g. child nodes). For example:
```js
const replaceHref = next => renderNode => (node, key) => {
  const element = next(renderNode)(node, key);
  if (node.tagName === 'a') {
    return React.cloneElement(element, {
      href: 'https://example.com'
    });
  }
  return element;
};
const replacePs = next => renderNode => (node, key) => {
  if (node.tagName === 'p') {
    return React.createElement(node.tagName, {}, 'Redacted');
  }
  return next(renderNode)(node, key);
};
const addLi = next => renderNode => (node, key) => {
  const element = next(renderNode)(node, key);
  if (node.tagName === 'ul') {
    return React.cloneElement(
      element,
      {},
      ...node.childNodes.map(renderNode),
      React.createElement('li', {}, 'One more')
    );
  }
  return element;
};
const htmlElement = renderHTML(
  '<ul>' +
    '<li><a class="hello" href="https://github.com">hihi</a></li>' +
    '<li><p><b>hello</b>world</p><p>react</p></li>' +
  '</ul>',
  compose(replaceHref, replacePs, addLi)
);

const htmlElement = renderHTML('<p><a class="hello" href="https://github.com">hihi</a></p>', replaceHref);
console.log(renderToStaticMarkup(htmlElement));
// <ul><li><a class="hello" href="https://example.com">hihi</a></li><li><p>Redacted</p><p>Redacted</p></li><li>One more</li></ul>
```

## Install

Install with NPM:

```
npm i --save react-render-html
```

Import with CommonJS or whatever:

```js
const renderHTML = require('react-render-html');

import renderHTML from 'react-render-html';
import * as renderHTML from 'react-render-html'; // both of them work
```

## A bug!

When a bug is found, please report them in [Issues](https://github.com/noraesae/react-render-html/issues).

Also, any form of contribution(especially a PR) will absolutely be welcomed :beers:

## License

[MIT](LICENSE)
