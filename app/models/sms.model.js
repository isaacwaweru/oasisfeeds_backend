const mongoose = require("mongoose");
const crypto = require('crypto');
const uniqueValidator = require("mongoose-unique-validator");
const SmsSchema = mongoose.Schema(
  {
    status_code: { type: String },
    message_id: { type: String },
    message: { type: String },
    recepient: { type: String },
    sender_name: { type: String },
    sms_unit: { type: String },
    user_id: { type: String },
  },
  {
    timestamps: true,
  }
);


SmsSchema.plugin(uniqueValidator);
module.exports = mongoose.model("SMS", SmsSchema);