import { X, Download, Upload, Trash, HelpCircle, Pill } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const BulkAddModal = ({ open, onClose, onBulkAdd, preSelectedCategory = '', preSelectedSubcategory = '', businessCategory = 'general' }) => {
    const [bulkData, setBulkData] = useState('');
    const [category, setCategory] = useState(preSelectedCategory);
    const [subcategory, setSubcategory] = useState(preSelectedSubcategory);
    const [isProcessing, setIsProcessing] = useState(false);
    const [parsedItems, setParsedItems] = useState([]);
    const [parseError, setParseError] = useState('');
    const [showFormatHelp, setShowFormatHelp] = useState(false);

    // Define the default header order as a constant
    const DEFAULT_HEADER = [
        'Name', 'Price', 'Quantity', 'Loose Item', 'Unit', 'UnitValue', 'Category', 'Subcategory', 'Food Type', 
        'Description', 'In Stock', 'Expiry Date', ...(businessCategory === 'medical' ? ['Storage Zone', 'Rack', 
        'Shelf', 'Bin', 'Batch Number', 'Requires Prescription'] : [])
    ];

    // Sample data format for reference
    const sampleData = `${DEFAULT_HEADER.join(',')}
${businessCategory === 'medical' ? 
`Paracetamol 500mg,5.00,100,false,piece,500mg,Medicines,Tablets,veg,Pain reliever,true,2024-12-31,general,A,2,3,BX2023-045,false
Amoxicillin 250mg,8.50,50,false,box,250mg,Medicines,Capsules,veg,Antibiotic,true,2024-10-15,general,B,1,5,AMX2023-102,true
Insulin Vial,450.00,20,false,bottle,10ml,Medicines,Injections,veg,Diabetes medication,true,2024-06-30,refrigerated,C,1,1,INS2024-001,true` : 
`Rice,2.50,1,true,kg,,Groceries,Staples,veg,Long grain rice,true,2025-01-15
Flour,1.80,1,true,kg,,Groceries,Staples,veg,Wheat flour,true,2025-03-15`}`;

    // Parse CSV to items whenever bulkData changes
    useEffect(() => {
        if (!bulkData.trim()) {
            setParseError('');
            // If no CSV and no parsed items, show one empty row
            setParsedItems(prev => (prev.length === 0 ? [
                {
                    name: '',
                    totalPrice: '',
                    quantity: null,
                    looseItem: false,
                    unit: 'piece',
                    unitValue: '',
                    category: category || '',
                    subcategory: subcategory || '',
                    foodType: 'veg',
                    description: '',
                    inStock: true,
                    expiryDate: '',
                    ...(businessCategory === 'medical' ? {
                        storageZone: 'general',
                        rack: '',
                        shelf: '',
                        bin: '',
                        batchNumber: '',
                        requiresPrescription: false
                    } : {})
                }
            ] : prev));
            return;
        }
        try {
            const items = parseBulkData(bulkData);
            setParsedItems(items);
            setParseError('');
        } catch (err) {
            setParsedItems([]);
            setParseError(err.message);
        }
    }, [bulkData]);

    // Handle editing a field in a row
    const handleItemChange = (idx, field, value) => {
        setParsedItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
    };

    // Add a new empty row
    const handleAddRow = () => {
        setParsedItems(prev => [
            ...prev,
            {
                name: '',
                totalPrice: '',
                quantity: null,
                looseItem: false,
                unit: 'piece',
                unitValue: '',
                category: category || '',
                subcategory: subcategory || '',
                foodType: 'veg',
                description: '',
                inStock: true,
                expiryDate: '',
                ...(businessCategory === 'medical' ? {
                    storageZone: 'general',
                    rack: '',
                    shelf: '',
                    bin: '',
                    batchNumber: '',
                    requiresPrescription: false
                } : {})
            }
        ]);
    };

    // Remove a row
    const handleRemoveRow = (idx) => {
        setParsedItems(prev => prev.filter((_, i) => i !== idx));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!parsedItems.length) {
            toast.error('No items to add');
            return;
        }
        setIsProcessing(true);
        try {
            // Add category and subcategory to items if not specified
            const processedItems = parsedItems.map(item => ({
                ...item,
                unit: item.looseItem ? (item.unit || 'piece') : 'piece',
                unitValue: item.looseItem ? (item.unitValue || '') : '',
                category: item.category || category || 'uncategorized',
                subcategory: item.subcategory || subcategory || 'general',
                foodType: item.foodType || 'veg',
                inStock: item.inStock !== undefined ? item.inStock : true,
                quantity: item.quantity ? parseInt(item.quantity) : null,
                totalPrice: parseFloat(item.totalPrice) || 0,
                expiryDate: item.expiryDate || '',
                ...(businessCategory === 'medical' ? {
                    storageZone: item.storageZone || 'general',
                    rack: item.rack || '',
                    shelf: item.shelf || '',
                    bin: item.bin || '',
                    batchNumber: item.batchNumber || '',
                    requiresPrescription: item.requiresPrescription || false
                } : {}),
                looseItem: item.looseItem || false
            }));
            // Filter out items missing required fields
            const validItems = processedItems.filter(item => {
                const hasQuantity = item.quantity !== null && item.quantity > 0;
                return item.name && item.totalPrice && hasQuantity;
            });
            if (validItems.length === 0) {
                toast.error('No valid items found (missing name, price or quantity)');
                return;
            }
            await onBulkAdd(validItems);
            toast.success(`Successfully added ${validItems.length} items`);
            setBulkData('');
            setParsedItems([]);
            onClose();
        } catch (error) {
            toast.error('Error processing bulk data: ' + error.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const parseBulkData = (data) => {
        const lines = data.trim().split('\n');
        if (lines.length < 1) {
            throw new Error('Please enter at least one data row');
        }

        // Parse header row
        const headerRow = lines[0].split(',').map(h => h.trim().toLowerCase());
        let dataStartIdx = 1;
        // If the first row does not contain 'name' and 'price', treat all as data (no header)
        if (!(headerRow.includes('name') && headerRow.includes('price'))) {
            dataStartIdx = 0;
        }

        const items = [];
        for (let i = dataStartIdx; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            const values = line.split(',').map(v => v.trim());
            let item = {
                name: '',
                totalPrice: '',
                quantity: null,
                looseItem: false,
                unit: 'piece',
                unitValue: '',
                category: '',
                subcategory: '',
                foodType: 'veg',
                description: '',
                inStock: true,
                expiryDate: '',
                ...(businessCategory === 'medical' ? {
                    storageZone: 'general',
                    rack: '',
                    shelf: '',
                    bin: '',
                    batchNumber: '',
                    requiresPrescription: false
                } : {})
            };
            if (dataStartIdx === 1) {
                // Map by header
                headerRow.forEach((header, idx) => {
                    const value = values[idx];
                    switch (header) {
                        case 'name':
                        case 'item name':
                            item.name = value;
                            break;
                        case 'price':
                        case 'totalprice':
                            item.totalPrice = value;
                            break;
                        case 'quantity':
                        case 'qty':
                            item.quantity = value ? parseInt(value) : null;
                            break;
                        case 'loose item':
                        case 'looseitem':
                            item.looseItem = value ? (value.toLowerCase() === 'true' || value.toLowerCase() === 'yes' || value === '1') : false;
                            break;
                        case 'unit':
                            item.unit = value || 'piece';
                            break;
                        case 'unitvalue':
                        case 'unit value':
                            item.unitValue = value || '';
                            break;
                        case 'category':
                            item.category = value;
                            break;
                        case 'subcategory':
                            item.subcategory = value;
                            break;
                        case 'food type':
                        case 'foodtype':
                            item.foodType = value ? value.toLowerCase() : 'veg';
                            break;
                        case 'description':
                        case 'desc':
                            item.description = value;
                            break;
                        case 'in stock':
                        case 'instock':
                        case 'stock':
                            item.inStock = value ? (value.toLowerCase() === 'true' || value.toLowerCase() === 'yes' || value === '1') : true;
                            break;
                        case 'expiry date':
                        case 'expirydate':
                            item.expiryDate = value || '';
                            break;
                        case 'storage zone':
                        case 'storagezone':
                            if (businessCategory === 'medical') item.storageZone = value || 'general';
                            break;
                        case 'rack':
                            if (businessCategory === 'medical') item.rack = value || '';
                            break;
                        case 'shelf':
                            if (businessCategory === 'medical') item.shelf = value || '';
                            break;
                        case 'bin':
                            if (businessCategory === 'medical') item.bin = value || '';
                            break;
                        case 'batch number':
                        case 'batchnumber':
                            if (businessCategory === 'medical') item.batchNumber = value || '';
                            break;
                        case 'requires prescription':
                        case 'requiresprescription':
                            if (businessCategory === 'medical') item.requiresPrescription = value ? (value.toLowerCase() === 'true' || value.toLowerCase() === 'yes' || value === '1') : false;
                            break;
                    }
                });
            } else {
                // No header, use default order
                item = {
                    name: values[0] || '',
                    totalPrice: values[1] || '',
                    quantity: values[2] ? parseInt(values[2]) : null,
                    looseItem: typeof values[3] !== 'undefined' ? (values[3].toLowerCase() === 'true' || values[3].toLowerCase() === 'yes' || values[3] === '1') : false,
                    unit: values[4] || 'piece',
                    unitValue: values[5] || '',
                    category: values[6] || '',
                    subcategory: values[7] || '',
                    foodType: (values[8] || 'veg').toLowerCase(),
                    description: values[9] || '',
                    inStock: typeof values[10] !== 'undefined' ? (values[10].toLowerCase() === 'true' || values[10].toLowerCase() === 'yes' || values[10] === '1') : true,
                    expiryDate: values[11] || '',
                    ...(businessCategory === 'medical' ? {
                        storageZone: values[12] || 'general',
                        rack: values[13] || '',
                        shelf: values[14] || '',
                        bin: values[15] || '',
                        batchNumber: values[16] || '',
                        requiresPrescription: typeof values[17] !== 'undefined' ? (values[17].toLowerCase() === 'true' || values[17].toLowerCase() === 'yes' || values[17] === '1') : false
                    } : {})
                };
            }
            if (item.name && item.totalPrice) {
                items.push(item);
            } else {
                console.warn(`Skipping line ${i + 1}: missing required fields (name or price)`);
            }
        }
        return items;
    };

    const handleLoadSample = () => {
        setBulkData(sampleData);
    };

    const handleClear = () => {
        setBulkData('');
        setParsedItems([
            {
                name: '',
                totalPrice: '',
                quantity: null,
                looseItem: false,
                unit: 'piece',
                unitValue: '',
                category: category || '',
                subcategory: subcategory || '',
                foodType: 'veg',
                description: '',
                inStock: true,
                expiryDate: '',
                ...(businessCategory === 'medical' ? {
                    storageZone: 'general',
                    rack: '',
                    shelf: '',
                    bin: '',
                    batchNumber: '',
                    requiresPrescription: false
                } : {})
            }
        ]);
    };

    const handleDownloadTemplate = () => {
        const blob = new Blob([sampleData], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'inventory_template.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex justify-center items-center bg-black/70">
            <div className="bg-white w-full max-w-6xl h-[90vh] shadow-lg rounded-lg p-6 relative overflow-y-auto">
                <button
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl"
                    onClick={onClose}
                    aria-label="Close"
                >
                    <X />
                </button>
                
                <h2 className="text-2xl font-semibold mb-6">Bulk Add Inventory</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Instructions Panel */}
                    <div className="lg:col-span-1">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-blue-800 mb-3">Instructions</h3>
                            <div className="text-sm text-blue-700 space-y-2">
                                <p>• Enter items in CSV format</p>
                                <p>• First row should be headers</p>
                                <p>• <strong>Required fields: Name, Price, Quantity</strong></p>
                                <p>• Mark "Loose Item" if sold by weight/volume</p>
                                <p>• For loose items: specify Unit (kg, ltr, etc.) and Unit Value</p>
                                <p>• Optional fields: Category, Subcategory, Food Type, Description, In Stock, Expiry Date</p>
                                {businessCategory === 'medical' && (
                                    <>
                                        <p>• Storage Zone: general, refrigerated, controlled, hazardous</p>
                                        <p>• Rack/Shelf/Bin: Location identifiers</p>
                                        <p>• Batch Number: Medication batch ID</p>
                                        <p>• Requires Prescription: true/false</p>
                                    </>
                                )}
                                <div className="mt-4 pt-2 border-t border-blue-200">
                                    <p className="text-blue-800 font-medium">Note:</p>
                                    <p className="text-xs text-blue-700 mt-1"><strong>Include all commas even for empty optional fields to maintain format.</strong></p>
                                </div>
                            </div>
                            
                            <div className="mt-4 space-y-2">
                                <button
                                    type="button"
                                    onClick={handleLoadSample}
                                    className="w-full bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600 transition-colors"
                                >
                                    Load Sample Data
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDownloadTemplate}
                                    className="w-full bg-green-500 text-white px-3 py-2 rounded text-sm hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Download size={16} />
                                    Download Template
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Data Input Panel */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Data Input */}
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <label className="block text-sm font-medium">
                                        Inventory Data (CSV Format)
                                    </label>
                                    <button 
                                        type="button" 
                                        onClick={() => setShowFormatHelp(!showFormatHelp)}
                                        className="text-gray-500 hover:text-blue-500"
                                        aria-label="Show format help"
                                    >
                                        <HelpCircle size={16} />
                                    </button>
                                </div>
                                {showFormatHelp && (
                                    <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                                        <p>CSV format should include these headers (in order):</p>
                                        <pre className="mt-1 p-2 bg-white border rounded font-mono text-xs overflow-x-auto">
                                            {DEFAULT_HEADER.join(',')}
                                        </pre>
                                    </div>
                                )}
                                <textarea
                                    value={bulkData === '' ? DEFAULT_HEADER.join(',') : bulkData}
                                    onChange={(e) => setBulkData(e.target.value)}
                                    className="w-full h-32 border border-gray-300 rounded px-3 py-2 font-mono text-sm"
                                    placeholder="Paste your CSV data here..."
                                />
                                {parseError && <div className="text-red-500 text-xs mt-1">{parseError}</div>}
                            </div>

                            {/* Editable Table */}
                            {parsedItems.length > 0 && (
                                <div className="overflow-x-auto mt-4">
                                    <table className="min-w-full border text-xs">
                                        <thead>
                                            <tr className="bg-gray-100">
                                                <th className="border px-2 py-1 text-center"></th>
                                                <th className="border px-2 py-1">Name*</th>
                                                <th className="border px-2 py-1">Price*</th>
                                                <th className="border px-2 py-1">Qty*</th>
                                                <th className="border px-2 py-1">Loose</th>
                                                {parsedItems.some(item => item.looseItem) && (
                                                    <>
                                                        <th className="border px-2 py-1">Unit</th>
                                                        <th className="border px-2 py-1">Unit Value</th>
                                                    </>
                                                )}
                                                <th className="border px-2 py-1">Category</th>
                                                <th className="border px-2 py-1">Subcat</th>
                                                <th className="border px-2 py-1">Type</th>
                                                {businessCategory === 'medical' && (
                                                    <>
                                                        <th className="border px-2 py-1">Storage</th>
                                                        <th className="border px-2 py-1">Rack</th>
                                                        <th className="border px-2 py-1">Shelf</th>
                                                        <th className="border px-2 py-1">Bin</th>
                                                        <th className="border px-2 py-1">Batch</th>
                                                        <th className="border px-2 py-1">Rx</th>
                                                    </>
                                                )}
                                                <th className="border px-2 py-1">Expiry</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {parsedItems.map((item, idx) => (
                                                <tr key={idx}>
                                                    <td className="border px-2 py-1 text-center">
                                                        <button type="button" onClick={() => handleRemoveRow(idx)} className="text-red-500 hover:bg-red-100 rounded p-1" title="Delete Row">
                                                            <Trash size={16} />
                                                        </button>
                                                    </td>
                                                    <td className="border px-2 py-1">
                                                        <input type="text" value={item.name || ''} onChange={e => handleItemChange(idx, 'name', e.target.value)} className="w-24 border rounded px-1 py-0.5" required />
                                                    </td>
                                                    <td className="border px-2 py-1">
                                                        <input type="number" value={item.totalPrice || ''} onChange={e => handleItemChange(idx, 'totalPrice', e.target.value)} className="w-16 border rounded px-1 py-0.5" required />
                                                    </td>
                                                    <td className="border px-2 py-1">
                                                        <input type="number" value={item.quantity || ''} onChange={e => handleItemChange(idx, 'quantity', e.target.value)} className="w-12 border rounded px-1 py-0.5" required min="1" />
                                                    </td>
                                                    <td className="border px-2 py-1 text-center">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={item.looseItem || false} 
                                                            onChange={e => handleItemChange(idx, 'looseItem', e.target.checked)} 
                                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                        />
                                                    </td>
                                                    {parsedItems.some(i => i.looseItem) && (
                                                        <>
                                                            <td className="border px-2 py-1">
                                                                {item.looseItem ? (
                                                                    <select 
                                                                        value={item.unit || 'piece'} 
                                                                        onChange={e => handleItemChange(idx, 'unit', e.target.value)}
                                                                        className="w-16 border rounded px-1 py-0.5"
                                                                    >
                                                                        <option value="kg">kg</option>
                                                                        <option value="ltr">ltr</option>
                                                                        <option value="piece">piece</option>
                                                                    </select>
                                                                ) : (
                                                                    <div className="w-16 px-1 py-0.5 text-gray-400">-</div>
                                                                )}
                                                            </td>
                                                            <td className="border px-2 py-1">
                                                                {item.looseItem ? (
                                                                    <input 
                                                                        type="text" 
                                                                        value={item.unitValue || ''} 
                                                                        onChange={e => handleItemChange(idx, 'unitValue', e.target.value)} 
                                                                        className="w-16 border rounded px-1 py-0.5" 
                                                                        placeholder="500mg, 10ml" 
                                                                    />
                                                                ) : (
                                                                    <div className="w-16 px-1 py-0.5 text-gray-400">-</div>
                                                                )}
                                                            </td>
                                                        </>
                                                    )}
                                                    <td className="border px-2 py-1">
                                                        <input type="text" value={item.category || ''} onChange={e => handleItemChange(idx, 'category', e.target.value)} className="w-20 border rounded px-1 py-0.5" />
                                                    </td>
                                                    <td className="border px-2 py-1">
                                                        <input type="text" value={item.subcategory || ''} onChange={e => handleItemChange(idx, 'subcategory', e.target.value)} className="w-20 border rounded px-1 py-0.5" />
                                                    </td>
                                                    <td className="border px-2 py-1">
                                                        <select value={item.foodType || 'veg'} onChange={e => handleItemChange(idx, 'foodType', e.target.value)} className="w-16 border rounded px-1 py-0.5">
                                                            <option value="veg">veg</option>
                                                            <option value="nonveg">nonveg</option>
                                                            <option value="egg">egg</option>
                                                        </select>
                                                    </td>
                                                    {businessCategory === 'medical' && (
                                                        <>
                                                            <td className="border px-2 py-1">
                                                                <select value={item.storageZone || 'general'} onChange={e => handleItemChange(idx, 'storageZone', e.target.value)} className="w-20 border rounded px-1 py-0.5">
                                                                    <option value="general">General</option>
                                                                    <option value="refrigerated">Refrigerated</option>
                                                                    <option value="controlled">Controlled</option>
                                                                    <option value="hazardous">Hazardous</option>
                                                                </select>
                                                            </td>
                                                            <td className="border px-2 py-1">
                                                                <input type="text" value={item.rack || ''} onChange={e => handleItemChange(idx, 'rack', e.target.value)} className="w-12 border rounded px-1 py-0.5" />
                                                            </td>
                                                            <td className="border px-2 py-1">
                                                                <input type="text" value={item.shelf || ''} onChange={e => handleItemChange(idx, 'shelf', e.target.value)} className="w-12 border rounded px-1 py-0.5" />
                                                            </td>
                                                            <td className="border px-2 py-1">
                                                                <input type="text" value={item.bin || ''} onChange={e => handleItemChange(idx, 'bin', e.target.value)} className="w-12 border rounded px-1 py-0.5" />
                                                            </td>
                                                            <td className="border px-2 py-1">
                                                                <input type="text" value={item.batchNumber || ''} onChange={e => handleItemChange(idx, 'batchNumber', e.target.value)} className="w-20 border rounded px-1 py-0.5" />
                                                            </td>
                                                            <td className="border px-2 py-1 text-center">
                                                                <input 
                                                                    type="checkbox" 
                                                                    checked={item.requiresPrescription || false} 
                                                                    onChange={e => handleItemChange(idx, 'requiresPrescription', e.target.checked)} 
                                                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                                />
                                                            </td>
                                                        </>
                                                    )}
                                                    <td className="border px-2 py-1">
                                                        <input 
                                                            type="date" 
                                                            value={item.expiryDate || ''} 
                                                            onChange={e => handleItemChange(idx, 'expiryDate', e.target.value)} 
                                                            className="w-24 border rounded px-1 py-0.5" 
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <button type="button" onClick={handleAddRow} className="mt-2 px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600">+ Add Row</button>
                                </div>
                            )}
                            {/* Action Buttons */}
                            <div className="flex gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={handleClear}
                                    className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                                >
                                    Clear
                                </button>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isProcessing}
                                    className="px-6 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isProcessing ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <Upload size={16} />
                                            Add Items
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BulkAddModal;