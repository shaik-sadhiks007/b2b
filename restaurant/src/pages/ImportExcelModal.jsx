import React, { useState, useRef } from 'react';
import { X, Upload, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';
import * as XLSX from 'xlsx';

const ImportExcelModal = ({ open, onClose, onImport }) => {
    const [file, setFile] = useState(null);
    const [previewData, setPreviewData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const fileInputRef = useRef(null);

    const handleFileUpload = (event) => {
        const uploadedFile = event.target.files[0];
        if (!uploadedFile) return;

        // Validate file type
        const validTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
            'application/vnd.ms-excel', // .xls
            'text/csv' // .csv
        ];

        if (!validTypes.includes(uploadedFile.type)) {
            setError('Please upload a valid Excel file (.xlsx, .xls) or CSV file (.csv)');
            return;
        }

        setFile(uploadedFile);
        setError('');
        setSuccess('');
        parseExcelFile(uploadedFile);
    };

    const parseExcelFile = (uploadedFile) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                // Remove empty rows and get headers
                const filteredData = jsonData.filter(row => row.some(cell => cell !== null && cell !== ''));
                const headers = filteredData[0] || [];
                const rows = filteredData.slice(1);

                // Validate headers (quantity is optional)
                const requiredHeaders = ['name', 'price', 'category', 'subcategory', 'description', 'foodType', 'inStock'];
                const missingHeaders = requiredHeaders.filter(header => 
                    !headers.some(h => h?.toString().toLowerCase().includes(header.toLowerCase()))
                );

                if (missingHeaders.length > 0) {
                    setError(`Missing required columns: ${missingHeaders.join(', ')}. Please ensure your Excel file has these columns.`);
                    setPreviewData([]);
                    return;
                }

                // Map data to preview format (include quantity if present)
                const mappedData = rows.map((row, index) => {
                    const rowData = {};
                    headers.forEach((header, colIndex) => {
                        rowData[header.toString().toLowerCase()] = row[colIndex] || '';
                    });
                    return {
                        id: index + 1,
                        name: rowData.name || '',
                        price: rowData.price || 0,
                        category: rowData.category || '',
                        subcategory: rowData.subcategory || 'general',
                        description: rowData.description || '',
                        foodType: rowData.foodtype || 'veg',
                        inStock: rowData.instock === 'true' || rowData.instock === true || rowData.instock === 1,
                        photos: rowData.photos || '',
                        quantity: rowData.quantity || ''
                    };
                });

                setPreviewData(mappedData);
                setSuccess(`Successfully parsed ${mappedData.length} items from Excel file`);
            } catch (err) {
                setError('Error parsing Excel file. Please check the file format.');
                setPreviewData([]);
            }
        };
        reader.readAsArrayBuffer(uploadedFile);
    };

    const handleImport = async () => {
        if (!previewData.length) {
            setError('No data to import');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Map previewData to the required flat format
            const items = previewData.map(item => ({
                name: item.name,
                totalPrice: parseFloat(item.price) || 0,
                category: item.category,
                subcategory: item.subcategory,
                quantity: item.quantity || '',
                foodType: item.foodType,
                inStock: item.inStock,
                photos: item.photos || '',
                description: item.description || ''
            }));

            await onImport(items);
            setSuccess(`Successfully imported ${items.length} items`);

            setTimeout(() => {
                handleClose();
            }, 2000);
        } catch (err) {
            setError('Error importing data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFile(null);
        setPreviewData([]);
        setError('');
        setSuccess('');
        setLoading(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        onClose();
    };

    const downloadTemplate = () => {
        const templateData = [
            ['name', 'price', 'category', 'subcategory', 'description', 'foodType', 'inStock', 'photos'],
            ['Chicken Biryani', '250', 'Main Course', 'Biryani', 'Delicious chicken biryani', 'non-veg', 'true', ''],
            ['Paneer Tikka', '180', 'Starters', 'Tandoor', 'Grilled paneer tikka', 'veg', 'true', ''],
            ['Butter Chicken', '300', 'Main Course', 'Curries', 'Creamy butter chicken', 'non-veg', 'true', '']
        ];

        const ws = XLSX.utils.aoa_to_sheet(templateData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Menu Template');
        XLSX.writeFile(wb, 'menu_template.xlsx');
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <FileSpreadsheet className="w-6 h-6 text-blue-600" />
                        <h2 className="text-xl font-semibold text-gray-800">Import Menu from Excel</h2>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    {/* Instructions */}
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h3 className="font-semibold text-blue-800 mb-2">Instructions:</h3>
                        <ul className="text-sm text-blue-700 space-y-1">
                            <li>• Upload an Excel file (.xlsx, .xls) or CSV file (.csv)</li>
                            <li>• Required columns: name, price, category, subcategory, description, foodType, inStock</li>
                            <li>• foodType should be 'veg' or 'non-veg'</li>
                            <li>• inStock should be 'true' or 'false'</li>
                            <li>• Preview your data before importing</li>
                        </ul>
                        <button
                            onClick={downloadTemplate}
                            className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium underline"
                        >
                            Download Template
                        </button>
                    </div>

                    {/* File Upload */}
                    <div className="mb-6">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".xlsx,.xls,.csv"
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md font-medium transition-colors"
                            >
                                Choose File
                            </button>
                            <p className="text-gray-500 mt-2">
                                {file ? `Selected: ${file.name}` : 'No file selected'}
                            </p>
                        </div>
                    </div>

                    {/* Error/Success Messages */}
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-red-500" />
                            <span className="text-red-700">{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <span className="text-green-700">{success}</span>
                        </div>
                    )}

                    {/* Preview Data */}
                    {previewData.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                Preview ({previewData.length} items)
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full border border-gray-200 rounded-lg">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Name</th>
                                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Price</th>
                                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Category</th>
                                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Subcategory</th>
                                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Food Type</th>
                                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">In Stock</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {previewData.slice(0, 10).map((item, index) => (
                                            <tr key={index} className="border-t border-gray-200">
                                                <td className="px-4 py-2 text-sm text-gray-800">{item.name}</td>
                                                <td className="px-4 py-2 text-sm text-gray-800">₹{item.price}</td>
                                                <td className="px-4 py-2 text-sm text-gray-800">{item.category}</td>
                                                <td className="px-4 py-2 text-sm text-gray-800">{item.subcategory}</td>
                                                <td className="px-4 py-2 text-sm text-gray-800">{item.foodType}</td>
                                                <td className="px-4 py-2 text-sm text-gray-800">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                                        item.inStock 
                                                            ? 'bg-green-100 text-green-800' 
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {item.inStock ? 'Yes' : 'No'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {previewData.length > 10 && (
                                    <p className="text-sm text-gray-500 mt-2">
                                        Showing first 10 items. Total: {previewData.length} items
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleImport}
                        disabled={!previewData.length || loading}
                        className="px-6 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-md font-medium transition-colors"
                    >
                        {loading ? 'Importing...' : 'Import Data'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImportExcelModal; 