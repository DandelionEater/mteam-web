import React, { useEffect, useRef } from 'react';
import { XMarkIcon } from "@heroicons/react/24/solid";

interface DesignInfoProps {
  isOpen: boolean;
  onClose: () => void;
  name: string;
  description: string;
  price: string;
  image: string;
}

const DesignInfo: React.FC<DesignInfoProps> = ({
  isOpen,
  onClose,
  name,
  description,
  price,
  image,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center px-4">
    {/* Modal */}
    <div
        ref={modalRef}
        className="bg-white p-6 rounded-xl max-w-xl w-full shadow-lg relative"
    >
        <img src={image} alt={name} className="w-full h-auto rounded-lg mb-4" />
        <h2 className="text-2xl font-bold mb-2">{name}</h2>
        <p className="text-gray-700 mb-4">{description}</p>
        <p className="text-lg font-semibold text-gray-900">Price: {price}</p>
    </div>

    {/* Close Button - floating and outside the modal */}
    <button
        onClick={onClose}
        className="absolute top-6 right-6 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition"
    >
        <XMarkIcon className="w-5 h-5 text-gray-700" />
    </button>
    </div>
  );
};

export default DesignInfo;
