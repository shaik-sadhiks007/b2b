import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail as firebaseSendPasswordResetEmail, signInWithEmailAndPassword } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyCSB3Gs2S2yTIZWj5saf3ytg_weZUa7exw",
    authDomain: "b2b-company-26b7e.firebaseapp.com",
    projectId: "b2b-company-26b7e",
    storageBucket: "b2b-company-26b7e.firebasestorage.app",
    messagingSenderId: "1094239535773",
    appId: "1:1094239535773:web:9c703bf81af1afbb80ca74"
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


