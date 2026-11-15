import {Router} from "express";
import {rateLimit} from "express-rate-limit";
import multer from "multer";
import {createTestimonial,listTestimonials} from "../controllers/testimonialController.js";
import {asyncHandler} from "../middleware/asyncHandler.js";

const upload=multer({storage:multer.memoryStorage(),limits:{fileSize:5*1024*1024,files:2}});
const submitLimit=rateLimit({windowMs:60*60*1000,limit:5,standardHeaders:"draft-7",legacyHeaders:false});
const router=Router();

router.get("/",asyncHandler(listTestimonials));
router.post("/",submitLimit,upload.fields([{name:"photo",maxCount:1},{name:"voice",maxCount:1}]),asyncHandler(createTestimonial));

export default router;
