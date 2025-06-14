import { Gallery } from "../model/Item.schema";

export type NewGallery = Omit<Gallery, "_id">;

export const handleGalleryAdd = async (form: NewGallery) => {
  try {
    const response = await fetch("http://localhost:4000/api/gallery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to add gallery item");
    }

    return data;
  } catch (error) {
    console.error("Error submitting gallery item:", error);
    throw error;
  }
};

export const fetchGalleryItems = async (): Promise<Gallery[]> => {
  try {
    const response = await fetch("http://localhost:4000/api/gallery");
    if (!response.ok) throw new Error("Failed to fetch gallery items");
    return await response.json();
  } catch (error) {
    console.error("Error fetching gallery items:", error);
    throw error;
  }
};

export const fetchGalleryItemById = async (id: string): Promise<Gallery> => {
  try {
    const response = await fetch(`http://localhost:4000/api/gallery/${id}`);
    if (!response.ok) throw new Error("Failed to fetch gallery item");
    return await response.json();
  } catch (error) {
    console.error(`Error fetching gallery item ${id}:`, error);
    throw error;
  }
};

export const updateGalleryItem = async (id: string, form: NewGallery): Promise<Gallery> => {
  try {
    const response = await fetch(`http://localhost:4000/api/gallery/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to update gallery item");
    }

    return data;
  } catch (error) {
    console.error("Error updating gallery item:", error);
    throw error;
  }
};

export const deleteGalleryItem = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`http://localhost:4000/api/gallery/${id}`, {
      method: "DELETE",
      credentials: 'include',
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || "Failed to delete gallery item");
    }
  } catch (error) {
    console.error("Error deleting gallery item:", error);
    throw error;
  }
};