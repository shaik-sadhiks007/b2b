import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export const Header = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const { cart } = useCart();
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const totalItems = cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                isScrolled ? 'bg-white shadow-md' : 'bg-transparent'
            }`}
        >
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <Link to="/" className="flex items-center">
                        <span className={`text-xl font-bold ${isScrolled ? 'text-gray-800' : 'text-white'}`}>
                            B2B Food
                        </span>
                    </Link>
                    
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div 
                                onClick={() => navigate('/cart')}
                                className={`flex items-center gap-2 cursor-pointer ${
                                    isScrolled ? 'text-gray-800' : 'text-white'
                                }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                {totalItems > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                        {totalItems}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}; 