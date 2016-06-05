import parse5 from 'parse5';
import React from 'react';
import convertAttr from 'react-attr-converter';

function baseRenderNode() {
  return renderNode => (node, key) => {
    if (node.nodeName === '#text') {
      return node.value;
    }

    const props = {
      key,
      ...node.attrs.reduce((attrs, attr) => ({
        ...attrs,
        [convertAttr(attr.name)]: attr.value
      }), {})
    };

    const children = node.childNodes.map(renderNode);
    return React.createElement(node.tagName, props, ...children);
  };
}

function renderHTML(html, renderNode = next => (...args) => next(...args)) {
  const htmlAST = parse5.parseFragment(html);

  if (htmlAST.childNodes.length === 0) {
    return null;
  }

  const finalRenderNode = (node, key) => renderNode(baseRenderNode())(finalRenderNode)(node, key);
  const result = htmlAST.childNodes.map(finalRenderNode);

  return result.length === 1 ? result[0] : result;
}

export default renderHTML;
