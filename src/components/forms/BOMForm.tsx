import React, { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { BillOfMaterial } from "../../types";

interface BOMFormProps {
  bom?: BillOfMaterial | null;
  onSave: (bom: BillOfMaterial | Omit<BillOfMaterial, "id">) => void;
  onCancel: () => void;
}

const BOMForm: React.FC<BOMFormProps> = ({ bom, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    product: "",
    version: "",
    status: "draft" as BillOfMaterial["status"],
    components: [{ id: "", name: "", quantity: 0, unit: "", cost: 0 }],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (bom) {
      setFormData({
        product: bom.product,
        version: bom.version,
        status: bom.status,
        components:
          bom.components.length > 0
            ? bom.components
            : [{ id: "", name: "", quantity: 0, unit: "", cost: 0 }],
      });
    }
  }, [bom]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.product.trim()) newErrors.product = "Product is required";
    if (!formData.version.trim()) newErrors.version = "Version is required";

    formData.components.forEach((component, index) => {
      if (!component.name.trim())
        newErrors[`component_${index}_name`] = "Component name is required";
      if (component.quantity <= 0)
        newErrors[`component_${index}_quantity`] =
          "Quantity must be greater than 0";
      if (!component.unit.trim())
        newErrors[`component_${index}_unit`] = "Unit is required";
      if (component.cost < 0)
        newErrors[`component_${index}_cost`] = "Cost cannot be negative";
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const totalCost = formData.components.reduce(
      (sum, comp) => sum + comp.quantity * comp.cost,
      0
    );

    const bomData = {
      ...formData,
      totalCost,
      lastUpdated: new Date().toISOString().split("T")[0],
      components: formData.components.map((comp, index) => ({
        ...comp,
        id: comp.id || (index + 1).toString(),
      })),
    };

    if (bom) {
      onSave({ ...bom, ...bomData });
    } else {
      onSave(bomData);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
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

  const handleComponentChange = (
    index: number,
    field: string,
    value: string | number
  ) => {
    const updatedComponents = [...formData.components];
    updatedComponents[index] = {
      ...updatedComponents[index],
      [field]: value,
    };
    setFormData((prev) => ({
      ...prev,
      components: updatedComponents,
    }));

    const errorKey = `component_${index}_${field}`;
    if (errors[errorKey]) {
      setErrors((prev) => ({ ...prev, [errorKey]: "" }));
    }
  };

  const addComponent = () => {
    setFormData((prev) => ({
      ...prev,
      components: [
        ...prev.components,
        { id: "", name: "", quantity: 0, unit: "", cost: 0 },
      ],
    }));
  };

  const removeComponent = (index: number) => {
    if (formData.components.length > 1) {
      setFormData((prev) => ({
        ...prev,
        components: prev.components.filter((_, i) => i !== index),
      }));
    }
  };

  // Utility function to clean numeric input (remove leading zeros, allow only valid numbers)
  const cleanNumericInput = (value: string): number => {
    // Remove leading zeros, allow decimals, and fallback to 0 if invalid
    const cleaned = value.replace(/^0+(?=\d)/, "");
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  };

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

  const totalCost = formData.components.reduce(
    (sum, comp) => sum + comp.quantity * comp.cost,
    0
  );

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            {bom ? "Edit Bill of Materials" : "Create New Bill of Materials"}
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product *
              </label>
              <input
                type="text"
                name="product"
                value={formData.product}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.product ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter product name"
              />
              {errors.product && (
                <p className="text-red-500 text-sm mt-1">{errors.product}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Version *
              </label>
              <input
                type="text"
                name="version"
                value={formData.version}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.version ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="e.g., v1.0"
              />
              {errors.version && (
                <p className="text-red-500 text-sm mt-1">{errors.version}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="obsolete">Obsolete</option>
              </select>
            </div>
          </div>

          {/* Components Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium text-gray-900">Components</h4>
              <button
                type="button"
                onClick={addComponent}
                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Component</span>
              </button>
            </div>

            <div className="space-y-4">
              {formData.components.map((component, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border border-gray-200 rounded-lg"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Component Name *
                    </label>
                    <input
                      type="text"
                      value={component.name}
                      onChange={(e) =>
                        handleComponentChange(index, "name", e.target.value)
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors[`component_${index}_name`]
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Component name"
                    />
                    {errors[`component_${index}_name`] && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors[`component_${index}_name`]}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      value={component.quantity}
                      onChange={(e) => {
                        const cleanedValue = cleanNumericInput(e.target.value);
                        e.target.value = cleanedValue.toString(); // update input visually
                        handleComponentChange(index, "quantity", cleanedValue);
                      }}
                      min="0"
                      step="0.01"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors[`component_${index}_quantity`]
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="0"
                    />
                    {errors[`component_${index}_quantity`] && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors[`component_${index}_quantity`]}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit *
                    </label>
                    <select
                      value={component.unit}
                      onChange={(e) =>
                        handleComponentChange(index, "unit", e.target.value)
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors[`component_${index}_unit`]
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    >
                      <option value="">Select unit</option>
                      {units.map((unit) => (
                        <option key={unit} value={unit}>
                          {unit}
                        </option>
                      ))}
                    </select>
                    {errors[`component_${index}_unit`] && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors[`component_${index}_unit`]}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit Cost *
                    </label>
                    <input
                      type="number"
                      value={component.cost}
                      onChange={(e) => {
                        const cleanedValue = cleanNumericInput(e.target.value);
                        e.target.value = cleanedValue.toString(); // update input visually
                        handleComponentChange(index, "cost", cleanedValue);
                      }}
                      min="0"
                      step="0.01"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors[`component_${index}_cost`]
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="0.00"
                    />
                    {errors[`component_${index}_cost`] && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors[`component_${index}_cost`]}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Cost
                    </label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-700">
                      ${(component.quantity * component.cost).toFixed(2)}
                    </div>
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => removeComponent(index)}
                      disabled={formData.components.length === 1}
                      className="p-2 text-red-600 hover:text-red-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total Cost Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium text-gray-900">
                Total BOM Cost:
              </span>
              <span className="text-xl font-bold text-blue-600">
                ${totalCost.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {bom ? "Update BOM" : "Create BOM"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BOMForm;
