import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { PlusIcon, TrashIcon, ArrowLeftIcon } from "@heroicons/react/24/solid";
import { fetchItemById, updateItem } from "../dbMiddleware/ItemCRUD";
import { Item } from "../model/Item.schema";
import { fetchCategories } from "../api/categoryService";
import i18n from "../i18n";
import { Category } from "../model/Category.schema";
import { useToast } from "../components/ToastContext";

type LocalizedString = { en: string; lt: string };

type FormState = {
  name: LocalizedString;
  description: LocalizedString;
  category: string;
  manufacturingID: string;
  stock: string;
  price: string;
  images: string[];
};

const EditDesign = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [form, setForm] = useState<FormState>({
    name: { en: "", lt: "" },
    description: { en: "", lt: "" },
    category: "",
    manufacturingID: "",
    stock: "",
    price: "",
    images: [""],
  });

  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Design loader
  useEffect(() => {
    if (!id) {
      setError(t("designForm.notFound"));
      setLoading(false);
      return;
    }
    setLoading(true);

    async function load() {
      try {
        const design: Item = await fetchItemById(id!);
        setForm({
          name: design.name || { en: "", lt: "" },
          description: design.description || { en: "", lt: "" },
          category: design.category,
          manufacturingID: design.manufacturingID,
          stock: design.stock.toString(),
          price: design.price.toString(),
          images: design.images.length > 0 ? design.images : [""],
        });
        setError(null);
      } catch (err: any) {
        setError(err.message || t("designForm.loadError"));
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id, t]);

  // Category loader
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-32">
        <p className="text-lg text-gray-700">{t("designForm.loading")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-32">
        <p className="text-lg text-red-600">{error}</p>
      </div>
    );
  }

  const handleLocalizedChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: keyof Pick<FormState, "name" | "description">,
    lang: "en" | "lt"
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        [lang]: e.target.value,
      },
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const updatedDesign = {
        _id: id!,
        name: form.name,
        description: form.description,
        category: form.category,
        manufacturingID: form.manufacturingID,
        stock: Number(form.stock),
        price: Number(form.price),
        images: form.images,
      };

      await updateItem(id!, updatedDesign);

      navigate(-1);

      showToast({
          type: "info",
          message: t("adminToast.info")
      });

    } catch (err: any) {
      console.error("Update failed:", err)
      showToast({
          type: "error",
          message: t("adminToast.error")
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 pt-32">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-xl">
        <h2 className="text-2xl font-semibold mb-6">{t("designForm.editTitle")}</h2>
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {/* Name localized */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t("designForm.name")} ({t("languages.en")})
            </label>
            <input
              type="text"
              value={form.name.en}
              onChange={(e) => handleLocalizedChange(e, "name", "en")}
              className="mt-1 w-full px-4 py-2 border rounded-md"
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
              onChange={(e) => handleLocalizedChange(e, "name", "lt")}
              className="mt-1 w-full px-4 py-2 border rounded-md"
              required
            />
          </div>

          {/* Description localized */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t("designForm.description")} ({t("languages.en")})
            </label>
            <textarea
              value={form.description.en}
              onChange={(e) => handleLocalizedChange(e, "description", "en")}
              rows={3}
              className="mt-1 w-full px-4 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t("designForm.description")} ({t("languages.lt")})
            </label>
            <textarea
              value={form.description.lt}
              onChange={(e) => handleLocalizedChange(e, "description", "lt")}
              rows={3}
              className="mt-1 w-full px-4 py-2 border rounded-md"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700">{t("designForm.category")}</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 bg-white"
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

          {/* Manufacturing ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700">{t("designForm.manufacturingId")}</label>
            <input
              name="manufacturingID"
              type="text"
              value={form.manufacturingID}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border rounded-md"
              required
            />
          </div>

          {/* Stock */}
          <div>
            <label className="block text-sm font-medium text-gray-700">{t("designForm.stock")}</label>
            <input
              name="stock"
              type="number"
              value={form.stock}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border rounded-md"
              required
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700">{t("designForm.price")}</label>
            <input
              name="price"
              type="number"
              value={form.price}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border rounded-md"
              required
            />
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700">{t("designForm.images")}</label>
            {form.images.map((img, index) => (
              <div key={index} className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  value={img}
                  onChange={(e) => {
                    const updated = [...form.images];
                    updated[index] = e.target.value;
                    setForm((prev) => ({ ...prev, images: updated }));
                  }}
                  className="w-full px-4 py-2 border rounded-md"
                  required
                />
                {form.images.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      const filtered = form.images.filter((_, i) => i !== index);
                      setForm((prev) => ({ ...prev, images: filtered }));
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
              onClick={() => setForm((prev) => ({ ...prev, images: [...prev.images, ""] }))}
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
              disabled={loading}
            >
              {t("designForm.save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDesign;
