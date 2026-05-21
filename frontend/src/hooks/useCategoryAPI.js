import { useState, useCallback } from 'react';
import categoryService from '../services/categoryService';

export const useCategoryAPI = () => {
  const [categories, setCategories] = useState([]);
  const [categoryTree, setCategoryTree] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async (skip = 0, limit = 100) => {
    setLoading(true);
    setError(null);
    try {
      const response = await categoryService.getCategories(skip, limit);
      setCategories(response.data);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to fetch categories';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategoryTree = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await categoryService.getCategoryTree();
      setCategoryTree(response.data);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to fetch category tree';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategory = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await categoryService.getCategory(id);
      setSelectedCategory(response.data);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to fetch category';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createCategory = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await categoryService.createCategory(data);
      setCategories(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to create category';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCategory = useCallback(async (id, data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await categoryService.updateCategory(id, data);
      setCategories(prev =>
        prev.map(cat => cat.id === id ? response.data : cat)
      );
      if (selectedCategory?.id === id) {
        setSelectedCategory(response.data);
      }
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to update category';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  const deleteCategory = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await categoryService.deleteCategory(id);
      setCategories(prev => prev.filter(cat => cat.id !== id));
      if (selectedCategory?.id === id) {
        setSelectedCategory(null);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to delete category';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  return {
    categories,
    categoryTree,
    selectedCategory,
    loading,
    error,
    fetchCategories,
    fetchCategoryTree,
    fetchCategory,
    createCategory,
    updateCategory,
    deleteCategory,
    setError,
    clearError: () => setError(null),
  };
};
