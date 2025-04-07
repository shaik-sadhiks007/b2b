function CategoryShortcuts({ categories }) {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-4 mt-8">
        {categories.map((category, index) => (
          <a href="#" key={index} className="flex flex-col items-center gap-2">
            <div className={`w-16 h-16 rounded-full ${category.color} flex items-center justify-center text-2xl`}>
              {category.icon}
            </div>
            <span className="text-sm text-center">{category.name}</span>
          </a>
        ))}
      </div>
    )
  }
  
  export default CategoryShortcuts
  
  