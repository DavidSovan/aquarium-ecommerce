import { useState, useEffect } from 'react';
import productService from '../services/productService';

export function ImageGallery({ productId, thumbnail, onThumbnailChange }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (productId) loadImages();
  }, [productId]);

  const loadImages = async () => {
    setLoading(true);
    try {
      const response = await productService.getProductImages(productId);
      setImages(response.data);
    } catch (err) {
      setError('Failed to load images');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newUrl.trim()) return;
    setError(null);
    try {
      const response = await productService.uploadImage(productId, { image_url: newUrl.trim() });
      setImages(prev => [...prev, response.data]);
      setNewUrl('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to upload image');
    }
  };

  const handleDelete = async (imageId) => {
    try {
      await productService.deleteImage(imageId);
      setImages(prev => prev.filter(img => img.id !== imageId));
    } catch (err) {
      setError('Failed to delete image');
    }
  };

  const handleMoveUp = async (index) => {
    if (index === 0) return;
    const newImages = [...images];
    [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
    const items = newImages.map((img, i) => ({ id: img.id, sort_order: i }));
    try {
      await productService.reorderImages(items);
      setImages(newImages);
    } catch (err) {
      setError('Failed to reorder images');
    }
  };

  const handleMoveDown = async (index) => {
    if (index === images.length - 1) return;
    const newImages = [...images];
    [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
    const items = newImages.map((img, i) => ({ id: img.id, sort_order: i }));
    try {
      await productService.reorderImages(items);
      setImages(newImages);
    } catch (err) {
      setError('Failed to reorder images');
    }
  };

  const handleSetThumbnail = async (imageUrl) => {
    if (onThumbnailChange) {
      onThumbnailChange(imageUrl);
    }
  };

  if (!productId) return null;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Product Images</h3>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">{error}</div>
      )}

      {/* Add Image URL */}
      <form onSubmit={handleAdd} className="flex gap-2 mb-5">
        <input
          type="url"
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          placeholder="https://example.com/image.jpg"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={loading || !newUrl.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          Add
        </button>
      </form>

      {/* Image Grid */}
      {loading && images.length === 0 ? (
        <div className="text-center py-8 text-gray-500 text-sm">Loading images...</div>
      ) : images.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-300 rounded-lg">
          No images yet. Add an image URL above.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {images.map((img, index) => (
            <div key={img.id} className="relative group border rounded-lg overflow-hidden bg-gray-50">
              <div className="aspect-square">
                <img
                  src={img.image_url}
                  alt={`Product image ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-400 text-xs">Broken</div>';
                  }}
                />
              </div>

              {/* Thumbnail badge */}
              {thumbnail === img.image_url && (
                <span className="absolute top-1 left-1 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                  Thumbnail
                </span>
              )}

              {/* Overlay actions */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                <button
                  onClick={() => handleSetThumbnail(img.image_url)}
                  title="Set as thumbnail"
                  className="p-1.5 bg-white rounded-full text-green-600 hover:text-green-700 text-xs"
                >
                  &#9733;
                </button>
                <button
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                  title="Move up"
                  className="p-1.5 bg-white rounded-full text-gray-600 hover:text-gray-700 disabled:opacity-30 text-xs"
                >
                  &#9650;
                </button>
                <button
                  onClick={() => handleMoveDown(index)}
                  disabled={index === images.length - 1}
                  title="Move down"
                  className="p-1.5 bg-white rounded-full text-gray-600 hover:text-gray-700 disabled:opacity-30 text-xs"
                >
                  &#9660;
                </button>
                <button
                  onClick={() => handleDelete(img.id)}
                  title="Delete"
                  className="p-1.5 bg-white rounded-full text-red-600 hover:text-red-700 text-xs"
                >
                  &#10005;
                </button>
              </div>

              {/* Order number */}
              <span className="absolute bottom-1 right-1 bg-gray-800 bg-opacity-60 text-white text-[10px] px-1.5 py-0.5 rounded">
                #{img.sort_order}
              </span>
            </div>
          ))}
        </div>
      )}

      {images.length > 0 && (
        <p className="text-xs text-gray-400 mt-4 text-center">
          Hover over an image to see actions. Star to set as thumbnail.
        </p>
      )}
    </div>
  );
}
