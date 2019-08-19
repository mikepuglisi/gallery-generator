import React, { useEffect } from 'react';
// import './style.css';

const Gallery = ({ fileCollection, align, size, columns }) => {
  return (
    <ul
    itemScope
    itemType="http://schema.org/ImageGallery"
    class="bhip-block-gallery columns-3"
  >
    {fileCollection.files.map((file, index) => {
      return <li
      key={index}
      className={`blocks-gallery-item`}
    >
      <figure
        itemProp="associatedMedia"
        itemScope
        itemType="http://schema.org/ImageObject"
      >
        <a
          href={file.url}
          className={`lightbox-image aspect`}
          itemProp="contentUrl"
          data-size={`${file.width}x${file.height}`}
          data-tiny-url={file.tiny.url}
        >
          <img
            src={file.thumbnail.url}
            itemProp="thumbnail"
          />
        </a>
      </figure>
    </li>
    })}
  </ul>
  )
}
Gallery.defaultProps = {
  columns: 3,
};
export default Gallery;