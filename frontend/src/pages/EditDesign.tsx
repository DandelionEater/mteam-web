import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { designs } from '../data/designs';

const EditDesign = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const designId = Number(id);
  const existingDesign = designs.find((d) => d.id === designId);

  const [form, setForm] = useState({
    name: '',
    description: '',
    category: '',
    stock: '',
    price: '',
    image: '',
  });

  useEffect(() => {
    if (existingDesign) {
      setForm({
        name: t(existingDesign.nameKey),
        description: t(existingDesign.descriptionKey),
        category: t(existingDesign.categoryKey),
        stock: String(existingDesign.stock),
        price: String(existingDesign.price),
        image: existingDesign.image,
      });
    }
  }, [existingDesign, t]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Updated design data:', form);
  };

  if (!existingDesign) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-32">
        <p className="text-lg text-gray-700">{t('designForm.notFound')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 pt-32">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-xl">
        <h2 className="text-2xl font-semibold mb-6">{t("designForm.editTitle")}</h2>
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

          <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4">
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
              {t("designForm.save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDesign;
