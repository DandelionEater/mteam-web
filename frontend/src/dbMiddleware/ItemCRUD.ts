import { Item } from "../model/Item.schema";

const BASE_URL = "http://localhost:4000/api/item";

export const handleItemAdd = async (item: Item) => {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item),
  });

  console.log("Sending to backend...");

  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || "Failed to add item");
  }

  return res.json();
};

export const fetchItems = async (): Promise<Item[]> => {
  try {
    const response = await fetch(BASE_URL);
    if (!response.ok) throw new Error("Failed to fetch items");
    return await response.json();
  } catch (error) {
    console.error("Error fetching items:", error);
    throw error;
  }
};

export const fetchItemById = async (id: string): Promise<Item> => {
  const response = await fetch(`${BASE_URL}/${id}`);
  if (!response.ok) throw new Error("Failed to fetch item");
  return response.json() as Promise<Item>;
};

export const updateItem = async (id: string, form: Item): Promise<Item> => {
  try {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to update item");
    }

    return data;
  } catch (error) {
    console.error("Error updating item:", error);
    throw error;
  }
};

export const deleteItem = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || "Failed to delete item");
    }
  } catch (error) {
    console.error("Error deleting item:", error);
    throw error;
  }
};
