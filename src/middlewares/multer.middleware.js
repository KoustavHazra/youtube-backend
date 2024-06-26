import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {  // cb means call-back func, the same one we use daily.
      cb(null, "./public/temp")  // in cb(), given the "public" directory where the files will be stored temporarily
    }
  })
  
export const upload = multer({ storage: storage });