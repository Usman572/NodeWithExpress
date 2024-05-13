const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
// name, email, password, confirmpPassword, photo

const userScehma = new mongoose.Schema({
    name:{
        type: String,
        required : [true, 'Please enter your name.']
    },
    email:{
        type: String,
        required: [true, 'Please enter an eamil'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'please enter a valid email']
    },
    photo: String,
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'PLease enter your password'],
        minlength: 8,
        select: false
    },
    confirmPassword:{
        type: String,
        required: [true, 'please confirm your password'],
        validate : {
            //  this validator will only work for save() and create( )
            validator: function(val){
                return  val === this.password;
            },
            message: 'Password & Confirm Password does not match!'
        }

    },
    active:{
        type: Boolean,
        default: true,
        select: false
    },
    passwordChangedAt:Date,
    passwordResetToken: String,
    passwordResetTokenExpires: Date,
})
userScehma.pre('save', async function(next){
    if(!this.isModified('password')) return next();

    // encrypt the password before saving it
    this.password = await bcrypt.hash(this.password, 12);
    this.confirmPassword = undefined;
})
userScehma.methods.comparePasswordInDb = async function(pswd, pswdDB){
    return await bcrypt.compare(pswd, pswdDB)
}
userScehma.methods.isPasswordChanged = (JWTTimestamp) => {
    if(this.passwordChangedAt){
        const passwordChangedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        console.log(this.passwordChangedAt, JWTTimestamp);
        return JWTTimestamp < passwordChangedTimestamp; // 16839781112 < 1684022408
    }
    return false;
}
userScehma.methods.createResetPasswordToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000;
    console.log(resetToken, this.passwordResetToken);
    return resetToken; 
}
const User = mongoose.model('User', userScehma);
module.exports = User;