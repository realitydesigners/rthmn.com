interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  pairName: string | null;
}

export const Modal = ({ isOpen, onClose, pairName }: ModalProps) => {
  if (!isOpen) return null;

  let modalContent = null;

  switch (pairName) {
    case 'USDJPY':
      modalContent = (
        <div className="fixed top-1/2 left-1/2 h-[50vh] w-[50vw] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-gray-600 bg-black/75 p-8 shadow-lg">
          <h2 className="mb-4 font-mono text-2xl font-bold text-white">
            USD/JPY Trading Pair
          </h2>
          <p className="mb-4 font-mono text-white">
            Current Trading Pair: {pairName}
          </p>
          <p className="font-mono text-sm text-gray-400">
            The USD/JPY (US Dollar/Japanese Yen) is one of the most traded
            currency pairs in the world. It represents the relationship between
            the world's leading reserve currency and the currency of Japan, the
            world's third largest economy.
          </p>
          <button
            type="button"
            className="absolute right-4 bottom-4 mt-4 rounded border border-gray-600 px-4 py-2 font-mono text-white hover:bg-gray-600"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      );
      break;
    case 'AUDUSD':
      modalContent = (
        <div className="fixed top-1/2 left-1/2 h-[50vh] w-[50vw] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-gray-600 bg-black/75 p-8 shadow-lg">
          <h2 className="mb-4 font-mono text-2xl font-bold text-white">
            USD/JPY Trading Pair
          </h2>
          <p className="mb-4 font-mono text-white">
            Current Trading Pair: {pairName}
          </p>
          <p className="font-mono text-sm text-gray-400">
            The USD/JPY (US Dollar/Japanese Yen) is one of the most traded
            currency pairs in the world. It represents the relationship between
            the world's leading reserve currency and the currency of Japan, the
            world's third largest economy.
          </p>
          <button
            type="button"
            className="absolute right-4 bottom-4 mt-4 rounded border border-gray-600 px-4 py-2 font-mono text-white hover:bg-gray-600"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      );
      break;

    default:
      modalContent = (
        <div className="fixed top-1/2 left-1/2 h-[50vh] w-[50vw] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-gray-600 bg-black/75 p-8 shadow-lg">
          <h2 className="mb-4 font-mono text-2xl font-bold text-white">
            Trading Pair Details
          </h2>
          <p className="mb-4 font-mono text-white">Selected Pair: {pairName}</p>
          <p className="font-mono text-sm text-gray-400">
            Information for this trading pair will be available soon.
          </p>
          <button
            type="button"
            className="absolute right-4 bottom-4 mt-4 rounded border border-gray-600 px-4 py-2 font-mono text-white hover:bg-gray-600"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      );
  }

  return (
    <dialog open={isOpen} className="bg-opacity-50 fixed inset-0 z-50 bg-black">
      {modalContent}
    </dialog>
  );
};
