import doc from "../models/dbschema.js";

export const updateDocument=async(id,data)=>{
    return await doc.findByIdAndUpdate(id,{data});
}

export const getDocument=async(id)=>{
    if(id==null) return;
    const document = await doc.findById(id);
    if (document) return document;
    return await doc.create({ _id: id, data: "" })
}

