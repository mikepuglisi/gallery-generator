"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

// import './style.css';
const Gallery = ({
  fileCollection,
  align,
  size,
  columns
}) => {
  return _react.default.createElement("ul", {
    itemScope: true,
    itemType: "http://schema.org/ImageGallery",
    class: "bhip-block-gallery columns-3"
  }, fileCollection.files.map((file, index) => {
    return _react.default.createElement("li", {
      key: index,
      className: `blocks-gallery-item`
    }, _react.default.createElement("figure", {
      itemProp: "associatedMedia",
      itemScope: true,
      itemType: "http://schema.org/ImageObject"
    }, _react.default.createElement("a", {
      href: file.url,
      className: `lightbox-image aspect`,
      itemProp: "contentUrl",
      "data-size": `${file.width}x${file.height}`,
      "data-tiny-url": file.tiny.url
    }, _react.default.createElement("img", {
      src: file.thumbnail.url,
      itemProp: "thumbnail"
    }))));
  }));
};

Gallery.defaultProps = {
  columns: 3
};
var _default = Gallery;
exports.default = _default;