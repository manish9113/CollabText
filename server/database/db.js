import mongoose from "mongoose";



const Connection = async (USERNAME, PASSWORD) => {
    const URL = `mongodb+srv://${USERNAME}:${PASSWORD}@manishcluster.l7yaaki.mongodb.net/?retryWrites=true&w=majority&appName=manishcluster`
    try {
        await mongoose.connect(URL);
        console.log("database connected successfully")
    } catch (error) {
        console.log("error connecting database", error.message)
    }
}

export default Connection