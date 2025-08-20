import React, { useState, useEffect } from "react";
import api from "../utils/api";
import { socket } from "../utils/socket";
import { toast } from "react-toastify";
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
      sizeLabels: "",
      sizePrices: "",
      sizes: [],
      jain: false
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
      setCategories(res.data.data);
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
        sizeLabels: "",
        sizePrices: "",
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
      
      // Detect delimiter (tab or comma)
      const firstLine = lines[0];
      const delimiter = firstLine.includes('\t') ? '\t' : ',';
      
      const headers = firstLine.split(delimiter).map(h => h.trim());
      
      const parsedData = lines.slice(1).filter(line => line.trim()).map((line) => {
        // Handle CSV parsing with proper quote handling
        const values = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === delimiter && !inQuotes) {
            values.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        values.push(current.trim());
        
        const item = {};
        
        headers.forEach((header, i) => {
          const value = values[i] || '';
          const cleanValue = value.replace(/^"|"$/g, '').trim();
          switch (header.toLowerCase().trim()) {
            case 'name':
              item.name = cleanValue;
              break;
            case 'description':
              item.description = cleanValue;
              break;
            case 'price':
              item.price = cleanValue;
              break;
            case 'category':
              // Find category by name and use its ID
              const foundCategory = categories.find(cat => cat.name.toLowerCase() === cleanValue.toLowerCase());
              item.category = foundCategory ? foundCategory._id : cleanValue;
              break;
            case 'image url':
            case 'imageurl':
              item.imageUrl = cleanValue;
              break;
            case 'ingredients':
              item.ingredients = cleanValue;
              break;
            case 'size labels':
            case 'sizelabels':
              item.sizeLabels = cleanValue;
              break;
            case 'size prices':
            case 'sizeprices':
              item.sizePrices = cleanValue;
              break;
            case 'jain':
              item.jain = cleanValue.toLowerCase() === 'true';
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
        sizeLabels: item.sizeLabels || "",
        sizePrices: item.sizePrices || "",
        sizes: [],
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
        const ingredients = item.ingredients && typeof item.ingredients === 'string'
          ? item.ingredients.split(',').map(i => i.trim()).filter(i => i)
          : [];
        
        let sizes = [];
        if (item.sizeLabels && item.sizePrices) {
          const labels = item.sizeLabels.split('|').map(l => l.trim());
          const prices = item.sizePrices.split('|').map(p => p.trim());
          
          labels.forEach((label, index) => {
            if (label && prices[index]) {
              sizes.push({
                label: label,
                price: parseFloat(prices[index]),
                available: true
              });
            }
          });
        }

        return {
          name: item.name,
          description: item.description,
          price: item.price ? parseFloat(item.price) : null,
          category: item.category,
          imageUrl: item.imageUrl || '',
          ingredients: ingredients.join(','),
          sizes,
          available: true,
          jain: item.jain || false
        };
      }).filter(item => item.name && item.category); // Only submit items with name and category

      if (itemsToSubmit.length === 0) {
        toast.error("Please add at least one menu item with name and category");
        return;
      }

      // Submit each item individually
      for (const item of itemsToSubmit) {
        await api.post("/menu", item);
      }

      toast.success(`Successfully created ${itemsToSubmit.length} menu items!`);
      onRefresh();
      onClose();
    } catch (err) {
      console.error("Failed to create menu items:", err);
      toast.error("Failed to create menu items. Please check your data and try again.");
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      "Name,Description,Price,Category,Image URL,Ingredients,Size Labels,Size Prices,Jain",
      "Pizza Margherita,Classic pizza with tomato and mozzarella,12.99,Main Course,https://example.com/pizza.jpg,\"tomato sauce,mozzarella,basil\",Small|Medium|Large,8.99|12.99|16.99,false",
      "Pasta Alfredo,Creamy pasta with parmesan cheese,14.50,Main Course,https://example.com/pasta.jpg,\"pasta,cream,parmesan,garlic\",Regular|Large,14.50|18.50,true",
      "Caesar Salad,Fresh romaine lettuce with caesar dressing,8.99,Salads,,\"lettuce,croutons,parmesan,caesar dressing\",,8.99,true"
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

        {/* Column-based Form Section */}
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Bulk Menu Entry</h3>
            <button
              onClick={addMenuItem}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus size={16} />
              Add Row
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-700 min-w-[150px]">
                    Name *
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-700 min-w-[200px]">
                    Description
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-700 min-w-[100px]">
                    Price
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-700 min-w-[150px]">
                    Category *
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-700 min-w-[200px]">
                    Ingredients
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-700 min-w-[200px]">
                    Image URL
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-700 min-w-[150px]">
                    Size Labels
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-700 min-w-[150px]">
                    Size Prices
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-700 min-w-[80px]">
                    Jain
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-center font-medium text-gray-700 w-[50px]">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {menuItems.map((item, itemIndex) => (
                  <tr key={itemIndex} className="hover:bg-gray-50">
                    <td className="border border-gray-300 p-2">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => updateMenuItem(itemIndex, "name", e.target.value)}
                        className="w-full px-2 py-1 border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Item name"
                      />
                    </td>
                    <td className="border border-gray-300 p-2">
                      <textarea
                        value={item.description}
                        onChange={(e) => updateMenuItem(itemIndex, "description", e.target.value)}
                        className="w-full px-2 py-1 border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        rows={2}
                        placeholder="Description"
                      />
                    </td>
                    <td className="border border-gray-300 p-2">
                      <input
                        type="number"
                        step="0.01"
                        value={item.price}
                        onChange={(e) => updateMenuItem(itemIndex, "price", e.target.value)}
                        className="w-full px-2 py-1 border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0.00"
                      />
                    </td>
                    <td className="border border-gray-300 p-2">
                      <select
                        value={item.category}
                        onChange={(e) => updateMenuItem(itemIndex, "category", e.target.value)}
                        className="w-full px-2 py-1 border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select</option>
                        {categories.map((cat) => (
                          <option key={cat._id} value={cat._id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="border border-gray-300 p-2">
                      <input
                        type="text"
                        value={item.ingredients}
                        onChange={(e) => updateMenuItem(itemIndex, "ingredients", e.target.value)}
                        className="w-full px-2 py-1 border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="ingredient1, ingredient2"
                      />
                    </td>
                    <td className="border border-gray-300 p-2">
                      <input
                        type="text"
                        value={item.imageUrl || ''}
                        onChange={(e) => updateMenuItem(itemIndex, "imageUrl", e.target.value)}
                        className="w-full px-2 py-1 border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://example.com/image.jpg"
                      />
                    </td>
                    <td className="border border-gray-300 p-2">
                      <input
                        type="text"
                        value={item.sizeLabels || ''}
                        onChange={(e) => updateMenuItem(itemIndex, "sizeLabels", e.target.value)}
                        className="w-full px-2 py-1 border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Small|Medium|Large"
                      />
                    </td>
                    <td className="border border-gray-300 p-2">
                      <input
                        type="text"
                        value={item.sizePrices || ''}
                        onChange={(e) => updateMenuItem(itemIndex, "sizePrices", e.target.value)}
                        className="w-full px-2 py-1 border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="8.99|12.99|16.99"
                      />
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      <input
                        type="checkbox"
                        checked={item.jain || false}
                        onChange={(e) => updateMenuItem(itemIndex, "jain", e.target.checked)}
                        className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      {menuItems.length > 1 && (
                        <button
                          onClick={() => removeMenuItem(itemIndex)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-sm text-gray-500">
            <p>* Required fields. Use comma-separated values for ingredients. Use pipe-separated values for sizes (Small|Medium|Large).</p>
          </div>
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
