import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const AddDesign = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    stock: "",
    price: "",
    image: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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
          <div>
            <label className="block text-sm font-medium text-gray-700">{t("designForm.name")}</label>
            <input
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">{t("designForm.description")}</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">{t("designForm.category")}</label>
            <input
              name="category"
              type="text"
              value={form.category}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">{t("designForm.stock")}</label>
            <input
              name="stock"
              type="number"
              value={form.stock}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">{t("designForm.price")}</label>
            <input
              name="price"
              type="number"
              value={form.price}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">{t("designForm.image")}</label>
            <input
              name="image"
              type="text"
              value={form.image}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex justify-between gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-full bg-gray-300 text-gray-800 py-2 rounded-md hover:bg-gray-400 transition"
            >
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
