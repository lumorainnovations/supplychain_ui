import React, { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { InventoryItem } from "../../types";

interface InventoryFormProps {
  item?: InventoryItem | null;
  onSave: (item: InventoryItem | Omit<InventoryItem, "id">) => void;
  onCancel: () => void;
  loading?: boolean;
}

const InventoryForm: React.FC<InventoryFormProps> = ({
  item,
  onSave,
  onCancel,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "",
    currentStock: 0,
    minStock: 0,
    maxStock: 0,
    unit: "",
    supplier: "",
    cost: 0,
    lastRestocked: new Date().toISOString().split("T")[0],
    location: "",
    description: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        sku: item.sku,
        category: item.category,
        currentStock: item.currentStock,
        minStock: item.minStock,
        maxStock: item.maxStock,
        unit: item.unit,
        supplier: item.supplier,
        cost: item.cost,
        lastRestocked: item.lastRestocked,
        location: item.location || "",
        description: item.description || "",
      });
    }
  }, [item]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.sku.trim()) newErrors.sku = "SKU is required";
    if (!formData.category.trim()) newErrors.category = "Category is required";
    if (formData.currentStock < 0)
      newErrors.currentStock = "Current stock cannot be negative";
    if (formData.minStock < 0)
      newErrors.minStock = "Min stock cannot be negative";
    if (formData.maxStock <= formData.minStock)
      newErrors.maxStock = "Max stock must be greater than min stock";
    if (!formData.unit.trim()) newErrors.unit = "Unit is required";
    if (!formData.supplier.trim()) newErrors.supplier = "Supplier is required";
    if (formData.cost < 0) newErrors.cost = "Cost cannot be negative";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || loading) return;

    if (item) {
      onSave({ ...item, ...formData });
    } else {
      onSave(formData);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    if (loading) return;

    const { name, value, type } = e.target;

    let newValue: string | number = value;

    if (type === "number") {
      // Remove leading zeros only if numeric and not empty
      const cleaned = value.replace(/^0+(?=\d)/, "");

      // Update the actual input field so it doesn't show leading zeros
      e.target.value = cleaned;

      newValue = cleaned === "" ? 0 : parseFloat(cleaned);
    }

    // Update the form state
    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    // Clear any previous validation error
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const categories = [
    "Raw Materials",
    "Components",
    "Finished Goods",
    "Packaging",
    "Tools & Equipment",
    "Consumables",
  ];

  const units = [
    "pieces",
    "units",
    "kg",
    "lbs",
    "meters",
    "feet",
    "liters",
    "gallons",
    "sheets",
    "rolls",
    "boxes",
    "pallets",
    "sets",
    "kits",
  ];

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            {item ? "Edit Inventory Item" : "Add New Inventory Item"}
          </h3>
                      <button
              onClick={onCancel}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Close form"
              aria-label="Close form"
            >
              <X className="w-6 h-6" />
            </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Item Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={loading}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter item name"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* SKU */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SKU *
              </label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                disabled={loading}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${
                  errors.sku ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter SKU"
              />
              {errors.sku && (
                <p className="text-red-500 text-sm mt-1">{errors.sku}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                disabled={loading}
                aria-label="Select category"
                title="Select category"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${
                  errors.category ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-red-500 text-sm mt-1">{errors.category}</p>
              )}
            </div>

            {/* Unit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit *
              </label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                disabled={loading}
                aria-label="Select unit"
                title="Select unit"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${
                  errors.unit ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Select unit</option>
                {units.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
              {errors.unit && (
                <p className="text-red-500 text-sm mt-1">{errors.unit}</p>
              )}
            </div>

            {/* Current Stock */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Stock *
              </label>
              <input
                type="number"
                name="currentStock"
                value={formData.currentStock}
                onChange={handleChange}
                disabled={loading}
                min="0"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${
                  errors.currentStock ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="0"
              />
              {errors.currentStock && (
                <p className="text-red-500 text-sm mt-1">{errors.currentStock}</p>
              )}
            </div>

            {/* Min Stock */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Stock *
              </label>
              <input
                type="number"
                name="minStock"
                value={formData.minStock}
                onChange={handleChange}
                disabled={loading}
                min="0"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${
                  errors.minStock ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="0"
              />
              {errors.minStock && (
                <p className="text-red-500 text-sm mt-1">{errors.minStock}</p>
              )}
            </div>

            {/* Max Stock */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Stock *
              </label>
              <input
                type="number"
                name="maxStock"
                value={formData.maxStock}
                onChange={handleChange}
                disabled={loading}
                min="0"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${
                  errors.maxStock ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="0"
              />
              {errors.maxStock && (
                <p className="text-red-500 text-sm mt-1">{errors.maxStock}</p>
              )}
            </div>

            {/* Cost */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit Cost *
              </label>
              <input
                type="number"
                name="cost"
                value={formData.cost}
                onChange={handleChange}
                disabled={loading}
                min="0"
                step="0.01"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${
                  errors.cost ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="0.00"
              />
              {errors.cost && (
                <p className="text-red-500 text-sm mt-1">{errors.cost}</p>
              )}
            </div>

            {/* Supplier */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supplier *
              </label>
              <input
                type="text"
                name="supplier"
                value={formData.supplier}
                onChange={handleChange}
                disabled={loading}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${
                  errors.supplier ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter supplier name"
              />
              {errors.supplier && (
                <p className="text-red-500 text-sm mt-1">{errors.supplier}</p>
              )}
            </div>

            {/* Last Restocked */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Restocked
              </label>
              <input
                type="date"
                name="lastRestocked"
                value={formData.lastRestocked}
                onChange={handleChange}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Location and Description - Full Width */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location || ""}
                onChange={handleChange}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Enter storage location"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description || ""}
                onChange={handleChange}
                disabled={loading}
                rows={3}
                aria-label="Item description"
                title="Item description"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Enter item description"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{item ? "Update Item" : "Add Item"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InventoryForm;
