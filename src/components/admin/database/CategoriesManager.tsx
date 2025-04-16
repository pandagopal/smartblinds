import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';

interface Category {
  id: number;
  name: string;
  description: string;
  slug: string;
  parent_id?: number;
  image?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const CategoriesManager: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    slug: '',
    parent_id: '',
    is_active: true
  });
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const categoriesData = await api.categories.getAll();
      setCategories(categoriesData);
      setError(null);
    } catch (err) {
      console.error('Error loading categories:', err);
      setError('Failed to load categories. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (editingCategory) {
      setEditingCategory({
        ...editingCategory,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
      });
    } else {
      setNewCategory({
        ...newCategory,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
      });
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingCategory) {
        // Update existing category
        await fetch(`/api/categories/${editingCategory.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingCategory)
        });
        setEditingCategory(null);
      } else {
        // Create new category
        await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newCategory)
        });
        setNewCategory({
          name: '',
          description: '',
          slug: '',
          parent_id: '',
          is_active: true
        });
        setShowAddForm(false);
      }
      await loadCategories();
    } catch (err) {
      console.error('Error saving category:', err);
      setError('Failed to save category. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
      setLoading(true);
      await fetch(`/api/categories/${id}`, {
        method: 'DELETE'
      });
      await loadCategories();
    } catch (err) {
      console.error('Error deleting category:', err);
      setError('Failed to delete category. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    if (editingCategory) {
      setEditingCategory({
        ...editingCategory,
        name,
        slug: generateSlug(name)
      });
    } else {
      setNewCategory({
        ...newCategory,
        name,
        slug: generateSlug(name)
      });
    }
  };

  if (loading && categories.length === 0) {
    return (
      <div className="p-4">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Categories Manager</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          {showAddForm ? 'Cancel' : 'Add New Category'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}

      {(showAddForm || editingCategory) && (
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h3 className="text-lg font-medium mb-4">
            {editingCategory ? 'Edit Category' : 'Add New Category'}
          </h3>
          <form onSubmit={handleSaveCategory}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={editingCategory ? editingCategory.name : newCategory.name}
                  onChange={handleNameChange}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Slug</label>
                <input
                  type="text"
                  name="slug"
                  value={editingCategory ? editingCategory.slug : newCategory.slug}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  name="description"
                  value={editingCategory ? editingCategory.description : newCategory.description}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={3}
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Parent Category</label>
                <select
                  name="parent_id"
                  value={editingCategory ? (editingCategory.parent_id || '') : newCategory.parent_id}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">None (Top Level)</option>
                  {categories.map(cat => (
                    // Prevent setting a category as its own parent
                    (!editingCategory || cat.id !== editingCategory.id) && (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    )
                  ))}
                </select>
              </div>
              <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={editingCategory ? editingCategory.is_active : newCategory.is_active}
                    onChange={handleInputChange as any}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm">Active</span>
                </label>
              </div>
            </div>
            <div className="mt-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setEditingCategory(null);
                  setShowAddForm(false);
                }}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Category'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Slug
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.length > 0 ? (
                categories.map(category => (
                  <tr key={category.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{category.name}</div>
                      {category.parent_id && (
                        <div className="text-sm text-gray-500">
                          Parent: {categories.find(c => c.id === category.parent_id)?.name || 'Unknown'}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {category.slug}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 text-xs leading-5 font-semibold rounded-full ${
                        category.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {category.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(category.updated_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => setEditingCategory(category)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    No categories found. Create your first category with the "Add New Category" button.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CategoriesManager;
