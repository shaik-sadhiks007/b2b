import React, { useState } from "react";
import { Link } from "react-router-dom";

const Helpbutton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Help Button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-12 h-12 bg-blue-600 text-white text-2xl flex items-center justify-center rounded-full cursor-pointer shadow-lg hover:bg-blue-700 z-50"
        title="Help"
      >
        ?
      </div>

      {/* Help Menu */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 bg-white shadow-xl rounded-xl p-4 z-40 w-60">
          <ul className="space-y-3">
            
            <li>
              <Link to="/contactus" className="text-blue-600 hover:underline">Contact Support</Link>
            </li>
            <li>
              <Link to="/tutorial" className="text-blue-600 hover:underline">Tutorial</Link>
            </li>
          
          </ul>
        </div>
      )}
    </>
  );
};

export default Helpbutton;