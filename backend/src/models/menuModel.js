const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema({
  date: { type: String, unique: true, required: true }, 
  morning: [
    {
      menuName: { type: String, required: true },
      image: { type: String,  }, 
      price: { type: Number,  },
    },
  ],
  afternoon: [
    {
      menuName: { type: String, required: true },
      image: { type: String,  },
      price: { type: Number,  },
    },
  ],
  evening: [
    {
      menuName: { type: String, required: true },
      image: { type: String,  },
      price: { type: Number,  },
    },
  ],
});

const Menu = mongoose.model("Menu", menuSchema);
module.exports = Menu;
