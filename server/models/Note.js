const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    transcript: {
      type: String,
      required: true,
    },

    result: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    strict: false,
  }
);

module.exports = mongoose.model("Note", noteSchema);