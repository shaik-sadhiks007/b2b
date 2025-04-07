import { X } from "lucide-react"

function LocationModal({ isOpen, onClose, onAllow, onManualAddress, isLoading }) {
  if (!isOpen) return null

  // Handle click outside modal
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={handleOverlayClick}>
      <div className="bg-white rounded-2xl max-w-md w-full p-6 relative shadow-xl mx-4">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
          <X size={24} />
        </button>

        <div className="flex flex-col items-center gap-6 py-4">
          <h2 className="text-2xl font-bold">Allow your location</h2>

          <div className="w-32 h-32 rounded-2xl bg-green-100 flex items-center justify-center">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 bg-green-500 rounded-full opacity-20 animate-ping"></div>
              <div className="absolute inset-3 bg-green-500 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-full"></div>
              </div>
              <div className="absolute inset-0 border-4 border-green-500 rounded-full"></div>
            </div>
          </div>

          <p className="text-center text-base text-gray-600">Skip the typing and see services near you</p>

          <button
            className={`w-full py-3 bg-blue-600 text-white rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors relative ${
              isLoading ? 'cursor-not-allowed opacity-75' : ''
            }`}
            onClick={onAllow}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="opacity-0">Allow</span>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              </>
            ) : (
              'Allow'
            )}
          </button>

          <button 
            className={`text-blue-600 hover:underline ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`} 
            onClick={onManualAddress}
            disabled={isLoading}
          >
            Type in delivery address instead
          </button>
        </div>
      </div>
    </div>
  )
}

export default LocationModal

