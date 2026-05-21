import { useState, useCallback } from 'react';
import productService from '../services/productService';

export const useProductAPI = () => {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await productService.getProducts(params);
      setProducts(response.data.items);
      setTotal(response.data.total);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to fetch products';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFeaturedProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await productService.getFeaturedProducts();
      setProducts(response.data);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to fetch featured products';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProduct = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await productService.getProduct(id);
      setSelectedProduct(response.data);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to fetch product';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProductBySlug = useCallback(async (slug) => {
    setLoading(true);
    setError(null);
    try {
      const response = await productService.getProductBySlug(slug);
      setSelectedProduct(response.data);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to fetch product';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createProduct = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await productService.createProduct(data);
      setProducts(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to create product';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProduct = useCallback(async (id, data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await productService.updateProduct(id, data);
      setProducts(prev =>
        prev.map(p => p.id === id ? response.data : p)
      );
      if (selectedProduct?.id === id) {
        setSelectedProduct(response.data);
      }
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to update product';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [selectedProduct]);

  const deleteProduct = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await productService.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      if (selectedProduct?.id === id) {
        setSelectedProduct(null);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to delete product';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [selectedProduct]);

  return {
    products,
    total,
    selectedProduct,
    loading,
    error,
    fetchProducts,
    fetchFeaturedProducts,
    fetchProduct,
    fetchProductBySlug,
    createProduct,
    updateProduct,
    deleteProduct,
    setError,
    clearError: () => setError(null),
  };
};
