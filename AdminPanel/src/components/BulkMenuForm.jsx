import React, { useState, useEffect } from "react";
import api from "../utils/api";
import { X, Plus, Upload, Download, Save, FileText } from "lucide-react";

export default function BulkMenuForm({ onClose, onRefresh }) {
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([
    {
      name: "",
      description: "",
      price: "",
      category: "",
      imageUrl: "",
      ingredients: "",
      sizes: [],
      jain: false // Add jain field
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [csvData, setCsvData] = useState(null);
  const [showCsvPreview, setShowCsvPreview] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  const addMenuItem = () => {
    setMenuItems([
      ...menuItems,
      {
        name: "",
        description: "",
        price: "",
        category: "",
        imageUrl: "",
        ingredients: "",
        sizes: [],
        jain: false
      }
    ]);
  };

  const removeMenuItem = (index) => {
    if (menuItems.length > 1) {
      setMenuItems(menuItems.filter((_, i) => i !== index));
    }
  };

  const updateMenuItem = (index, field, value) => {
    const updated = [...menuItems];
    updated[index][field] = value;
    setMenuItems(updated);
  };

  const addSize = (itemIndex) => {
    const updated = [...menuItems];
    updated[itemIndex].sizes.push({ label: "", price: "" });
    setMenuItems(updated);
  };

  const removeSize = (itemIndex, sizeIndex) => {
    const updated = [...menuItems];
    updated[itemIndex].sizes.splice(sizeIndex, 1);
    setMenuItems(updated);
  };

  const updateSize = (itemIndex, sizeIndex, field, value) => {
    const updated = [...menuItems];
    updated[itemIndex].sizes[sizeIndex][field] = value;
    setMenuItems(updated);
  };

  const handleCsvUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const csv = e.target.result;
      const lines = csv.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      const parsedData = lines.slice(1).filter(line => line.trim()).map((line) => {
        const values = line.split(',').map(v => v.trim());
        const item = {};
        
        headers.forEach((header, i) => {
          const value = values[i] || '';
          switch (header.toLowerCase()) {
            case 'name':
              item.name = value;
              break;
            case 'description':
              item.description = value;
              break;
            case 'price':
              item.price = value;
              break;
            case 'category':
              item.category = value;
              break;
            case 'image url':
            case 'imageurl':
              item.imageUrl = value;
              break;
            case 'ingredients':
              item.ingredients = value;
              break;
            case 'size labels':
            case 'sizelabels':
              item.sizeLabels = value;
              break;
            case 'size prices':
            case 'sizeprices':
              item.sizePrices = value;
              break;
            case 'jain':
              item.jain = value.toLowerCase() === 'true';
              break;
          }
        });
        
        return item;
      });

      setCsvData(parsedData);
      setShowCsvPreview(true);
    };
    reader.readAsText(file);
  };

  const applyCsvData = () => {
    if (!csvData) return;

    const processedItems = csvData.map(item => {
      const sizes = [];
      if (item.sizeLabels && item.sizePrices) {
        const labels = item.sizeLabels.split('|').map(l => l.trim());
        const prices = item.sizePrices.split('|').map(p => p.trim());
        
        labels.forEach((label, index) => {
          if (label && prices[index]) {
            sizes.push({
              label: label,
              price: prices[index]
            });
          }
        });
      }

      return {
        name: item.name || "",
        description: item.description || "",
        price: item.price || "",
        category: item.category || "",
        imageUrl: item.imageUrl || "",
        ingredients: item.ingredients || "",
        sizes: sizes,
        jain: item.jain || false
      };
    });

    setMenuItems(processedItems);
    setShowCsvPreview(false);
    setCsvData(null);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const itemsToSubmit = menuItems.map(item => {
        const ingredients = item.ingredients
          ? item.ingredients.split(',').map(i => i.trim()).filter(i => i)
          : [];
        
        const sizes = item.sizes
          .filter(size => size.label && size.price)
          .map(size => ({
            label: size.label,
            price: parseFloat(size.price),
            available: true
          }));

        return {
          name: item.name,
          description: item.description,
          price: item.price ? parseFloat(item.price) : null,
          category: item.category,
          imageUrl: item.imageUrl,
          ingredients,
          sizes,
          available: true,
          jain: item.jain || false // Add jain field
        };
      }).filter(item => item.name && item.category); // Only submit items with name and category

      if (itemsToSubmit.length === 0) {
        alert("Please add at least one menu item with name and category");
        return;
      }

      // Submit each item individually
      for (const item of itemsToSubmit) {
        await api.post("/menu", item);
      }

      alert(`Successfully created ${itemsToSubmit.length} menu items!`);
      onRefresh();
      onClose();
    } catch (err) {
      console.error("Failed to create menu items:", err);
      alert("Failed to create menu items. Please check your data and try again.");
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      "Name,Description,Price,Category,Image URL,Ingredients,Size Labels,Size Prices,Jain",
      "Example Item,Delicious example,10.99,Category ID,https://example.com/image.jpg,ingredient1,ingredient2,Small|Medium,5.99|8.99,true"
    ].join('\n');
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'menu_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white p-6 border-b border-gray-200 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Bulk Menu Item Creation</h2>
              <p className="text-gray-600 mt-1">Add multiple menu items at once</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={downloadTemplate}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Download size={16} />
                Template
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>
        </div>

        {/* CSV Upload Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">CSV Upload</h3>
            <p className="text-blue-700 mb-4">Upload a CSV file to bulk create menu items</p>
            
            <div className="flex gap-4 items-center">
              <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                <FileText size={16} />
                Choose CSV File
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCsvUpload}
                  className="hidden"
                />
              </label>
              
              {csvData && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowCsvPreview(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Preview ({csvData.length} items)
                  </button>
                  <button
                    onClick={applyCsvData}
                    className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                  >
                    Apply to Form
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CSV Preview Modal */}
        {showCsvPreview && csvData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-gray-900">CSV Preview</h3>
                  <button
                    onClick={() => setShowCsvPreview(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-2 border text-left">Name</th>
                        <th className="px-4 py-2 border text-left">Description</th>
                        <th className="px-4 py-2 border text-left">Price</th>
                        <th className="px-4 py-2 border text-left">Category</th>
                        <th className="px-4 py-2 border text-left">Ingredients</th>
                        <th className="px-4 py-2 border text-left">Jain</th>
                      </tr>
                    </thead>
                    <tbody>
                      {csvData.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-2 border">{item.name}</td>
                          <td className="px-4 py-2 border">{item.description}</td>
                          <td className="px-4 py-2 border">{item.price}</td>
                          <td className="px-4 py-2 border">{item.category}</td>
                          <td className="px-4 py-2 border">{item.ingredients}</td>
                          <td className="px-4 py-2 border">{item.jain ? 'Yes' : 'No'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={() => setShowCsvPreview(false)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={applyCsvData}
                    className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                  >
                    Apply to Form
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Manual Form Section */}
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Manual Entry</h3>
            <p className="text-sm text-gray-500">Or manually add items below</p>
          </div>

          {menuItems.map((item, itemIndex) => (
            <div key={itemIndex} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Menu Item #{itemIndex + 1}
                </h3>
                {menuItems.length > 1 && (
                  <button
                    onClick={() => removeMenuItem(itemIndex)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateMenuItem(itemIndex, "name", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="Item name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={item.description}
                      onChange={(e) => updateMenuItem(itemIndex, "description", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      rows={3}
                      placeholder="Item description"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Base Price
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={item.price}
                      onChange={(e) => updateMenuItem(itemIndex, "price", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      value={item.category}
                      onChange={(e) => updateMenuItem(itemIndex, "category", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Image URL
                    </label>
                    <input
                      type="url"
                      value={item.imageUrl}
                      onChange={(e) => updateMenuItem(itemIndex, "imageUrl", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ingredients (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={item.ingredients}
                      onChange={(e) => updateMenuItem(itemIndex, "ingredients", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="ingredient1, ingredient2, ingredient3"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Jain Available
                    </label>
                    <input
                      type="checkbox"
                      checked={item.jain || false}
                      onChange={(e) => updateMenuItem(itemIndex, "jain", e.target.checked)}
                      className="h-5 w-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>

              {/* Sizes Section */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-md font-medium text-gray-900">Sizes (Optional)</h4>
                  <button
                    onClick={() => addSize(itemIndex)}
                    className="flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors text-sm"
                  >
                    <Plus size={14} />
                    Add Size
                  </button>
                </div>

                {item.sizes.length > 0 && (
                  <div className="space-y-3">
                    {item.sizes.map((size, sizeIndex) => (
                      <div key={sizeIndex} className="flex gap-3 items-center">
                        <input
                          type="text"
                          value={size.label}
                          onChange={(e) => updateSize(itemIndex, sizeIndex, "label", e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          placeholder="Size label (e.g., Small, Medium)"
                        />
                        <input
                          type="number"
                          step="0.01"
                          value={size.price}
                          onChange={(e) => updateSize(itemIndex, sizeIndex, "price", e.target.value)}
                          className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          placeholder="Price"
                        />
                        <button
                          onClick={() => removeSize(itemIndex, sizeIndex)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Add More Button */}
          <button
            onClick={addMenuItem}
            className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-amber-400 hover:text-amber-600 transition-colors"
          >
            <Plus size={20} className="mx-auto mb-2" />
            Add Another Menu Item
          </button>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white p-6 border-t border-gray-200 rounded-b-2xl">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Create {menuItems.length} Items
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
