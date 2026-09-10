const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const db = new sqlite3.Database(path.join(__dirname, "rb_self_drive.db"));

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS cars(
    id TEXT PRIMARY KEY, name TEXT NOT NULL, type TEXT, price INTEGER,
    active INTEGER DEFAULT 1
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS bookings(
    id INTEGER PRIMARY KEY AUTOINCREMENT, car_id TEXT NOT NULL,
    name TEXT NOT NULL, phone TEXT NOT NULL, from_date TEXT NOT NULL,
    to_date TEXT NOT NULL, note TEXT, status TEXT DEFAULT 'confirmed',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS reviews(
    id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL,
    city TEXT, text TEXT NOT NULL
  )`);

  const cars = [
    ["thar","Mahindra Thar","SUV",2499],
    ["scorpio","Mahindra Scorpio","SUV",2999],
    ["baleno","Maruti Baleno","Hatchback",1499],
    ["dzire","Maruti Dzire","Sedan",1599],
    ["swift","Maruti Swift","Hatchback",1399],
    ["exter","Hyundai Exter","SUV",1699]
  ];
  const s = db.prepare("INSERT OR IGNORE INTO cars(id,name,type,price) VALUES(?,?,?,?)");
  cars.forEach(c => s.run(c));
  s.finalize();

  db.get("SELECT COUNT(*) AS n FROM reviews",(err,row)=>{
    if(err || row.n) return;
    const r = db.prepare("INSERT INTO reviews(name,city,text) VALUES(?,?,?)");
    [
      ["Rahul","Porbandar","Smooth booking and a great car."],
      ["Amit","Rajkot","Clean car and excellent support."],
      ["Jay","Jamnagar","Excellent experience."]
    ].forEach(x=>r.run(x));
    r.finalize();
  });
});

app.get("/api/cars",(req,res)=>{
  db.all("SELECT * FROM cars WHERE active=1 ORDER BY name",(err,rows)=>{
    if(err) return res.status(500).json({error:err.message});
    res.json(rows);
  });
});

app.get("/api/reviews",(req,res)=>{
  db.all("SELECT * FROM reviews ORDER BY id DESC",(err,rows)=>{
    if(err) return res.status(500).json({error:err.message});
    res.json(rows);
  });
});

app.get("/api/availability",(req,res)=>{
  const {from,to}=req.query;
  if(!from || !to) return res.status(400).json({error:"Dates required"});
  const sql=`SELECT c.id,c.name,
    NOT EXISTS(
      SELECT 1 FROM bookings b
      WHERE b.car_id=c.id AND b.status='confirmed'
      AND b.from_date<=? AND b.to_date>=?
    ) AS available
    FROM cars c WHERE c.active=1 ORDER BY c.name`;
  db.all(sql,[to,from],(err,rows)=>{
    if(err) return res.status(500).json({error:err.message});
    res.json(rows.map(x=>({...x,available:Boolean(x.available)})));
  });
});

app.post("/api/bookings",(req,res)=>{
  const {carId,name,phone,from,to,note=""}=req.body;
  if(!carId || !name || !phone || !from || !to)
    return res.status(400).json({success:false,message:"Please fill all required fields."});
  if(from>to)
    return res.status(400).json({success:false,message:"Return date must be after pickup date."});

  const check=`SELECT id FROM bookings
    WHERE car_id=? AND status='confirmed'
    AND from_date<=? AND to_date>=? LIMIT 1`;
  db.get(check,[carId,to,from],(err,row)=>{
    if(err) return res.status(500).json({success:false,message:err.message});
    if(row) return res.json({success:false,message:"This car is already booked for those dates."});

    const insert=`INSERT INTO bookings
      (car_id,name,phone,from_date,to_date,note)
      VALUES(?,?,?,?,?,?)`;
    db.run(insert,[carId,name,phone,from,to,note],function(err2){
      if(err2) return res.status(500).json({success:false,message:err2.message});
      res.json({success:true,bookingId:this.lastID,message:`Booking #${this.lastID} confirmed and saved.`});
    });
  });
});

// Express 5 compatible fallback
app.use((req,res)=>{
  res.sendFile(path.join(__dirname,"public","index.html"));
});

app.listen(PORT,()=>console.log(`RB SELF DRIVE running on http://localhost:${PORT}`));
