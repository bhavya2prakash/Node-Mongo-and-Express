const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
app.use(express.json());

//Mongodb connection
mongoose.connect('mongodb+srv://bhavya:bhavya1234@cluster0.kde993z.mongodb.net/?retryWrites=true&w=majority', { 
    useNewUrlParser: true,
    useUnifiedTopology:true
},(err)=>{
    if(!err){
        console.log('connected to db');
    }
    else{
        console.log(' not connected to db');
    }
    
});

//Schema
const schema ={
    name:{
        type:String,
        trim:true,
        required:[true,'Name is required'],
        match:[/^[a-zA-Z\s]{1,}$/,'Please enter a valid Name']
    },
    email:{
        type:String,
        trim:true,
        required:[true,'Email Id is required'],
        unique:[true],
        match:[/^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/,'Please enter a valid Email Id']
    },
    password:{
        type:String,
        // trim:true,
        // required:[true,' Password is required'],
        // match:[/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,'Password must contain minimum eight characters, at least one letter, one number and one special character']
    }
}


const monmodel = mongoose.model('Users',schema);

//Create Route
app.post('/user/create',async(req,res)=>{
  console.log("inside post function");
  if(!validatePassword(req.body.password)){
    res.status(500).json({message: "Password must contain minimum eight characters, at least one letter, one number and one special character"});
    return;
  }
  const hashedPassword = bcrypt.hashSync(req.body.password,10);
  const data = new monmodel({
    name:req.body.name,
    email:req.body.email,
    password:hashedPassword
  });
  
  data.save((err, monmodel) => {
    if (err) {  
      res.status(500).json({message: (err.name=="MongoServerError")? 'This Email Id already exists' : err.message});
      return;
    } 
    else {  
    res.status(200).send({message: "New user successfully created" })
    }
  });
//   const val = await data.save();
//   res.send("New user successfully created");
}
);

//Get all route
app.get('/user/getAll',(req,res)=>{
  monmodel.find((err,val)=>{
       if(err){
        res.send(err);
        return;
       }
       else{
        res.json(val);
       }
  });
});

//Update Route
app.put('/user/edit',async(req,res)=>{
    let updateEmail = req.body.email;
    let updateName = req.body.name;
    if(!validatePassword(req.body.password)){
        res.status(500).json({message: "Password must contain minimum eight characters, at least one letter, one number and one special character"});
        return;
    }
    const hashedPassword = await bcrypt.hash(req.body.password,10);
    let updatePassword = hashedPassword;
    monmodel.findOneAndUpdate({email:updateEmail},{$set:{name:updateName,password:updatePassword}},{new:true},(err,data)=>
    {
        if(err){
            res.send(err);
            return;
        }
        else{
            
            if(data==null){
                res.send({ message: "No user with this email id exists"});
            }
            
            else{
                data.save((err, monmodel) => {
                    if (err) {
  
                      res.status(500).send({message: err.message});
                      return;
                    } 
                    else res.status(200).send({ message: "User successfully updated"})
                  });

            }
        }
    })
});

// Delete Route
app.delete('/user/delete/',function (req,res){
  let deleteEmail=req.body.email;
  monmodel.findOneAndDelete(({email:deleteEmail}),function(err,data){
    if(err){
        res.send({ message:"An error occured. Please enter a valid emailid"});
    }
    else{
        if(data==null){
            res.send({ message: "No user with this email id exists"});
        }
        else{
            res.send({ message: "User successfully deleted"});
        }
    }  
  });

});




//Port
app.listen(3000,()=>{
    console.log('on port 3000');
})

//validation
function validatePassword(password) {
    let regex =  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
	
	 if (!regex.test(password)) {
    
	return false;
    
    }   
	
    else {
	
    return true;
	}
}
