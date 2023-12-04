//Carolina Turner CSCE 242
const express = require("express");
const app = express();
const multer = require("multer");
const Joi = require("joi");
app.use(express.static("public"));
app.use(express.json());
const cors = require("cors");
app.use(cors());
const mongoose = require ("mongoose");

const upload = multer({dest : __dirname + "/public/images"});

mongoose
.connect("mongodb+srv://carturner:<csce242>@cluster0.m73w20w.mongodb.net/?retryWrites=true&w=majority")
.then(()=>{console.log("connected yay!!!")})
.catch((error)=>console.log("couldnt connect !!"))

const beverageSchema = new mongoose.Schema({
        title : String, 
        hot_or_iced:String,
        fan_favorite : String,
        price:Number,
        recommendation: String,
        flavors: [String],
        img: String,
});

const Beverage = mongoose.model ("Beverage", beverageSchema);

app.get("/" , (req,res)=>{
    res.sendFile(__dirname+ "/index.html");
});

app.get("/api/beverages", (req, res) =>{  
    getBeverages(res);
  });

const getBeverages = async (res)=>{
    const beverages = await Beverage.find();
    res.send(beverages);
};

app.get("/api/beverages/:id", (req, res) => {
    getBeverage(res, req.params.id);
  });
  
const getBeverage = async (res, id) => {
    const beverage = await Beverage.findOne({ _id: id });
    res.send(beverage);
  };
  
app.post("/api/beverages", upload.single("img"), (req,res)=>{
  console.log("office hours!!");
    const result = validateBeverage(req.body);
    if(result.error){
        res.status(400).send(result.error.details[0].message);
        return;
    }

    const beverage = new Beverage({
        title : req.body.beverageTitle,
        hot_or_iced : req.body.hot_or_iced,
        price : req.body.price,
        fan_favorite:req.body.fan_favorite,
        recommendation : req.body.recommendation,
        flavors : req.body.flavors.split(","),
    });
     if (req.file){
        beverage.img="images/" + req.file.filename;
    }
    createBeverage(beverage, res);
});

const createBeverage = async (beverage, res) => {
    const result = await beverage.save();
    res.send(beverage);
  };


app.put("/api/beverages/:id",upload.single("img"), (req,res)=>{
    const result = validateBeverage(req.body);
    console.log(result);
    if (result.error){
    res.status(400).send(result.error.details[0].message);
    return;
  }
  updateBeverage(req, res);
});
    
const updateBeverage = async (req, res) => {
    let fieldsToUpdate = {
        title : req.body.beverageTitle,
        hot_or_iced : req.body.hot_or_iced,
        price : req.body.price,
        recommendation : req.body.recommendation,
        fan_favorite : req.body.fan_favorite,
        flavors : req.body.flavors.split(","),
    };
    if (req.file) {
      fieldsToUpdate.img = "images/" + req.file.filename;
    }
    const result = await Beverage.updateOne({ _id: req.params.id }, fieldsToUpdate);
    res.send(result);
  };

  app.delete("/api/beverages/:id", (req, res) => {
    removeBeverages(res, req.params.id);
  });
  
  const removeBeverages = async (res, id) => {
    const beverage = await Beverage.findByIdAndDelete(id);
    res.send(beverage);
  };

function validateBeverage (beverage) {
    const schema = Joi.object({ //Joi Validation
        beverageTitle : Joi.string().min(3).required(), //joi validating it must be string of length three and is required, "tea" is minimum length
        hot_or_iced : Joi.string().min(3), //not required if can be either or
        price : Joi.allow().required(),
        fan_favorite: Joi.allow(),
        recommendation : Joi.allow("").required(),
        flavors :Joi.allow(""),
        _id: Joi.allow("")
    });

    return schema.validate(beverage);
  }

  app.listen(3000, ()=>{
    console.log("working!");

});

