
//@desc get all bootcamps 
//@access public
// @route GET api/v1/bootcamps


const ErrorResponse = require('../utlis/errorresponse');
const asyncHandler = require('../middleware/async');
const Bootcamp = require('../models/Bootcamp');
const geocoder = require('../utlis/geocoder');

exports.getBootcamps = asyncHandler(async (req,res , next) => {


    let query;

    // console.log(req.query);

    //Copy req.query
    const reqQuery = {...req.query};


    //Create querystring
    let queryStr = JSON.stringify(reqQuery);


    //Fields to exclude
    const removeFields= ['select','sort'];

    //Loop over remove fields and delete from reqQuery


    removeFields.forEach(param => delete reqQuery[param]);

    // console.log(reqQuery);
    // console.log(queryStr);
    //Create operators
    queryStr = queryStr.replace(/\b(gt|lt|gte|lte|in)\b/g,match=>`$${match}`);

    // console.log(queryStr);

    //Finding resource
    query = Bootcamp.find(JSON.parse(queryStr));

    //Select fields

    if(req.query.select){
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
    }

    if(req.query.sort){
        const sortBy = req.query.sort.split(',').join(' ');
        // console.log(sortBy);
        query = query.sort(sortBy)
        // console.log(query);
    }else{
        query = query.sort('-createdAt');
    }


    //Executing query
    const bootcamps = await query;
    res.status(200).json({
        success:true,
        data:bootcamps,
        count:bootcamps.length
    })
    

});



//@desc get single bootcamp
//@access public
// @route GET api/v1/bootcamps/:id

exports.getBootcamp = asyncHandler(async (req,res , next) => {


        const bootcamp = await Bootcamp.findById(req.params.id)
        if(!bootcamp){
            return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`,404));
        }
        res.status(200).json({
            success:true,
            data:bootcamp
        })
    
})



//@desc create new bootcamp
//@access private
// @route POST api/v1/bootcamps


exports.createBootcamp = asyncHandler(async (req,res , next) => {


    const bootcamp = await Bootcamp.create(req.body);

    res.status(201).json({
        success:true,
        data:bootcamp
    })


})




//@desc update single bootcamp 
//@access private
// @route PUT api/v1/bootcamps/:id

exports.updateBootcamp = asyncHandler( async (req,res , next) => {

    const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body,{
        new:true,
        runValidators:true
    })
    if(!bootcamp){
        return res.status(400).json({success:false})
    }
    res.status(200).json({success:true,data:bootcamp})


})





//@desc delete bootcamp 
//@access private
// @route DELETE api/v1/bootcamps/:id

exports.deleteBootcamp = asyncHandler( async (req,res , next) => {


    const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id)
    if(!bootcamp){
        return next(err);
    }
    res.status(200).json({success:true,data:{}})

})



//@desc Get bootcamps within a place
//@access private
// @route DELETE api/v1/bootcamps/radius/:zipcode/:distance

exports.getBootcampsInRadius = asyncHandler( async (req,res , next) => {

    const {zipcode,distance} = req.params;

    //Get lat&&lang from geocoder
    const loc = await geocoder.geocode(zipcode);
    const lat = loc[0].latitude;
    const lng = loc[0].longitude;

    //Calc radius using radians

    //Divide dist by radius of Earth


    const radius = distance / 3963;

    const bootcamps = await Bootcamp.find({
        location :{$geoWithin:{$centerSphere:[[lng,lat],radius]}}
    });
    if(!bootcamps){
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`,404));
    }
    res.status(200).json({
        success:true,
        count:bootcamps.length,
        data:bootcamps
    });
})


