# Excel Import Feature for Menu Management

## Overview
The Excel import feature allows restaurant owners to bulk import menu items from Excel files (.xlsx, .xls) or CSV files (.csv) directly into their menu system.

## How to Use

### 1. Access the Feature
- Navigate to the Menu Editor page
- Click the "Import Excel" button (yellow button) in the top action bar

### 2. Prepare Your Excel File
Your Excel file must contain the following columns:

| Column Name | Required | Description | Example Values |
|-------------|----------|-------------|----------------|
| name | Yes | Item name | "Chicken Biryani" |
| price | Yes | Item price (numeric) | "250" |
| category | Yes | Main category | "Main Course" |
| subcategory | Yes | Subcategory | "Biryani" |
| description | Yes | Item description | "Delicious chicken biryani" |
| foodType | Yes | Food type | "veg" or "non-veg" |
| inStock | Yes | Stock availability | "true" or "false" |
| photos | No | Image URL (optional) | "https://example.com/image.jpg" |

### 3. Excel Template
- Click "Download Template" in the import modal to get a sample Excel file
- Use this template as a starting point for your data

### 4. Import Process
1. **Upload File**: Click "Choose File" and select your Excel file
2. **Preview Data**: Review the parsed data in the preview table
3. **Import**: Click "Import Data" to add items to your menu

## Data Format Examples

### Sample Excel Data:
```
name,price,category,subcategory,description,foodType,inStock,photos
Chicken Biryani,250,Main Course,Biryani,Delicious chicken biryani,non-veg,true,
Paneer Tikka,180,Starters,Tandoor,Grilled paneer tikka,veg,true,
Butter Chicken,300,Main Course,Curries,Creamy butter chicken,non-veg,true,
```

### Important Notes:
- **Headers are case-insensitive**: "Name", "NAME", or "name" all work
- **Price should be numeric**: Use numbers without currency symbols
- **foodType values**: Use "veg" or "non-veg" (case-insensitive)
- **inStock values**: Use "true"/"false" or 1/0
- **Empty cells**: Will be set to default values (empty string for text, 0 for price, true for inStock)

## Error Handling

The system will show errors for:
- Invalid file formats
- Missing required columns
- Data parsing issues
- Import failures

## Benefits
- **Bulk Import**: Add hundreds of menu items at once
- **Data Validation**: Automatic validation of required fields
- **Preview**: Review data before importing
- **Template**: Download sample template for easy setup
- **Error Handling**: Clear error messages for troubleshooting

## Technical Details
- Supports Excel (.xlsx, .xls) and CSV (.csv) formats
- Uses the xlsx library for file parsing
- Integrates with existing bulk add functionality
- Maintains data structure consistency with manual additions 