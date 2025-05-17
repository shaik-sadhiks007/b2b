function CategoryShortcuts({ categories, selectedCategory, onCategorySelect }) {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-4 mt-8">
        {categories.map((category, index) => (
          <div 
            key={index} 
            className={`flex flex-col items-center gap-2 cursor-pointer transition-all duration-200 ${selectedCategory === category.value ? 'scale-110' : ''}`}
            onClick={() => onCategorySelect(category)}
          >
            <div className={`w-16 h-16 rounded-full ${category.color} flex items-center justify-center text-2xl ${selectedCategory === category.value ? 'ring-4 ring-blue-400' : ''}`}>
              {category.icon}
            </div>
            <span className={`text-sm text-center ${selectedCategory === category.value ? 'font-semibold text-blue-600' : ''}`}>
              {category.name}
            </span>
          </div>
        ))}
      </div>
    )
  }
  
  export default CategoryShortcuts
  
  