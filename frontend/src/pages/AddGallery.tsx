import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { PlusIcon, TrashIcon, ArrowLeftIcon } from "@heroicons/react/24/solid";

type LocalizedString = {
  en: string;
  lt: string;
};

type GalleryEntryForm = {
  name: LocalizedString;
  description: LocalizedString;
  images: string[];
};

const AddGallery = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [form, setForm] = useState<GalleryEntryForm>({
    name: { en: "", lt: "" },
    description: { en: "", lt: "" },
    images: [""],
  });

  const handleLocalizedChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: keyof Pick<GalleryEntryForm, "name" | "description">,
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

  const handleImageChange = (index: number, value: string) => {
    const updatedImages = [...form.images];
    updatedImages[index] = value;
    setForm((prevForm) => ({ ...prevForm, images: updatedImages }));
  };

  const addImageInput = () => {
    setForm((prevForm) => ({ ...prevForm, images: [...prevForm.images, ""] }));
  };

  const removeImageInput = (index: number) => {
    const filteredImages = form.images.filter((_, i) => i !== index);
    setForm((prevForm) => ({ ...prevForm, images: filteredImages }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Gallery entry data:", form);
    // Submit logic here
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 pt-32">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-xl">
        <h2 className="text-2xl font-semibold mb-6">{t("galleryForm.title")}</h2>
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t("galleryForm.name")} ({t("languages.en")})
            </label>
            <input
              type="text"
              value={form.name.en}
              onChange={(e) => handleLocalizedChange(e, "name", "en")}
              placeholder={t("galleryForm.namePlaceholder") || ""}
              className="mt-1 w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t("galleryForm.name")} ({t("languages.lt")})
            </label>
            <input
              type="text"
              value={form.name.lt}
              onChange={(e) => handleLocalizedChange(e, "name", "lt")}
              placeholder={t("galleryForm.namePlaceholder") || ""}
              className="mt-1 w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t("galleryForm.description")} ({t("languages.en")})
            </label>
            <textarea
              value={form.description.en}
              onChange={(e) => handleLocalizedChange(e, "description", "en")}
              placeholder={t("galleryForm.descriptionPlaceholder") || ""}
              className="mt-1 w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t("galleryForm.description")} ({t("languages.lt")})
            </label>
            <textarea
              value={form.description.lt}
              onChange={(e) => handleLocalizedChange(e, "description", "lt")}
              placeholder={t("galleryForm.descriptionPlaceholder") || ""}
              className="mt-1 w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              rows={3}
              required
            />
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700">{t("galleryForm.images")}</label>
            {form.images.map((img, index) => (
              <div key={index} className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  value={img}
                  onChange={(e) => handleImageChange(index, e.target.value)}
                  placeholder={t("galleryForm.imagePlaceholder") || ""}
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                />
                {form.images.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeImageInput(index)}
                    className="text-red-500 hover:text-red-700"
                    title={t("galleryForm.removeImage")}
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addImageInput}
              className="mt-2 flex items-center text-blue-600 hover:text-blue-800 text-sm"
            >
              <PlusIcon className="w-5 h-5 mr-1" />
              {t("galleryForm.addImage")}
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
              {t("galleryForm.back")}
            </button>
            <button
              type="submit"
              className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition"
            >
              {t("galleryForm.submit")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddGallery;