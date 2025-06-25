const multer = require("multer");
const cloudinary = require("../utils/cloudinary.js");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    const allowedFormats = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];
    if (!allowedFormats.includes(file.mimetype)) {
      let err = new Error("Invalid image format");
      err.http_code = 400;
      throw err;
    }

    return {
      folder: "shoppingApplication",
      public_id: `${Date.now()}+ ${file.originalname}`,
      transformation: [
        { width: 400, height: 400, crop: "fill" },
        { quality: "auto" },
        {fetch_format:"auto"}
      ],
    };
  },
});

const upload = multer({
    storage:storage ,
    limits:{fileSize:1*1024*1024},
    fileFilter:(req , file  , cb)=>{
        if(file.mimetype.startsWith("image/")){
            cb(null , true)
        }else{
             cb(new Error("Only image files are allowed!"), false);
        }
    }
})

module.exports = upload