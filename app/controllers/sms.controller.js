const Sms = require("../models/sms.model.js");
const oasisfeeds = require("oasisfeeds");
const axios = require("axios");
const csv = require('csv-parser');
const fs = require('fs');


//Send sms single sms
exports.sendSingle = (req, response, next) => { 
    const url = 'http://bulksms.mobitechtechnologies.com/api/sendsms';
    const user_id = req.body.user_id;
    let sms = {
        api_key: req.body.api_key,
        username: req.body.username,
        sender_id: req.body.sender_id,
        message: req.body.message,
        phone: req.body.phone,
      };

    axios.post(url,sms,{headers:{"Content-Type" : "application/json"}})
        .then((res) => {
            // console.log(res.data[0].status);
            const message_id = res.data[0].message_id;
            const urlRes = 'http://bulksms.mobitechtechnologies.com/api/sms_delivery_status'
            let message = {
              api_key: req.body.api_key,
              username: req.body.username,
              message_id: message_id

            }
            axios.post(urlRes,message,{headers:{"Content-Type" : "application/json"}})
            .then((res) => {
                if(res.data.status_code === 200){
                  // console.log(res.data);
                const smsSave =  new Sms({
                  status_code: res.data.status_code,
                  message_id: res.data.message_id,
                  message: res.data.message,
                  recepient: res.data.recepient,
                  sender_name: res.data.sender_name,
                  sms_unit: res.data.sms_unit,
                  user_id: user_id,
                });
                smsSave
                  .save()
                  .then(() => {
                    return response.status(200).json({
                      status: "success",
                      message: "Message sent!",
                    });
                  })
                  .catch((error) => { 
                    console.log(error)
                    return response.status(400).json({
                      status: "invalid!",
                      message: "Something wrong happened!",
                    });
                  });
                } else {
                  return response.status(400).json({
                    status: "invalid!",
                    message: "Something wrong happened!",
                  });
                }
            })
        })
};

//Send sms single sms
exports.sendCSV = async  (req, res, next) => { 
  console.log(req);
  try {
    if (!req.files) {
      res.send({
        status: false,
        message: "No file uploaded"
      });
    } else {
      //Use the name of the input field to retrieve the uploaded file
      let document = req.files.document;

      console.log(document);
      // let newuniqid = uniqid();
      // //Use the mv() method to place the file in upload directory (i.e. "uploads")
      // document.mv("./uploads/" + newuniqid + document.name);

      // //send response
      // res.send({
      //   status: true,
      //   message: "File is uploaded",
      //   data: {
      //     name: document.name,
      //     mimetype: document.mimetype,
      //     size: document.size,
      //     path: "uploads/" + newuniqid + document.name
      //   }
      // });
    }
  } catch (err) {
    res.status(500).send(err);
  }

};