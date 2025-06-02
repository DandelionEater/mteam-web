import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { PlusIcon, TrashIcon, ArrowLeftIcon } from "@heroicons/react/24/solid";

type FormState = {
  name: { en: string; lt: string };
  description: { en: string; lt: string };
  category: string;
  stock: string;
  price: string;
  images: string[];
  manufacturingId: string;
};

const AddDesign = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>({
    name: { en: "", lt: "" },
    description: { en: "", lt: "" },
    category: "",
    stock: "",
    price: "",
    images: [""],
    manufacturingId: "",
  });

  const handleLocalizedChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: keyof Pick<FormState, "name" | "description">,
    lang: "en" | "lt"
  ) => {
    setForm((prevForm) => ({
      ...prevForm,
      [field]: {
        ...prevForm[field],
        [lang]: e.target.value,
      },
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("New design data:", form);
  };

  return (
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
              onChange={(e) => handleLocalizedChange(e, "name", "en")}
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
              onChange={(e) => handleLocalizedChange(e, "name", "lt")}
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
              onChange={(e) => handleLocalizedChange(e, "description", "en")}
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
              onChange={(e) => handleLocalizedChange(e, "description", "lt")}
              placeholder={t("designForm.descriptionPlaceholder") || ""}
              className="mt-1 w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              rows={3}
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700">{t("designForm.category")}</label>
            <input
              name="category"
              type="text"
              value={form.category}
              onChange={handleChange}
              placeholder={t("designForm.categoryPlaceholder") || ""}
              className="mt-1 w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Manufacturing ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t("designForm.manufacturingId")}
            </label>
            <input
              name="manufacturingId"
              type="text"
              value={form.manufacturingId}
              onChange={handleChange}
              placeholder={t("designForm.manufacturingIdPlaceholder") || ""}
              className="mt-1 w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
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
              placeholder={t("designForm.stockPlaceholder") || ""}
              className="mt-1 w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
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
              placeholder={t("designForm.pricePlaceholder") || ""}
              className="mt-1 w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
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
  );
};

export default AddDesign;
