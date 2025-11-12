import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, MapPin } from "lucide-react";
import { DistributionRoute } from "../../types";

interface DistributionFormProps {
  route?: DistributionRoute | null;
  onSave: (route: DistributionRoute | Omit<DistributionRoute, "id">) => void;
  onCancel: () => void;
}

const DistributionForm: React.FC<DistributionFormProps> = ({
  route,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    origin: "",
    destinations: [""],
    distance: 0,
    estimatedTime: "",
    cost: 0,
    capacity: 0,
    status: "planned" as DistributionRoute["status"],
    vehicle: "",
    driver: "",
    priority: "medium" as DistributionRoute["priority"],
    scheduledDate: "",
    actualDate: "",
    notes: "",
    deliveryType: "standard" as DistributionRoute["deliveryType"],
    customerType: "retail" as DistributionRoute["customerType"],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  function toYMD(date: string): string {
    if (!date) return '';
    // If already in yyyy-MM-dd, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
    // Otherwise, try to parse and format
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  useEffect(() => {
    if (route) {
      setFormData({
        name: route.name,
        origin: route.origin,
        destinations: route.destinations.length > 0 ? route.destinations : [""],
        distance: route.distance,
        estimatedTime: route.estimatedTime,
        cost: route.cost,
        capacity: route.capacity,
        status: route.status,
        vehicle: route.vehicle || "",
        driver: route.driver || "",
        priority: route.priority,
        scheduledDate: toYMD(route.scheduledDate || ""),
        actualDate: toYMD(route.actualDate || ""),
        notes: route.notes || "",
        deliveryType: route.deliveryType,
        customerType: route.customerType,
      });
    }
  }, [route]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Route name is required";
    if (!formData.origin.trim()) newErrors.origin = "Origin is required";
    if (formData.destinations.filter((dest) => dest.trim()).length === 0) {
      newErrors.destinations = "At least one destination is required";
    }
    if (formData.distance <= 0)
      newErrors.distance = "Distance must be greater than 0";
    if (!formData.estimatedTime.trim())
      newErrors.estimatedTime = "Estimated time is required";
    if (formData.cost < 0) newErrors.cost = "Cost cannot be negative";
    if (formData.capacity <= 0)
      newErrors.capacity = "Capacity must be greater than 0";
    if (!formData.scheduledDate)
      newErrors.scheduledDate = "Scheduled date is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const routeData = {
      ...formData,
      destinations: formData.destinations.filter((dest) => dest.trim()),
    };

    if (route) {
      onSave({ ...route, ...routeData });
    } else {
      onSave(routeData);
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

  const handleDestinationChange = (index: number, value: string) => {
    const updatedDestinations = [...formData.destinations];
    updatedDestinations[index] = value;
    setFormData((prev) => ({
      ...prev,
      destinations: updatedDestinations,
    }));

    if (errors.destinations) {
      setErrors((prev) => ({ ...prev, destinations: "" }));
    }
  };

  const addDestination = () => {
    setFormData((prev) => ({
      ...prev,
      destinations: [...prev.destinations, ""],
    }));
  };

  const removeDestination = (index: number) => {
    if (formData.destinations.length > 1) {
      setFormData((prev) => ({
        ...prev,
        destinations: prev.destinations.filter((_, i) => i !== index),
      }));
    }
  };

  const vehicles = [
    "Truck-001 (Freightliner Cascadia)",
    "Truck-002 (Volvo VNL)",
    "Truck-003 (Peterbilt 579)",
    "Truck-004 (Kenworth T680)",
    "Truck-005 (Mack Anthem)",
    "Van-001 (Mercedes Sprinter)",
    "Van-002 (Ford Transit)",
    "Van-003 (Chevrolet Express)",
  ];

  const drivers = [
    "John Smith",
    "Mike Johnson",
    "Sarah Williams",
    "Robert Davis",
    "Lisa Garcia",
    "Tom Anderson",
    "Emily Brown",
    "David Wilson",
    "Jennifer Martinez",
    "Chris Taylor",
  ];

  const origins = [
    "Main Distribution Center - Boston",
    "Main Distribution Center - Los Angeles",
    "Regional Hub - Atlanta",
    "Central Hub - Chicago",
    "Local Hub - Dallas",
    "Western Hub - Denver",
    "Northern Hub - Seattle",
    "Southern Hub - Miami",
  ];

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            {route
              ? "Edit Distribution Route"
              : "Create New Distribution Route"}
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
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4">
              Basic Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Route Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter route name"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Origin *
                </label>
                <select
                  name="origin"
                  value={formData.origin}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.origin ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select origin</option>
                  {origins.map((origin) => (
                    <option key={origin} value={origin}>
                      {origin}
                    </option>
                  ))}
                </select>
                {errors.origin && (
                  <p className="text-red-500 text-sm mt-1">{errors.origin}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Distance (miles) *
                </label>
                <input
                  type="number"
                  name="distance"
                  value={formData.distance}
                  onChange={handleChange}
                  min="1"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.distance ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter distance"
                />
                {errors.distance && (
                  <p className="text-red-500 text-sm mt-1">{errors.distance}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Time *
                </label>
                <input
                  type="text"
                  name="estimatedTime"
                  value={formData.estimatedTime}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.estimatedTime ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="e.g., 2 days, 8 hours"
                />
                {errors.estimatedTime && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.estimatedTime}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cost ($) *
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capacity *
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
                  placeholder="Enter capacity"
                />
                {errors.capacity && (
                  <p className="text-red-500 text-sm mt-1">{errors.capacity}</p>
                )}
              </div>
            </div>
          </div>

          {/* Destinations */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-md font-medium text-gray-900">
                Destinations *
              </h4>
              <button
                type="button"
                onClick={addDestination}
                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Destination</span>
              </button>
            </div>

            <div className="space-y-3">
              {formData.destinations.map((destination, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) =>
                      handleDestinationChange(index, e.target.value)
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={`Destination ${index + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => removeDestination(index)}
                    disabled={formData.destinations.length === 1}
                    className="p-2 text-red-600 hover:text-red-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            {errors.destinations && (
              <p className="text-red-500 text-sm mt-1">{errors.destinations}</p>
            )}
          </div>

          {/* Route Details */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4">
              Route Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <option value="planned">Planned</option>
                  <option value="active">Active</option>
                  <option value="in-transit">In Transit</option>
                  <option value="completed">Completed</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Type
                </label>
                <select
                  name="deliveryType"
                  value={formData.deliveryType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="standard">Standard</option>
                  <option value="express">Express</option>
                  <option value="overnight">Overnight</option>
                  <option value="same-day">Same Day</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Type
                </label>
                <select
                  name="customerType"
                  value={formData.customerType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="retail">Retail</option>
                  <option value="wholesale">Wholesale</option>
                  <option value="distributor">Distributor</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle
                </label>
                <select
                  name="vehicle"
                  value={formData.vehicle}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select vehicle</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle} value={vehicle}>
                      {vehicle}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Driver
                </label>
                <select
                  name="driver"
                  value={formData.driver}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select driver</option>
                  {drivers.map((driver) => (
                    <option key={driver} value={driver}>
                      {driver}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4">Schedule</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scheduled Date *
                </label>
                <input
                  type="date"
                  name="scheduledDate"
                  value={formData.scheduledDate}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.scheduledDate ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.scheduledDate && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.scheduledDate}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Actual Date
                </label>
                <input
                  type="date"
                  name="actualDate"
                  value={formData.actualDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter any additional notes or special instructions"
            />
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
              {route ? "Update Route" : "Create Route"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DistributionForm;
