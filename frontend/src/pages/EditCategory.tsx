import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import { fetchCategories, updateCategory } from "../dbMiddleware/CategoryCRUD";
import { useToast } from "../components/ToastContext";

type LocalizedString = {
  en: string;
  lt: string;
};

type CategoryForm = {
  name: LocalizedString;
};

const EditCategory = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { showToast } = useToast();

  const [form, setForm] = useState<CategoryForm>({
    name: { en: "", lt: "" },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError(t("categories.invalidId"));
      setLoading(false);
      return;
    }
    const fetchCategory = async () => {
      try {
        const categories = await fetchCategories();
        const category = categories.find((cat) => cat.id === id);
        if (!category) {
            setError(t("categories.notFound"));
        } else {
            setForm({
                name: {
                en: category.name.en ?? "",
                lt: category.name.lt ?? "",
                },
            });
        }
      } catch (err) {
        setError(t("categories.fetchError"));
      } finally {
        setLoading(false);
      }
    };
    fetchCategory();
  }, [id, t]);

  const handleLocalizedChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    lang: "en" | "lt"
  ) => {
    setForm((prevForm) => ({
      ...prevForm,
      name: {
        ...prevForm.name,
        [lang]: e.target.value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      await updateCategory(id, form);
      navigate(-1);
      showToast({
          type: "info",
          message: t("adminToast.info")
      });
    } catch (err) {
      setError(t("categories.updateFailed"));
      showToast({
          type: "error",
          message: t("adminToast.error")
      });
    }
  };

  if (loading) return <div>{t("loading")}</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 pt-32">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-6">{t("categories.editCategory")}</h2>
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {/* Name EN */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t("categories.name")} ({t("languages.en")})
            </label>
            <input
              type="text"
              value={form.name.en}
              onChange={(e) => handleLocalizedChange(e, "en")}
              placeholder={t("categories.namePlaceholder") || ""}
              className="mt-1 w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Name LT */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t("categories.name")} ({t("languages.lt")})
            </label>
            <input
              type="text"
              value={form.name.lt}
              onChange={(e) => handleLocalizedChange(e, "lt")}
              placeholder={t("categories.namePlaceholder") || ""}
              className="mt-1 w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-between pt-4 gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-full bg-gray-300 text-gray-800 py-2 rounded-md hover:bg-gray-400 transition flex items-center justify-center"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              {t("categories.back")}
            </button>
            <button
              type="submit"
              className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition"
            >
              {t("categories.submit")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCategory;
