import React, { useState } from 'react';
import './ImageGallery.css';

function ImageGallery({ images, imageType }) {
  const [selectedImage, setSelectedImage] = useState(images[0] || null);

  return (
    <div className="image-gallery-container">
      {/* Barre de miniatures en haut */}
      <div className="thumbnails-bar">
        {images.map((image) => (
          <div 
            key={image.id} 
            className={`thumbnail ${selectedImage?.id === image.id ? 'active' : ''}`}
            onClick={() => setSelectedImage(image)}
          >
            <img src={image.url} alt={`Miniature ${image.date}`} />
            <span className="thumbnail-date">{image.date}</span>
          </div>
        ))}
      </div>

      {/* Grande image principale */}
      <div className="main-image-container">
        {selectedImage ? (
          <>
            <img 
              src={selectedImage.url} 
              alt={`${imageType} ${selectedImage.date}`} 
              className="main-image"
            />
            <div className="image-details">
              <p className="image-date">Date: {selectedImage.date}</p>
              <p className="image-description">{selectedImage.description}</p>
            </div>
          </>
        ) : (
          <div className="no-image-message">
            Aucune image sélectionnée
          </div>
        )}
      </div>
    </div>
  );
}

export default ImageGallery;