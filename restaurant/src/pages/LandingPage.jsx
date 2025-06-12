import React, { useState, useEffect, useContext } from "react";
import banner from "../assets/banner.jpeg";
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { AuthContext } from '../context/AuthContext';
import logo from '../assets/b2bupdate.png';
import { ORIGIN_URL,API_URL } from "../api/api";

const LandingPage = () => {
    const navigate = useNavigate();
    const { user, restaurant, loading } = useContext(AuthContext);
    const [activeQuestion, setActiveQuestion] = useState(null);
    const [isScrolled, setIsScrolled] = useState(false);
    const [showServiceModal, setShowServiceModal] = useState(false);

    useEffect(() => {
        // Check if user is logged in and has a published restaurant
        if (user && restaurant && restaurant.status === 'published') {
            navigate('/dashboard');
        }
    }, [user, restaurant, navigate]);

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

    useEffect(() => {
        // Listen for messages from the parent window
        const handleMessage = async (event) => {
            console.log('Message received:', event.data);
            console.log('Message origin:', event.origin);
            console.log('Expected origin:', ORIGIN_URL);
            
            // Verify the origin of the message
            if (event.origin === ORIGIN_URL) {
                console.log('Origin verified');
                if (event.data.type === 'INITIATE_TOKEN_TRANSFER') {
                    console.log('Initiating token transfer');
                    try {
                        // Make a request to the backend to transfer the token
                        console.log('Making request to:', `${API_URL}/api/auth/transfer-token`);
                        const response = await fetch(`${API_URL}/api/auth/transfer-token`, {
                            method: 'POST',
                            credentials: 'include', // This is important to include cookies
                            headers: {
                                'Content-Type': 'application/json',
                                'Accept': 'application/json'
                            },
                            body: JSON.stringify({
                                sourceOrigin: event.data.sourceOrigin
                            })
                        });

                        console.log('Response status:', response.status);
                        const data = await response.json();
                        console.log('Response data:', data);

                        if (!response.ok) {
                            throw new Error(data.message || 'Failed to transfer token');
                        }

                        // Token should now be set in the cookies for this domain
                        console.log('Token transferred successfully');
                        
                        // Optionally refresh the page or update the UI
                        window.location.reload();
                    } catch (error) {
                        console.error('Error transferring token:', error);
                        // Show error to user
                        alert('Failed to transfer authentication. Please try logging in again.');
                    }
                }
            } else {
                console.log('Origin mismatch. Expected:', ORIGIN_URL, 'Got:', event.origin);
            }
        };

        console.log('Setting up message listener');
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    const toggleQuestion = (index) => {
        setActiveQuestion(activeQuestion === index ? null : index);
    };

    const handleServiceSelection = (type) => {
        if (!user) {
            navigate('/login');
            return;
        }
        setShowServiceModal(false);
        navigate('/add-restaurant', { state: { serviceType: type } });
    };

    return (
        <div className="container-fluid p-0">
            {/* Service Selection Modal */}
            {showServiceModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0">
                            <div className="modal-header border-0">
                                <h5 className="modal-title fw-bold">Select the service you want to register for</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowServiceModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="d-flex flex-column gap-3">
                                    {/* Both food delivery & dining */}
                                    <div
                                        className="p-4 border rounded cursor-pointer hover-shadow"
                                        onClick={() => handleServiceSelection('BOTH')}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <h6 className="mb-2 fw-bold">Both Delivery & Pickup</h6>
                                                <p className="mb-0 text-muted small">List your Business on both the delivery and pickup sections</p>
                                            </div>
                                            <div className="fs-4 text-primary">
                                                <i className="bi bi-arrow-right-circle"></i>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Food delivery only */}
                                    <div
                                        className="p-4 border rounded cursor-pointer hover-shadow"
                                        onClick={() => handleServiceSelection('DELIVERY')}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <h6 className="mb-2 fw-bold">Delivery only</h6>
                                                <p className="mb-0 text-muted small">List your Business in the delivery section only</p>
                                            </div>
                                            <div className="fs-4 text-primary">
                                                <i className="bi bi-arrow-right-circle"></i>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Dining only */}
                                    <div
                                        className="p-4 border rounded cursor-pointer hover-shadow"
                                        onClick={() => handleServiceSelection('PICKUP')}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <h6 className="mb-2 fw-bold">Pickup only</h6>
                                                <p className="mb-0 text-muted small">List your Business in the pickup section only</p>
                                            </div>
                                            <div className="fs-4 text-primary">
                                                <i className="bi bi-arrow-right-circle"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <Header />

            {/* Main Content */}
            <div>
                {/* Header Banner */}
                <header className="position-relative">
                    <div className="banner-container" style={{
                        position: 'relative',
                        height: '100vh',
                        width: '100%',
                        backgroundImage: `url(${banner})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                    }}>
                        {/* Overlay */}
                        <div className="position-absolute top-0 start-0 w-100 h-100"
                            style={{
                                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                color: 'white',
                                textAlign: 'center',
                                padding: '0 20px'
                            }}>
                            <h1 className="display-4 fw-bold mb-4 text-white">Welcome to B2B</h1>
                            <p className="lead mb-4 text-white">Grow your business by joining our B2B application—reach more customers, boost sales, and simplify operations!</p>
                            <div className="d-flex gap-3">
                                <button
                                    className="btn btn-primary btn-lg px-4 py-2 rounded-pill"
                                    onClick={() => {
                                        if (!user) {
                                            navigate('/login');
                                            return;
                                        }
                                        
                                        if (restaurant) {
                                            if (restaurant.status === 'published') {
                                                navigate('/dashboard');
                                            } else if (restaurant.status === 'review') {
                                                navigate('/review');
                                            } else if (restaurant.status === 'draft') {
                                                navigate('/add-restaurant');
                                            } else {
                                                setShowServiceModal(true);
                                            }
                                        } else {
                                            setShowServiceModal(true);
                                        }
                                    }}
                                >
                                    {user && restaurant && restaurant.status === 'published' ? 'Go to Dashboard' : 'Register your Business'}
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Get Started Section */}
                <section className="py-4 bg-warning bg-opacity-10">
                    <div className="container">
                        <div className="row">
                            <div className="col-md-7">
                                <h3 className="fw-bold mb-3">Get Started - It only takes 10 minutes</h3>
                                <p className="text-muted mb-4">Please keep these documents and details ready for a smooth sign-up</p>

                                <div className="mb-2">
                                    {['PAN card', 'FSSAI certificate', 'GST number - if applicable', 'Profile filling', 'Menu details'].map((item, index) => (
                                        <div key={index} className="d-flex align-items-center mb-2">
                                            <span className="bg-success rounded-circle px-2 py-1 me-2 text-white">
                                                <i className="bi bi-check"></i>
                                            </span>
                                            <span>{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {/* <div className="col-md-5">
                                <div className="border rounded p-2 bg-dark text-white">
                                    <div className="d-flex justify-content-between mb-2">
                                        <div>
                                            <small className="text-white-50">Simple 3 step process to get your Business live on B2B</small>
                                        </div>
                                        <div className="d-flex">
                                            <span className="mx-1 text-white-50">II</span>
                                            <span className="mx-1 text-white-50">I</span>
                                            <span className="mx-1 text-white-50">III</span>
                                        </div>
                                    </div>
                                    <img
                                        src="/placeholder.svg"
                                        alt="Onboarding steps"
                                        style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                                        className="rounded"
                                    />
                                    <div className="text-end mt-2">
                                        <small className="text-primary">Refer here</small>
                                    </div>
                                </div>
                            </div> */}
                        </div>
                    </div>
                </section>

                {/* Why Partner Section */}
                <section className="py-5 bg-light">
                    <div className="container">
                        <h3 className="text-center fw-bold mb-5">Why should you partner with B2B?</h3>

                        <div className="row text-center">
                            {[
                                {
                                    icon: 'bi-people',
                                    title: 'Attract new customers',
                                    description: 'Reach the millions of people ordering on B2B'
                                },
                                {
                                    icon: 'bi-shop',
                                    title: 'Real-Time Order & Inventory Management',
                                    description: 'Track orders as they come in and manage stock levels across all products effortlessly with real-time updates and low-stock alerts.'
                                },
                                {
                                    icon: 'bi-envelope',
                                    title: 'Onboarding support',
                                    description: 'For any queries, email us at merchant@b2b.com'
                                }
                            ].map((item, index) => (
                                <div key={index} className="col-md-4 mb-4">
                                    <div className="d-flex justify-content-center mb-3">
                                        <div className="bg-primary bg-opacity-10 rounded-circle px-3 py-2">
                                            <i className={`bi ${item.icon} fs-1`}></i>
                                        </div>
                                    </div>
                                    <h5 className="fw-bold">{item.title}</h5>
                                    <p className="text-muted small">{item.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Success Stories Section */}
                {/* <section className="py-5">
                    <div className="container">
                        <h3 className="text-center fw-bold mb-5">Business success stories</h3>

                        <div className="position-relative">
                            <div className="row">
                                {[
                                    {
                                        text: "I'm grateful to the team for helping me thrive in online ordering. It has been an amazing selling Business!",
                                        name: "Arshad Qureshi",
                                        location: "Vijayawada"
                                    },
                                    {
                                        text: "Thanks to invaluable support, we started cloud kitchen and doing wonders in the competitive landscape. Their dedicated team provides powerful reporting tools that have been crucial, and we look forward to a long-term partnership.",
                                        name: "Sandeep K",
                                        location: "Vijayawada"
                                    },
                                    {
                                        text: "B2B helped us with quick registration, and now, we are one of the top vegetarian joints in Vijayawada city.",
                                        name: "Vijay",
                                        location: "Vijayawada"
                                    }
                                ].map((story, index) => (
                                    <div key={index} className="col-md-4 mb-4">
                                        <div className="card h-100 border-0 shadow-sm">
                                            <div className="card-body">
                                                <p className="card-text">{story.text}</p>
                                                <div className="d-flex align-items-center mt-3">
                                                    <img
                                                        src="/placeholder.svg"
                                                        alt={story.name}
                                                        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                                        className="rounded-circle me-3"
                                                    />
                                                    <div>
                                                        <h6 className="mb-0 fw-bold">{story.name}</h6>
                                                        <small className="text-muted">{story.location}</small>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button className="btn btn-light rounded-circle position-absolute start-0 top-50 translate-middle-y shadow-sm">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    fill="currentColor"
                                    className="bi bi-chevron-left"
                                    viewBox="0 0 16 16"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"
                                    />
                                </svg>
                            </button>
                            <button className="btn btn-light rounded-circle position-absolute end-0 top-50 translate-middle-y shadow-sm">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    fill="currentColor"
                                    className="bi bi-chevron-right"
                                    viewBox="0 0 16 16"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </section> */}

                {/* FAQ Section */}
                <section className="py-5 bg-light">
                    <div className="container">
                        <h3 className="text-center fw-bold mb-5">Frequently asked questions</h3>

                        <div className="accordion" id="faqAccordion">
                            {faqs.map((faq, index) => (
                                <div className="card mb-3 border-0 shadow-sm" key={index}>
                                    <div
                                        className="card-header bg-white d-flex justify-content-between align-items-center py-3 px-4 cursor-pointer"
                                        onClick={() => toggleQuestion(index)}
                                    >
                                        <h6 className="mb-0 fw-bold">{faq.question}</h6>
                                        <span>
                                            {activeQuestion === index ? (
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="16"
                                                    height="16"
                                                    fill="currentColor"
                                                    className="bi bi-chevron-up"
                                                    viewBox="0 0 16 16"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z"
                                                    />
                                                </svg>
                                            ) : (
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="16"
                                                    height="16"
                                                    fill="currentColor"
                                                    className="bi bi-chevron-down"
                                                    viewBox="0 0 16 16"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"
                                                    />
                                                </svg>
                                            )}
                                        </span>
                                    </div>
                                    {activeQuestion === index && (
                                        <div className="card-body px-4 py-3">
                                            <p className="mb-0">{faq.answer}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>

            {/* Footer */}
            <footer className="bg-white py-5">
                <div className="container">
                    <div className="row mb-4">
                        <div className="col-md-4 mb-5">
                            <img src= { logo } alt="B2B" style={{ height: '30px', width: '30px' }} className="mb-3" />
                            <h6 className="text-uppercase fw-bold mb-3">Your one-stop platform for business services.</h6>
                            {/* <ul className="list-unstyled">
                                {['Who We Are', 'Blog', 'Work With Us', 'Investor Relations', 'Report Fraud', 'Press Kit'].map((item, index) => (
                                    <li key={index} className="mb-2">
                                        <a href="#" className="text-decoration-none text-muted">
                                            {item}
                                        </a>
                                    </li>
                                ))}
                            </ul> */}
                        </div>

                        <div className="col-md-4 mb-4">
                            <h6 className="text-uppercase fw-bold mb-3">Quick Links</h6>
                            <ul className="list-unstyled">
                                <li><a href="/aboutus" className="hover:text-blue-500">About Us</a></li>
                            </ul>

                            {/* <h6 className="text-uppercase fw-bold mb-3 mt-4">Learn More</h6>
                            <ul className="list-unstyled">
                                {['Privacy', 'Security', 'Terms', 'Sitemap'].map((item, index) => (
                                    <li key={index} className="mb-2">
                                        <a href="#" className="text-decoration-none text-muted">
                                            {item}
                                        </a>
                                    </li>
                                ))}
                            </ul> */}
                        </div>

                        <div className="col-md-4 mb-4">
                            <h6 className="text-uppercase fw-bold mb-3">Contact Us</h6>
                            <div className="d-flex mb-4">
                                <ul className="list-unstyled">
                                    <li>Email: <a href="mailto:example@email.com">support@b2b.com</a></li>
                                    <li>Phone: <a href="tel:+1234567890">+1 (234) 567-890</a></li>
                                    <li>Address: Vijayawada, India</li>
                                </ul>
                            
                                {/* {['linkedin', 'instagram', 'twitter', 'youtube', 'facebook'].map((social, index) => (
                                    <a key={index} href="#" className="me-2 text-decoration-none">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="24"
                                            height="24"
                                            fill="currentColor"
                                            className={`bi bi-${social}`}
                                            viewBox="0 0 16 16"
                                        >
                                            
                                        </svg>
                                    </a>
                                ))} */}
                            </div>

                            {/* <div className="app-buttons">
                                <a href="#" className="d-inline-block mb-2">
                                    <img
                                        src="/placeholder.svg"
                                        alt="App Store"
                                        style={{ height: '40px', width: '120px' }}
                                        className="img-fluid"
                                    />
                                </a>
                                <a href="#" className="d-inline-block">
                                    <img
                                        src="/placeholder.svg"
                                        alt="Google Play"
                                        style={{ height: '40px', width: '120px' }}
                                        className="img-fluid"
                                    />
                                </a>
                            </div> */}
                        </div>
                    </div>


                </div>
            </footer>
        </div>
    );
};

// FAQ data
const faqs = [
    {
        question: "What are the documents and details required to start deliveries through B2B?",
        answer:
            "You'll need your PAN card, FSSAI , GST number (if applicable), menu details to get started with B2B.",
    },
    {
        question: "How long will it take for a Business to go live on B2B after submitting the documents?",
        answer:
            "Once all required documents are submitted and verified, your Business can typically go live.",
    },
    {
        question: "What is the one-time onboarding fee? Do I have to pay it all the time of registration?",
        answer:
            "There is a one-time onboarding fee that covers the cost of setting up your Business on our platform. This fee is payable at the time of registration and is non-recurring.",
    },
    {
        question: "How can I get help and support from B2B if I get stuck?",
        answer:
            "You can reach out to our dedicated merchant support team at merchant@b2b.com or through the partner app. We also provide 24/7 support for urgent issues.",
    },
    {
        question: "How much commission will be charged by B2B?",
        answer:
            "Commission rates vary based on your Business type, location, and other factors. New partners enjoy 0% commission for the first month. After that, standard rates apply which will be discussed during onboarding.",
    },
];

export default LandingPage; 