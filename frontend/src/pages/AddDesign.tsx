import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { PlusIcon, TrashIcon, ArrowLeftIcon } from "@heroicons/react/24/solid";

import i18n from "../i18n";
import { Item } from "../model/Item.schema";
import { Category } from "../model/Category.schema";

import { handleItemAdd } from "../dbMiddleware/ItemCRUD";
import { fetchCategories } from "../api/categoryService";

const emptyValue = { en: "", lt: "" };

type LocalisedText = { en: string; lt: string };

type ItemForm = Omit<Item, "name" | "description"> & {
  name: LocalisedText;
  description: LocalisedText;
};

const AddDesign = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [form, setForm] = useState<ItemForm>({
    name:            emptyValue,
    description:     emptyValue,
    category:      "",
    stock:           0,
    price:           0,
    images:          [""],
    manufacturingID: "",
  });

  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    })();
  }, []);

  const handleLocalised = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: keyof Pick<Item, "name" | "description">,
    lang: "en" | "lt",
  ) =>
    setForm(prev => ({
      ...prev,
      [field]: { ...prev[field], [lang]: e.target.value },
    }));

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) =>
    setForm(prev => ({
      ...prev,
      [e.target.name]:
        e.target.type === "number" ? Number(e.target.value) : e.target.value,
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { category, ...rest } = form;

    const payload = {
      ...rest,
      category: category,
    };

    try {
      await handleItemAdd(payload);
      navigate("/admin-manager");
    } catch (err) {
      console.error("Error creating item:", err);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 pt-32">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-xl">
          <h2 className="text-2xl font-semibold mb-6">{t("designForm.title")}</h2>
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {/* Name fields */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t("designForm.name")} ({t("languages.en")})
              </label>
              <input
                type="text"
                value={form.name.en}
                onChange={(e) => handleLocalised(e, "name", "en")}
                placeholder={t("designForm.namePlaceholder") || ""}
                className="mt-1 w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t("designForm.name")} ({t("languages.lt")})
              </label>
              <input
                type="text"
                value={form.name.lt}
                onChange={(e) => handleLocalised(e, "name", "lt")}
                placeholder={t("designForm.namePlaceholder") || ""}
                className="mt-1 w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Description fields */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t("designForm.description")} ({t("languages.en")})
              </label>
              <textarea
                value={form.description.en}
                onChange={(e) => handleLocalised(e, "description", "en")}
                placeholder={t("designForm.descriptionPlaceholder") || ""}
                className="mt-1 w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                rows={3}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t("designForm.description")} ({t("languages.lt")})
              </label>
              <textarea
                value={form.description.lt}
                onChange={(e) => handleLocalised(e, "description", "lt")}
                placeholder={t("designForm.descriptionPlaceholder") || ""}
                className="mt-1 w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                rows={3}
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t("designForm.category")}
              </label>
              <div className="mt-1 flex gap-2 items-center">
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 bg-white"
                  required
                >
                  <option value="" disabled hidden>
                    {t("designForm.categoryPlaceholder")}
                  </option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name[i18n.language as "en" | "lt"] || cat.name.en}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Manufacturing ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t("designForm.manufacturingId")}
              </label>
              <input
                name="manufacturingID"
                type="text"
                value={form.manufacturingID}
                onChange={handleChange}
                placeholder={t("designForm.manufacturingIdPlaceholder") || ""}
                className="mt-1 w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Stock */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t("designForm.stock")}
              </label>
              <input
                name="stock"
                type="number"
                value={form.stock}
                onChange={handleChange}
                placeholder={t("designForm.stockPlaceholder") || ""}
                className="mt-1 w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t("designForm.price")}
              </label>
              <input
                name="price"
                type="number"
                value={form.price}
                onChange={handleChange}
                placeholder={t("designForm.pricePlaceholder") || ""}
                className="mt-1 w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t("designForm.images")}
              </label>
              {form.images.map((img, index) => (
                <div key={index} className="flex items-center gap-2 mt-1">
                  <input
                    type="text"
                    value={img}
                    onChange={(e) => {
                      const updated = [...form.images];
                      updated[index] = e.target.value;
                      setForm((prevForm) => ({ ...prevForm, images: updated }));
                    }}
                    placeholder={t("designForm.imagePlaceholder") || ""}
                    className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  {form.images.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const filtered = form.images.filter((_, i) => i !== index);
                        setForm((prevForm) => ({ ...prevForm, images: filtered }));
                      }}
                      className="text-red-500 hover:text-red-700"
                      title={t("designForm.removeImage")}
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => setForm((prevForm) => ({ ...prevForm, images: [...prevForm.images, ""] }))}
                className="mt-2 flex items-center text-blue-600 hover:text-blue-800 text-sm"
              >
                <PlusIcon className="w-5 h-5 mr-1" />
                {t("designForm.addImage")}
              </button>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="w-full bg-gray-300 text-gray-800 py-2 rounded-md hover:bg-gray-400 transition flex items-center justify-center"
              >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                {t("designForm.back")}
              </button>
              <button
                type="submit"
                className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition"
              >
                {t("designForm.submit")}
              </button>
            </div>
          </form>
        </div>
      </div>      
    </>
  );
};

export default AddDesign;
