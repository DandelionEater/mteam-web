import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import { handleCategoryAdd } from "../dbMiddleware/CategoryCRUD";

type LocalizedString = {
  en: string;
  lt: string;
};

type CategoryForm = {
  name: LocalizedString;
};

const AddCategory = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [form, setForm] = useState<CategoryForm>({
    name: { en: "", lt: "" },
  });

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
    console.log("handleSubmit called", form);
    try {
        await handleCategoryAdd(form);
        console.log("Category added successfully");
        navigate("/admin-manager");
    } catch (err) {
        console.error("Failed to add category:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 pt-32">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-6">{t("categories.addNewCategory")}</h2>
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

export default AddCategory;
