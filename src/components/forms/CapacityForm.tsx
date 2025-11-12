import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { CapacityResource } from "../../types";

interface CapacityFormProps {
  resource?: CapacityResource | null;
  onSave: (resource: CapacityResource | Omit<CapacityResource, "id">) => void;
  onCancel: () => void;
}

const CapacityForm: React.FC<CapacityFormProps> = ({
  resource,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    type: "machine" as CapacityResource["type"],
    capacity: 0,
    utilized: 0,
    efficiency: 0,
    department: "",
    status: "operational" as CapacityResource["status"],
    location: "",
    cost: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (resource) {
      setFormData({
        name: resource.name,
        type: resource.type,
        capacity: resource.capacity,
        utilized: resource.utilized,
        efficiency: resource.efficiency,
        department: resource.department,
        status: resource.status,
        location: resource.location || "",
        cost: resource.cost || 0,
      });
    }
  }, [resource]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.department.trim())
      newErrors.department = "Department is required";
    if (formData.capacity <= 0)
      newErrors.capacity = "Capacity must be greater than 0";
    if (formData.utilized < 0)
      newErrors.utilized = "Utilized cannot be negative";
    if (formData.utilized > formData.capacity)
      newErrors.utilized = "Utilized cannot exceed capacity";
    if (formData.efficiency < 0 || formData.efficiency > 100)
      newErrors.efficiency = "Efficiency must be between 0 and 100";
    if (formData.cost < 0) newErrors.cost = "Cost cannot be negative";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (resource) {
      onSave({ ...resource, ...formData });
    } else {
      onSave(formData);
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

  const departments = [
    "Manufacturing",
    "Assembly",
    "Quality Control",
    "Packaging",
    "Logistics",
    "Maintenance",
    "Research & Development",
    "Testing",
    "Production Planning",
    "Material Handling",
  ];

  const utilizationRate =
    formData.capacity > 0 ? (formData.utilized / formData.capacity) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            {resource ? "Edit Resource" : "Add New Resource"}
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resource Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter resource name"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resource Type *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="machine">Machine</option>
                <option value="labor">Labor</option>
                <option value="facility">Facility</option>
              </select>
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department *
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.department ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Select department</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
              {errors.department && (
                <p className="text-red-500 text-sm mt-1">{errors.department}</p>
              )}
            </div>

            {/* Status */}
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
                <option value="operational">Operational</option>
                <option value="maintenance">Maintenance</option>
                <option value="offline">Offline</option>
              </select>
            </div>

            {/* Capacity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Capacity *
              </label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                min="1"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.capacity ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter total capacity"
              />
              {errors.capacity && (
                <p className="text-red-500 text-sm mt-1">{errors.capacity}</p>
              )}
            </div>

            {/* Utilized */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currently Utilized *
              </label>
              <input
                type="number"
                name="utilized"
                value={formData.utilized}
                onChange={handleChange}
                min="0"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.utilized ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter current utilization"
              />
              {errors.utilized && (
                <p className="text-red-500 text-sm mt-1">{errors.utilized}</p>
              )}
            </div>

            {/* Efficiency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Efficiency (%) *
              </label>
              <input
                type="number"
                name="efficiency"
                value={formData.efficiency}
                onChange={handleChange}
                min="0"
                max="100"
                step="0.1"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.efficiency ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter efficiency percentage"
              />
              {errors.efficiency && (
                <p className="text-red-500 text-sm mt-1">{errors.efficiency}</p>
              )}
            </div>

            {/* Cost */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cost ($)
              </label>
              <input
                type="number"
                name="cost"
                value={formData.cost}
                onChange={handleChange}
                min="0"
                step="0.01"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.cost ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter cost"
              />
              {errors.cost && (
                <p className="text-red-500 text-sm mt-1">{errors.cost}</p>
              )}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter location"
            />
          </div>

          {/* Utilization Rate Display */}
          {formData.capacity > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Utilization Rate:
                </span>
                <span
                  className={`text-lg font-bold ${
                    utilizationRate >= 90
                      ? "text-red-600"
                      : utilizationRate >= 80
                      ? "text-yellow-600"
                      : "text-green-600"
                  }`}
                >
                  {utilizationRate.toFixed(1)}%
                </span>
              </div>
              <div className="bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    utilizationRate >= 90
                      ? "bg-red-500"
                      : utilizationRate >= 80
                      ? "bg-yellow-500"
                      : "bg-green-500"
                  }`}
                  style={{ width: `${Math.min(utilizationRate, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {utilizationRate >= 90
                  ? "High utilization - consider optimization"
                  : utilizationRate >= 80
                  ? "Moderate utilization"
                  : "Low utilization"}
              </p>
            </div>
          )}

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
              {resource ? "Update Resource" : "Add Resource"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CapacityForm;
