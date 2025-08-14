import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import axios from "axios";
import { API_URL } from "../api/api";
import { AuthContext } from "./AuthContext";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";

export const MenuContext = createContext();

export const MenuProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const { ownerId } = useParams();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lowStockThreshold, setLowStockThreshold] = useState(10);
  const [expiryFilter, setExpiryFilter] = useState(90);

  const isAdminMode = user && user.role === "admin" && ownerId;
  const businessId = isAdminMode ? ownerId : user?.businessId;

  const flattenForLowStock = (data) => {
    if (!Array.isArray(data)) return [];
    const looksGrouped = data.length && data[0]?.subcategories;
    return looksGrouped
      ? data.flatMap((cat) => cat.subcategories.flatMap((sub) => sub.items))
      : data;
  };
  // Return items whose quantity <= threshold
  const getLowStockItems = (thresholdOverride) => {
    const th = Number.isFinite(Number(thresholdOverride))
      ? Number(thresholdOverride)
      : lowStockThreshold;

    return flattenForLowStock(menuItems)
      .map((it) => ({
        _id: it._id,
        name: it.name,
        description: it.description || "",
        category: it.category || "uncategorized",
        subcategory: it.subcategory || "general",
        quantity: Number(it.quantity ?? 0),
      }))
      .filter((it) => it.quantity <= th);
  };

  const parseExpiryDate = (raw) => {
    if (!raw) return null;
    if (raw?.toDate) {
      try {
        return raw.toDate();
      } catch {
        return null;
      }
    }
    const d = raw instanceof Date ? new Date(raw.getTime()) : new Date(raw);
    return Number.isNaN(d.getTime()) ? null : d;
  };

  // Accepts grouped or flat; returns FLAT items annotated with expiry info
  const filterItemsByExpiry = (itemsOrGrouped, withinDays = expiryFilter) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // If your state is grouped, flatten and carry category/subcategory
    const flattened =
      Array.isArray(itemsOrGrouped) && itemsOrGrouped[0]?.subcategories
        ? itemsOrGrouped.flatMap((c) =>
            c.subcategories.flatMap((s) =>
              s.items.map((it) => ({
                ...it,
                category: c.category,
                subcategory: s.subcategory,
              }))
            )
          )
        : Array.isArray(itemsOrGrouped)
        ? itemsOrGrouped
        : [];

    return flattened
      .map((it) => {
        const expiryDate = parseExpiryDate(it.expiryDate);
        if (!expiryDate) return null; // skip items without valid date
        expiryDate.setHours(0, 0, 0, 0);
        const diffDays = Math.ceil(
          (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );
        return {
          ...it,
          formattedExpiry: expiryDate.toLocaleDateString(),
          daysToExpiry: diffDays,
          monthsToExpiry: Math.floor(diffDays / 30),
        };
      })
      .filter(Boolean)
      .filter((it) => it.daysToExpiry >= 0 && it.daysToExpiry <= withinDays);
  };

  // Helper functions for price calculations
  const calculateCurrentPrice = (item) => {
    if (!item) return 0;
    const basePrice = item.totalPrice || 0;
    const discount = item.discountPercentage || 0;
    return parseFloat((basePrice * (1 - discount / 100)).toFixed(2));
  };

  const calculateDiscountAmount = (item) => {
    if (!item) return 0;
    return parseFloat(
      (item.totalPrice * (item.discountPercentage / 100)).toFixed(2)
    );
  };

  const processMenuItems = (items) => {
    return items.map((item) => ({
      ...item,
      currentPrice: calculateCurrentPrice(item),
      discountAmount: calculateDiscountAmount(item),
      isOnDiscount: item.discountPercentage > 0,
    }));
  };

  // Group menu items by category and subcategory
  const groupMenuItems = (items) => {
    const grouped = {};
    items.forEach((item) => {
      const category = item.category || "uncategorized";
      const subcategory = item.subcategory || "general";
      if (!grouped[category]) grouped[category] = {};
      if (!grouped[category][subcategory]) grouped[category][subcategory] = [];
      grouped[category][subcategory].push(item);
    });

    const entries = Object.entries(grouped);
    const uncategorizedIndex = entries.findIndex(
      ([category]) => category === "uncategorized"
    );
    let orderedEntries = entries;

    if (uncategorizedIndex !== -1) {
      const [uncategorized] = entries.splice(uncategorizedIndex, 1);
      orderedEntries = [uncategorized, ...entries];
    }

    return orderedEntries.map(([category, subcats]) => ({
      category,
      subcategories: Object.entries(subcats).map(([subcategory, items]) => ({
        subcategory,
        items,
      })),
    }));
  };

  // Fetch all menu items
  const fetchMenu = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = isAdminMode
        ? `${API_URL}/api/menu/admin/all`
        : `${API_URL}/api/menu`;

      const response = await axios.get(
        endpoint,
        isAdminMode ? { params: { ownerId } } : {}
      );
      const processedItems = processMenuItems(response.data);

      setMenuItems(
        isAdminMode ? groupMenuItems(processedItems) : processedItems
      );
      setError(null);
    } catch (error) {
      setError(error.response?.data?.message || "Error fetching menu items");
      console.error("Menu fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [isAdminMode, ownerId]);

  // Validate discount data
  const validateDiscount = (itemData, currentItem = null) => {
    if (itemData.discountPercentage !== undefined) {
      const discount = parseFloat(itemData.discountPercentage);
      if (isNaN(discount)) throw new Error("Discount must be a number");
      if (discount < 0 || discount > 100)
        throw new Error("Discount must be between 0-100%");

      const totalPrice = itemData.totalPrice || currentItem?.totalPrice;
      if (totalPrice && totalPrice * (1 - discount / 100) <= 0) {
        throw new Error("Discount would make price zero or negative");
      }
    }
  };

  // Add new menu item
  const addMenuItem = async (itemData) => {
    try {
      validateDiscount(itemData);

      const endpoint = isAdminMode
        ? `${API_URL}/api/menu/admin`
        : `${API_URL}/api/menu`;

      const response = await axios.post(
        endpoint,
        itemData,
        isAdminMode ? { params: { ownerId } } : {}
      );
      const newItem = processMenuItems([response.data])[0];

      setMenuItems((prev) => {
        if (isAdminMode) {
          const flatItems = prev.flatMap((cat) =>
            cat.subcategories.flatMap((sub) => sub.items)
          );
          return groupMenuItems([...flatItems, newItem]);
        }
        return [...prev, newItem];
      });

      toast.success("Menu item added successfully");
      return newItem;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      toast.error(errorMsg);
      throw error;
    }
  };

  // Update existing menu item
  const updateMenuItem = async (itemId, itemData) => {
    try {
      const currentItem = menuItems
        .flatMap((cat) => cat.subcategories.flatMap((sub) => sub.items))
        .find((item) => item._id === itemId);

      validateDiscount(itemData, currentItem);

      const endpoint = isAdminMode
        ? `${API_URL}/api/menu/admin/${itemId}`
        : `${API_URL}/api/menu/${itemId}`;

      const response = await axios.put(
        endpoint,
        itemData,
        isAdminMode ? { params: { ownerId } } : {}
      );
      const updatedItem = processMenuItems([response.data])[0];

      setMenuItems((prev) => {
        if (isAdminMode) {
          const flatItems = prev.flatMap((cat) =>
            cat.subcategories.flatMap((sub) =>
              sub.items.map((item) =>
                item._id === itemId ? updatedItem : item
              )
            )
          );
          return groupMenuItems(flatItems);
        }
        return prev.map((item) => (item._id === itemId ? updatedItem : item));
      });

      toast.success("Menu item updated successfully");
      return updatedItem;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      toast.error(errorMsg);
      throw error;
    }
  };

  // Apply discount to item
  const applyItemDiscount = async (itemId, discountPercentage) => {
    try {
      validateDiscount({ discountPercentage });

      const endpoint = isAdminMode
        ? `${API_URL}/api/menu/admin/${itemId}/discount`
        : `${API_URL}/api/menu/${itemId}/discount`;

      const response = await axios.patch(
        endpoint,
        { discountPercentage },
        isAdminMode ? { params: { ownerId } } : {}
      );

      const updatedItem = processMenuItems([response.data])[0];

      setMenuItems((prev) => {
        if (isAdminMode) {
          const flatItems = prev.flatMap((cat) =>
            cat.subcategories.flatMap((sub) =>
              sub.items.map((item) =>
                item._id === itemId ? updatedItem : item
              )
            )
          );
          return groupMenuItems(flatItems);
        }
        return prev.map((item) => (item._id === itemId ? updatedItem : item));
      });

      toast.success("Discount applied successfully");
      return updatedItem;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      toast.error(errorMsg);
      throw error;
    }
  };

  // Remove discount from item
  const removeItemDiscount = async (itemId) => {
    return applyItemDiscount(itemId, 0);
  };

  // Delete menu item
  const deleteMenuItem = async (itemId) => {
    try {
      const endpoint = isAdminMode
        ? `${API_URL}/api/menu/admin/${itemId}`
        : `${API_URL}/api/menu/${itemId}`;

      await axios.delete(endpoint, isAdminMode ? { params: { ownerId } } : {});

      setMenuItems((prev) => {
        if (isAdminMode) {
          const flatItems = prev.flatMap((cat) =>
            cat.subcategories.flatMap((sub) =>
              sub.items.filter((item) => item._id !== itemId)
            )
          );
          return groupMenuItems(flatItems);
        }
        return prev.filter((item) => item._id !== itemId);
      });

      toast.success("Menu item deleted successfully");
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      toast.error(errorMsg);
      throw error;
    }
  };

  // Bulk operations for menu items
  const bulkAddMenuItems = async (items) => {
    try {
      const endpoint = isAdminMode
        ? `${API_URL}/api/menu/admin/bulk`
        : `${API_URL}/api/menu/bulk`;

      const response = await axios.post(
        endpoint,
        { items },
        isAdminMode ? { params: { ownerId } } : {}
      );
      const newItems = processMenuItems(response.data);

      setMenuItems((prev) => {
        if (isAdminMode) {
          return groupMenuItems([
            ...prev.flatMap((cat) =>
              cat.subcategories.flatMap((sub) => sub.items)
            ),
            ...newItems,
          ]);
        }

        const newMenuItems = [...prev];

        newItems.forEach((newItem) => {
          const categoryIndex = newMenuItems.findIndex(
            (c) => c.category === newItem.category
          );

          if (categoryIndex === -1) {
            newMenuItems.push({
              category: newItem.category,
              subcategories: [
                {
                  subcategory: newItem.subcategory,
                  items: [newItem],
                },
              ],
            });
            return;
          }

          const subcategoryIndex = newMenuItems[
            categoryIndex
          ].subcategories.findIndex(
            (s) => s.subcategory === newItem.subcategory
          );

          if (subcategoryIndex === -1) {
            newMenuItems[categoryIndex].subcategories.push({
              subcategory: newItem.subcategory,
              items: [newItem],
            });
            return;
          }

          newMenuItems[categoryIndex].subcategories[
            subcategoryIndex
          ].items.push(newItem);
        });

        return newMenuItems;
      });

      toast.success(`${newItems.length} menu items added successfully`);
      return newItems;
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Failed to add menu items in bulk";
      toast.error(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const bulkDeleteMenuItems = async (itemIds) => {
    try {
      const endpoint = isAdminMode
        ? `${API_URL}/api/menu/admin/bulk`
        : `${API_URL}/api/menu/bulk`;

      const response = await axios.delete(endpoint, {
        params: isAdminMode ? { ownerId } : undefined,
        data: { itemIds },
      });

      setMenuItems((prev) => {
        if (isAdminMode) {
          const remainingItems = prev.flatMap((cat) =>
            cat.subcategories.flatMap((sub) =>
              sub.items.filter((item) => !itemIds.includes(item._id))
            )
          );
          return groupMenuItems(remainingItems);
        }

        return prev
          .map((category) => ({
            ...category,
            subcategories: category.subcategories
              .map((subcategory) => ({
                ...subcategory,
                items: subcategory.items.filter(
                  (item) => !itemIds.includes(item._id)
                ),
              }))
              .filter((subcategory) => subcategory.items.length > 0),
          }))
          .filter((category) => category.subcategories.length > 0);
      });

      toast.success(
        `${response.data.deletedCount} menu items deleted successfully`
      );
      return response.data.deletedCount;
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Failed to delete menu items in bulk";
      toast.error(errorMsg);
      throw new Error(errorMsg);
    }
  };

  // Category operations
  const renameCategory = async (oldCategory, newCategory) => {
    try {
      await axios.put(`${API_URL}/api/menu/category/rename`, {
        oldCategory,
        newCategory,
      });
      await fetchMenu();
      toast.success("Category renamed successfully");
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Failed to rename category";
      toast.error(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const renameSubcategory = async (
    category,
    oldSubcategory,
    newSubcategory
  ) => {
    try {
      await axios.put(`${API_URL}/api/menu/subcategory/rename`, {
        category,
        oldSubcategory,
        newSubcategory,
      });
      await fetchMenu();
      toast.success("Subcategory renamed successfully");
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Failed to rename subcategory";
      toast.error(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const deleteCategory = async (category) => {
    try {
      const categoryItems = menuItems.find((c) => c.category === category);
      if (!categoryItems) return;

      const itemIds = categoryItems.subcategories.flatMap((s) =>
        s.items.map((i) => i._id)
      );
      if (itemIds.length === 0) return;

      await bulkDeleteMenuItems(itemIds);
      toast.success("Category deleted successfully");
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Failed to delete category";
      toast.error(errorMsg);
      throw new Error(errorMsg);
    }
  };
  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  // Context value
  const value = useMemo(
    () => ({
      menuItems,
      loading,
      error,
      fetchMenu,
      addMenuItem,
      updateMenuItem,
      deleteMenuItem,
      applyItemDiscount,
      removeItemDiscount,
      bulkAddMenuItems,
      bulkDeleteMenuItems,
      renameCategory,
      renameSubcategory,
      deleteCategory,
      calculateCurrentPrice,
      calculateDiscountAmount,
      getLowStockItems,
      lowStockThreshold,
      setLowStockThreshold,
      filterItemsByExpiry,
      expiryFilter,
      setExpiryFilter,
    }),
    [
      menuItems,
      loading,
      error,
      fetchMenu,
      getLowStockItems,
      lowStockThreshold,
      filterItemsByExpiry,
      expiryFilter,
    ]
  );

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
};
