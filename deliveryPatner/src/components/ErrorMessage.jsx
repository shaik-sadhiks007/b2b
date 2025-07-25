import React from 'react';

const ErrorMessage = ({ error }) => {
    if (!error) return null;
    let msg = '';
    if (typeof error === 'string') msg = error;
    else if (typeof error === 'object') {
        if (error.error) msg = error.error;
        else if (error.message) msg = error.message;
        else msg = JSON.stringify(error);
    } else {
        msg = String(error);
    }
    return (
        <div className="text-red-500">
            {msg.includes('online')
                ? 'You must be online and active to view available orders.'
                : msg}
        </div>
    );
};

export default ErrorMessage; 