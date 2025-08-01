import React, { useState, useRef } from 'react';
import { X, Upload, FileSpreadsheet, AlertCircle, CheckCircle, Pill, Download } from 'lucide-react';
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

                // Validate headers
                const requiredHeaders = ['name', 'price', 'quantity'];
                const missingHeaders = requiredHeaders.filter(header => 
                    !headers.some(h => h?.toString().toLowerCase().includes(header.toLowerCase()))
                );

                if (missingHeaders.length > 0) {
                    setError(`Missing required columns: ${missingHeaders.join(', ')}`);
                    setPreviewData([]);
                    return;
                }

                // Map data to preview format
                const mappedData = rows.map((row, index) => {
                    const rowData = {};
                    headers.forEach((header, colIndex) => {
                        const headerKey = header.toString().toLowerCase();
                        rowData[headerKey] = row[colIndex] !== undefined ? row[colIndex] : '';
                    });

                    return {
                        id: index + 1,
                        name: rowData.name || '',
                        price: rowData.price || 0,
                        quantity: rowData.quantity || '',
                        unit: rowData.unit || 'piece',
                        unitValue: rowData.unitvalue || '1',
                        category: rowData.category || '',
                        subcategory: rowData.subcategory || 'general',
                        description: rowData.description || '',
                        foodType: rowData.foodtype || 'veg',
                        inStock: rowData.instock === 'true' || rowData.instock === true || rowData.instock === 1,
                        photos: rowData.photos || '',
                        expiryDate: rowData.expirydate || '',
                        storageZone: rowData.storagezone || 'general',
                        rack: rowData.rack || '',
                        shelf: rowData.shelf || '',
                        bin: rowData.bin || '',
                        batchNumber: rowData.batchnumber || '',
                        requiresPrescription: rowData.requiresprescription === 'true' || 
                                           rowData.requiresprescription === true || 
                                           rowData.requiresprescription === 1 || 
                                           false,
                        isLooseItem: rowData.islooseitem === 'true' || 
                                  rowData.islooseitem === true || 
                                  rowData.islooseitem === 1 || 
                                  false
                    };
                });

                setPreviewData(mappedData);
                setSuccess(`Successfully parsed ${mappedData.length} items`);
            } catch (err) {
                setError('Error parsing file. Please check the format.');
                setPreviewData([]);
                console.error('Error parsing file:', err);
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
            const items = previewData.map(item => ({
                name: item.name,
                totalPrice: parseFloat(item.price) || 0,
                quantity: parseInt(item.quantity) || 0,
                unit: item.unit || 'piece',
                unitValue: item.unitValue || '1',
                category: item.category,
                subcategory: item.subcategory,
                description: item.description,
                foodType: item.foodType,
                inStock: item.inStock,
                photos: item.photos,
                expiryDate: item.expiryDate,
                storageZone: item.storageZone,
                rack: item.rack,
                shelf: item.shelf,
                bin: item.bin,
                batchNumber: item.batchNumber,
                requiresPrescription: item.requiresPrescription,
                isLooseItem: item.isLooseItem
            }));

            await onImport(items);
            setSuccess(`Successfully imported ${items.length} items`);
            setTimeout(handleClose, 1500);
        } catch (err) {
            setError('Error importing data: ' + err.message);
            console.error('Import error:', err);
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
            [
                'name', 'price', 'quantity', 'unit', 'unitValue', 'category', 'subcategory', 'description',
                'foodType', 'inStock', 'expiryDate', 'storageZone', 'rack',
                'shelf', 'bin', 'batchNumber', 'requiresPrescription', 'isLooseItem'
            ],
            [
                'Paracetamol 500mg', '5.00', '100', 'piece', '500mg', 'Medicines', 'Tablets', 'Pain reliever',
                'veg', 'true', '2024-12-31', 'general', 'A',
                '2', '3', 'BATCH001', 'false', 'false'
            ],
            [
                'Amoxicillin 250mg', '8.50', '50', 'box', '250mg', 'Medicines', 'Capsules', 'Antibiotic',
                'veg', 'true', '2024-10-15', 'general', 'B',
                '1', '5', 'BATCH002', 'true', 'false'
            ],
            [
                'Insulin Vial', '450.00', '20', 'bottle', '10ml', 'Medicines', 'Injections', 'Diabetes medication',
                'veg', 'true', '2024-06-30', 'refrigerated', 'C',
                '1', '1', 'BATCH003', 'true', 'false'
            ],
            [
                'Rice', '50.00', '10', 'kg', '1kg', 'Groceries', 'Grains', 'Basmati rice',
                'veg', 'true', '2025-12-31', 'general', 'D',
                '3', '2', 'BATCH004', 'false', 'true'
            ],
            [
                'Loose Nails', '0.50', '500', 'piece', '1', 'Hardware', 'Fasteners', 'Assorted nails',
                'veg', 'true', '', 'general', 'E',
                '4', '1', '', 'false', 'true'
            ]
        ];

        const ws = XLSX.utils.aoa_to_sheet(templateData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Inventory');
        XLSX.writeFile(wb, 'inventory_template.xlsx');
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <FileSpreadsheet className="w-6 h-6 text-blue-600" />
                        <h2 className="text-xl font-semibold text-gray-800">Import Inventory</h2>
                    </div>
                    <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h3 className="font-semibold text-blue-800 mb-2">Instructions:</h3>
                        <ul className="text-sm text-blue-700 space-y-1">
                            <li>• Upload Excel (.xlsx, .xls) or CSV (.csv) file</li>
                            <li>• Required columns: name, price, quantity</li>
                            <li>• Unit options: kg, ltr, piece, box, bottle, packet, etc.</li>
                            <li>• Unit Value: Quantity per unit (e.g., 500mg, 1kg, 10ml)</li>
                            <li>• Medical fields: storageZone, rack, shelf, bin, batchNumber, requiresPrescription</li>
                            <li>• storageZone options: general, refrigerated, controlled, hazardous</li>
                            <li>• isLooseItem: Set to true for items sold individually (like nails, screws, etc.)</li>
                        </ul>
                        <button
                            onClick={downloadTemplate}
                            className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                        >
                            <Download size={16} /> Download Template
                        </button>
                    </div>

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
                                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md font-medium"
                            >
                                Choose File
                            </button>
                            <p className="text-gray-500 mt-2">
                                {file ? `Selected: ${file.name}` : 'No file selected'}
                            </p>
                        </div>
                    </div>

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

                    {previewData.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                Preview ({previewData.length} items)
                            </h3>
                            <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Value</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loose</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Storage</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Batch</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rx</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expiry</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {previewData.slice(0, 5).map((item) => (
                                            <tr key={item.id}>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{item.name}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">₹{item.price}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{item.quantity}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{item.unit}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{item.unitValue}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm">
                                                    {item.isLooseItem ? (
                                                        <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                                                            Yes
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                                                            No
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                                        item.storageZone === 'refrigerated' ? 'bg-blue-100 text-blue-800' :
                                                        item.storageZone === 'controlled' ? 'bg-purple-100 text-purple-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {item.storageZone}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                                    {item.rack && `${item.rack}-${item.shelf}-${item.bin}`}
                                                </td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{item.batchNumber}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm">
                                                    {item.requiresPrescription ? (
                                                        <span className="flex items-center gap-1 text-red-600">
                                                            <Pill size={14} /> Yes
                                                        </span>
                                                    ) : 'No'}
                                                </td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{item.expiryDate}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {previewData.length > 5 && (
                                    <p className="text-sm text-gray-500 p-2">
                                        Showing first 5 of {previewData.length} items
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleImport}
                        disabled={!previewData.length || loading}
                        className="px-6 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-md font-medium flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Importing...
                            </>
                        ) : (
                            <>
                                <Upload size={16} />
                                Import Items
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImportExcelModal;