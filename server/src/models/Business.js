import mongoose from "mongoose";

const sliderSchema=new mongoose.Schema({
  title:{type:String,required:true,trim:true,maxlength:90},
  subtitle:{type:String,default:"",trim:true,maxlength:180},
  imageUrl:{type:String,required:true},
  publicId:{type:String,required:true},
  buttonLabel:{type:String,default:"Explore products",trim:true,maxlength:32},
  buttonHref:{type:String,default:"#products",trim:true,maxlength:120},
  position:{type:Number,required:true,min:0,max:5},
  enabled:{type:Boolean,default:true},
  uploadedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true}
},{timestamps:true});
const deliveryRegionSchema=new mongoose.Schema({
  name:{type:String,required:true,trim:true,maxlength:100},
  ratePerKgPaisa:{type:Number,required:true,min:0,max:100000000}
},{_id:true});
const storeSectionSchema=new mongoose.Schema({
  title:{type:String,required:true,trim:true,maxlength:80},
  subtitle:{type:String,default:"",trim:true,maxlength:180},
  productIds:[{type:mongoose.Schema.Types.ObjectId,ref:"Product",required:true}]
},{_id:true});
const announcementSchema=new mongoose.Schema({
  title:{type:String,default:"Store update",trim:true,maxlength:40},
  text:{type:String,required:true,trim:true,maxlength:180}
},{_id:true});

const schema=new mongoose.Schema({
  name:{type:String,required:true,trim:true,maxlength:140},
  slug:{type:String,trim:true,lowercase:true,unique:true,sparse:true},
  category:{type:String,required:true,trim:true,maxlength:80},
  description:{type:String,default:"",maxlength:1200},
  announcementTitle:{type:String,default:"",trim:true,maxlength:40},
  announcementText:{type:String,default:"",trim:true,maxlength:180},
  announcements:{type:[announcementSchema],default:[]},
  logoUrl:{type:String,default:""},
  logoPublicId:{type:String,default:""},
  contactPhone:{type:String,default:"",trim:true,maxlength:20},
  whatsappNumber:{type:String,default:"",trim:true,maxlength:20},
  instagramUrl:{type:String,default:"",trim:true,maxlength:300},
  youtubeUrl:{type:String,default:"",trim:true,maxlength:300},
  facebookUrl:{type:String,default:"",trim:true,maxlength:300},
  linkedinUrl:{type:String,default:"",trim:true,maxlength:300},
  twitterUrl:{type:String,default:"",trim:true,maxlength:300},
  telegramUrl:{type:String,default:"",trim:true,maxlength:300},
  seoTitle:{type:String,default:"",trim:true,maxlength:70},
  seoDescription:{type:String,default:"",trim:true,maxlength:180},
  upiId:{type:String,default:"",trim:true,maxlength:120},
  paymentInstructions:{type:String,default:"",maxlength:500},
  paymentQrUrl:{type:String,default:""},
  paymentQrPublicId:{type:String,default:""},
  ownerId:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true,index:true},
  status:{type:String,enum:["PENDING","ACTIVE","REJECTED","SUSPENDED","DELETED"],default:"PENDING",index:true},
  subscriptionPlan:{type:String,enum:["STARTER","GROWTH","PRO"],default:"STARTER",index:true},
  subscriptionFeatures:{
    advancedSeo:{type:Boolean,default:false},
    quickReplies:{type:Boolean,default:false},
    analytics:{type:Boolean,default:false}
  },
  subscriptionActivatedAt:Date,
  deletedAt:Date,
  address:{type:String,required:true,maxlength:240},
  city:{type:String,required:true,maxlength:80},
  state:{type:String,required:true,maxlength:80},
  pincode:{type:String,required:true,match:/^\d{6}$/},
  deliveryRegions:{type:[deliveryRegionSchema],default:[]},
  sliderSlides:{type:[sliderSchema],default:[]},
  storeSections:{type:[storeSectionSchema],default:[]},
  approvedAt:Date,
  approvedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User"}
},{timestamps:true});

export default mongoose.model("Business",schema);
