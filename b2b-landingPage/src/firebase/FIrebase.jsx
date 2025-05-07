import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail as firebaseSendPasswordResetEmail, signInWithEmailAndPassword } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDmxqsBuOxxQ2DwIgAQQo-bTI8dV0nAtpA",
    authDomain: "b2b-company-3de08.firebaseapp.com",
    projectId: "b2b-company-3de08",
    storageBucket: "b2b-company-3de08.firebasestorage.app",
    messagingSenderId: "676612335148",
    appId: "1:676612335148:web:49700f714cfd7be4065389"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
auth.languageCode = "en"; // Set default language

const googleProvider = new GoogleAuthProvider();

// Function to send email verification
const sendVerificationEmail = async (user) => {
    try {
        await sendEmailVerification(user);
        return true;
    } catch (error) {
        console.error('Error sending verification email:', error);
        throw error;
    }
};

// Function to send password reset email
const sendPasswordResetEmail = async (email) => {
    try {
        await firebaseSendPasswordResetEmail(auth, email);
        return true;
    } catch (error) {
        console.error('Error sending password reset email:', error);
        throw error;
    }
};

export {
    auth,
    RecaptchaVerifier,
    signInWithPhoneNumber,
    googleProvider, 
    signInWithPopup,
    createUserWithEmailAndPassword,
    sendVerificationEmail as sendEmailVerification,
    sendPasswordResetEmail,
    signInWithEmailAndPassword
};


