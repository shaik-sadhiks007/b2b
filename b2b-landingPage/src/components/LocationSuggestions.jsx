import { MapPin } from "lucide-react"

function LocationSuggestions({ suggestions, onSelect, onAllowLocation, showAllowLocation = true }) {
  if (suggestions.length === 0 && !showAllowLocation) return null

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
      {showAllowLocation && (
        <button
          onClick={onAllowLocation}
          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 border-b border-gray-100"
        >
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <MapPin className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-medium text-gray-900">Get current location</p>
            <p className="text-sm text-gray-500">Using GPS</p>
          </div>
        </button>
      )}
      
      {suggestions.map((suggestion, index) => (
        <button
          key={index}
          onMouseDown={() => onSelect(suggestion)}
          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 border-b border-gray-100 last:border-0"
        >
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <MapPin className="w-4 h-4 text-gray-600" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-medium text-gray-900">{suggestion.name}</p>
            <p className="text-sm text-gray-500">{suggestion.address}</p>
          </div>
        </button>
      ))}
    </div>
  )
}

export default LocationSuggestions 