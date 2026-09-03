const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    transcript: {
      type: String,
      required: true,
    },

    result: {
      summary: {
        type: String,
        default: "",
      },

      keyPoints: {
        type: [String],
        default: [],
      },

      actionItems: {
        type: [
          {
            task: String,
            priority: String,
          },
        ],
        default: [],
      },

      decisions: {
        type: [String],
        default: [],
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Note", noteSchema);