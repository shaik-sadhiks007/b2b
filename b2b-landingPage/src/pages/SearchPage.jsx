import { useState } from 'react'
import { Search } from 'lucide-react'
import Navbar from '../components/Navbar'
import { useLocationContext } from '../context/LocationContext'

const cuisines = [
  { name: 'Biryani', img: 'https://img.freepik.com/free-photo/biryani-rice-with-chicken-indian-food_1150-11180.jpg?w=400' },
  { name: 'Pizzas', img: 'https://img.freepik.com/free-photo/pizza-with-tomatoes-cheese_144627-18645.jpg?w=400' },
  { name: 'Rolls', img: 'https://img.freepik.com/free-photo/side-view-chicken-wrap-with-vegetables_141793-15542.jpg?w=400' },
  { name: 'Burger', img: 'https://img.freepik.com/free-photo/front-view-burger-stand_141793-15544.jpg?w=400' },
  { name: 'Tea', img: 'https://img.freepik.com/free-photo/tea-cup-table_144627-18647.jpg?w=400' },
  { name: 'Chinese', img: 'https://img.freepik.com/free-photo/chinese-noodles-with-vegetables_2829-14218.jpg?w=400' },
  { name: 'Cake', img: 'https://img.freepik.com/free-photo/slice-cake-with-berries_144627-18648.jpg?w=400' },
  { name: 'Dessert', img: 'https://img.freepik.com/free-photo/waffles-with-berries_144627-18649.jpg?w=400' },
  { name: 'North Indian', img: 'https://img.freepik.com/free-photo/indian-cuisine-dish_1150-11181.jpg?w=400' },
  { name: 'South Indian', img: 'https://img.freepik.com/free-photo/idli-sambar-traditional-south-indian-food_1150-11182.jpg?w=400' },
  { name: 'Sandwich', img: 'https://img.freepik.com/free-photo/sandwich-with-ham-cheese-lettuce-tomato_144627-18650.jpg?w=400' },
  { name: 'Ice cream', img: 'https://img.freepik.com/free-photo/ice-cream-balls-bowl_144627-18651.jpg?w=400' },
]

function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const {
    location,
    setLocation,
    suggestions,
    showSuggestions,
    setShowSuggestions,
    fetchLocationSuggestions,
    onLocationSelect,
    onAllowLocation
  } = useLocationContext();

  const handleSearch = (e) => {
    e.preventDefault()
    // TODO: Implement search functionality
    console.log('Searching for:', searchQuery, 'in location:', location)
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar alwaysVisible />
      <main className="container mx-auto px-4 pt-24">
        <form onSubmit={handleSearch} className="mb-12 flex justify-center">
          <div className="relative w-full max-w-3xl">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for restaurants and food"
              className="w-full pl-12 pr-12 py-5 rounded-lg border border-gray-300 focus:border-black outline-none text-2xl font-medium placeholder-gray-400 shadow-sm"
            />
            <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black">
              <Search size={28} />
            </button>
          </div>
        </form>

        <h2 className="text-2xl font-bold mb-6 ml-2">Popular Cuisines</h2>
        <div className="flex gap-8 overflow-x-auto pb-4">
          {cuisines.map((cuisine) => (
            <div key={cuisine.name} className="flex flex-col items-center min-w-[90px]">
              <img
                src={cuisine.img}
                alt={cuisine.name}
                className="w-20 h-20 rounded-full object-cover border border-gray-200 shadow-sm mb-2"
              />
              <span className="text-base font-medium text-gray-800 whitespace-nowrap">{cuisine.name}</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

export default SearchPage 