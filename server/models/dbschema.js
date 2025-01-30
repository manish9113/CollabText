import mongoose from 'mongoose';


const docSchema=mongoose.Schema({
    _id:{
        type:String,
        required:true,
    },
    data:{
        type:Object,
        required:true,
    }

})

const doc=mongoose.model('doc',docSchema);
export default doc;
