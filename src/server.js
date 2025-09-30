import express from 'express'; import cors from 'cors';
const app=express(); app.use(cors()); const PORT=process.env.PORT||3000;
app.get('/api/health',(_,res)=>res.json({ok:true,service:'backend'}));
app.listen(PORT,()=>console.log('API running on :'+PORT));
