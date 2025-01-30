import { Server } from "socket.io";
import dotenv from 'dotenv';
import Connection from "./database/db.js";
import { getDocument, updateDocument } from "./controllers/dbcontroller.js";



dotenv.config();
const dbName = process.env.DATABASE_NAME;
const dbPassword = process.env.DATABASE_PASSWORD;
const PORT = process.env.PORT || 9000;
Connection(dbName, dbPassword);

const io=new Server(PORT,{
    cors:{
        origin:'https://collabtext-frontend.onrender.com',
        methods:['GET','POST']
    }
    
})



io.on('connection',(socket)=>{
    socket.on('get-document', async documentId => {
        const document = await getDocument(documentId);
        socket.join(documentId);
        socket.emit('load-document', document.data);

        socket.on('send-changes', delta => {
            socket.broadcast.to(documentId).emit('receive-changes', delta);
        })

        socket.on('save-document', async data => {
            await updateDocument(documentId, data);
        })
    })
})

