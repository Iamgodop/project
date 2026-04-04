const express = require('express'); // Express.js for backend ==> Node.js 
// Express.js is an extension of Node.js 
const sqlite3 = require('sqlite3').verbose(); // Sqlite3 for database
const bc = require('bcrypt'); // Hashing for passwords
const jwt = require('jsonwebtoken'); // JWT for tokens and sessions

const db = new sqlite3.Database('Sponza.db'); // Create a database instance

const crypto = require('crypto'); // Random ID generation
const cors = require('cors'); // This is CORS
const helmet = require('helmet'); // Wrote this for sake of documentation

const JWT_SECRET = "Sumit loves BolB"; // This is the key for JWT token generation

const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());
const port = 2007;

const authenticateToken = (req, res, next) => { // Middleware for authentication
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({'message': 'Access Denied!'});
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({'message': 'Invalid or expired token!'});
    }
    req.user = user; // => { email, ID }
    next();
  });
};

const getRow = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err); // throw new Error(err)
      } else {
        resolve(row); // return row 
      }
    });
  });
};

const runQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(true);
      }
    });
  });
};

const getAllRows = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

app.post('/Organization/Login', async (req, res) => { // localhost:2007/Organization/Login
  try {
    const { email, password } = req.body; => // { email: bhaskae@gmail.com, password: Bhaskar}
    const sql = "SELECT * FROM User WHERE Email = ? AND UType = 'ORG'";

    const row = await getRow(sql, [email]); // => { ID: afjhwib-78uw-y8v, Email: email, Password: 87t87r598yt75ebg, UType: ORG }

    if (!row) { // => {} => null 
      res.status(404).json({message: 'User Not Found!'});
    } else {
      const match = await bc.compare(password, row.Password);  // bhaskar -> hashing -> hashed string -> compare with existing hashed string

      if (!match) {
        res.status(401).json({message: 'Invalid Creds!'}); // 401: Unauthorized 
        return;
      } else {
        const token = jwt.sign( // creates a new jwt token "this is bhaskar"
          {email: row.Email, id: row.ID},  // header(validity) payload(data/{email, id}) sign
          JWT_SECRET,
          {expiresIn: '30d'},
        );
        res.status(200).json({message: 'Success!', token});
      }
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({message: 'Internal Failure!', err});
  }
});

app.post('/Sponsor/Login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const sql = "SELECT * FROM User WHERE Email = ? AND UType = 'SPNSR'";

    const row = await getRow(sql, [email]);
    
    if (!row) {
      res.status(404).json({message: 'User Not Found!'});
    } else {
      const match = await bc.compare(password, row.Password);

      if (!match) {
        res.status(401).json({message: 'Invalid Creds!'});
        return;
      } else {
        const token = jwt.sign(
          {email: row.Email, id: row.ID},
          JWT_SECRET,
          {expiresIn: '30d'},
        );
        res.status(200).json({message: 'Success!', token});
      }
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({message: 'Internal Failure!', err});
  }
});

app.post('/Sponsor/Register', async (req, res) => {
  const {email, password, username } = req.body;
  const ID = crypto.randomUUID(); // generate an ID for ID column
  try {
    const r = await runQuery('INSERT INTO Sponsor(ID) VALUES(?)', [ID]);
    if (r) {
      const hashedPassword = await bc.hash(password, 10);
      const r2 = await runQuery("INSERT INTO User(ID, Email, Password, Username, UType) VALUES(?, ?, ?, ?, 'SPNSR')", [ID, email, hashedPassword, username]);
      if (r2) {
        res.status(200).json({message: 'Success!'});
      } else {
        throw new Error('Something Went Wrong!');
      }
    } else {
      throw new Error('Something Went Wrong!');
    }
  } catch (err) {
    res.status(500).json({message: 'Internal Failure!'}, err);
  }
});

app.post('/Organization/Register', async (req, res) => {
  const {email, password, username } = req.body;
  const ID = crypto.randomUUID();
  try {
    const r = await runQuery('INSERT INTO Organization(ID) VALUES(?)', [ID]);
    if (r) {
      const hashedPassword = await bc.hash(password, 10);
      const r2 = await runQuery("INSERT INTO User(ID, Email, Password, Username, UType) VALUES(?, ?, ?, ?, 'ORG')", [ID, email, hashedPassword, username]);
      if (r2) {
        res.status(200).json({message: 'Success!'});
      } else {
        throw new Error('Something Went Wrong!');
      }
    } else {
      throw new Error('Something Went Wrong!');
    }
  } catch (err) {
    res.status(500).json({message: 'Internal Failure!'}, err);
  }
});

app.put('/Update/Sponsor/Profile', authenticateToken, async (req, res) => { // localhost:2007/Update/Sponsor/Profile 
  const { fullName, email, phone, whatsapp, designation, officialEmail } = req.body;
  const sql = 'UPDATE Sponsor SET FullName = ?, Email = ?, Phone = ?, Whatsapp = ?, Designation = ?, OfficialEmail = ? WHERE ID = ?';
  // [ ID, null, null, null,... ] -> [ ID, bhaskar@gmail, Bhaskar Subhash, 8019829068, 8019829068,... ]
  try {
    const status = await runQuery(sql, [fullName, email, phone, whatsapp, designation, officialEmail, req.user.id]);
    if (status) res.status(200).json({message: 'Success'});
    else res.status(404).json({message: 'User Not Found!'});
  } catch (err) {
    console.log(err);
    res.status(500).json({message: 'Internal Failure!', err});
  }
});

app.put('/Update/Organization/Profile', authenticateToken, async (req, res) => {
  const { contactPersonName, email, phone, designation } = req.body;
  const sql = 'UPDATE Organization SET ContactName = ?, Email = ?, Phone = ?,Designation = ? WHERE ID = ?';
  try {
    const status = await runQuery(sql, [contactPersonName, email, phone, designation, req.user.id]);
    if (status) res.status(200).json({message: 'Success'});
    else res.status(404).json({message: 'User Not Found!'});
  } catch (err) {
    console.log(err);
    res.status(500).json({message: 'Internal Failure!', err});
  }
});

app.put('/Update/Sponsor/Company', authenticateToken, async (req, res) => {
  const { companyLogo, companyName, industry, companyType, estd, website, description, targetAudience, history, instagram, twitter, linkedin, facebook,
  GSTNumber, RBA } = req.body;
  try {
    const row = await getRow('SELECT companyID FROM Sponsor WHERE ID = ?', [req.user.id]);
    if (!row) throw new Error();
    const query = `UPDATE Company SET companyLogo = ?, companyName = ?, industry = ?, companyType = ?, estd = ?, website = ?, description = ?, targetAudience = ?, history = ?, instagram = ?, twitter = ?, linkedin = ?, facebook = ?, GSTNumber = ?, RBA=? WHERE ID = ?`;
    const status = await runQuery(query, [companyLogo, companyName, industry, companyType, estd, website, description, targetAudience, history, instagram, twitter, linkedin, facebook, GSTNumber, RBA, row.companyID]);
    if (status) res.status(200).json({message: 'Success!'});
    else throw new Error();
  } catch (err) {
    res.status(500).json({message: 'Internal Failure!', err});
  }
});

app.get('/getDetails/Organization', authenticateToken, async (req, res) => {
  const sql = 'SELECT * FROM Organization, User WHERE User.ID = ? AND User.ID = Organization.ID';
  try {
    var row = await getRow(sql, [req.user.id]);
    if (!row) {
      res.status(404).json({message: 'User Not Found!'});
    } else {
      delete row.Password;
      res.status(200).json(row);
    }
  } catch (err) {
    res.status(500).json({message: 'Internal Failure!'});
  }
});

app.get('/getDetails/Sponsor', authenticateToken, async (req, res) => {
  const sql = 'SELECT * FROM Sponsor, User WHERE User.ID = ? AND User.ID = Sponsor.ID';
  try {
    var row = await getRow(sql, [req.user.id]);
    if (!row) {
      res.status(404).json({message: 'User Not Found!'});
    } else {
      delete row.Password;
      res.status(200).json(row);
    }
  } catch (err) {
    res.status(500).json({message: 'Internal Failure!'});
  }
});

app.put('/Update/Password/Organization', authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const sql = "SELECT Password from User WHERE ID = ? AND UType = 'ORG'";
  try {
    const row = await getRow(sql, [req.user.id]);
    if (!row) {
      res.status(404).json({message: 'User Not Found!'});
    } else {
      const match = await bc.compare(currentPassword, row.Password);
      if (!match) {
        res.status(401).json({message: 'Wrong Password!🙄'});
      } else {
        const query = "UPDATE User SET Password = ? WHERE ID = ? AND UType = 'ORG'";
        const hashedPassword = await bc.hash(newPassword, 10);
        const r = await runQuery(query, [hashedPassword, req.user.id]);
        if (!r) {
          throw new Error('Something Went Wrong');
        } else {
          res.status(200).json({message: 'Success'});
        }
      }
    }
  } catch (err) {
    res.status(500).json({message: 'Internal Failure!', err});
  }
});

app.put('/Update/Password/Sponsor', authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const sql = "SELECT Password from User WHERE ID = ? AND UType = 'SPNSR'";
  try {
    const row = await getRow(sql, [req.user.id]);
    if (!row) {
      res.status(404).json({message: 'User Not Found!'});
    } else {
      const match = await bc.compare(currentPassword, row.Password);
      if (!match) {
        res.status(401).json({message: 'Wrong Password!🙄'});
      } else {
        const query = "UPDATE User SET Password = ? WHERE ID = ? AND UType = 'SPNSR'";
        const hashedPassword = await bc.hash(newPassword, 10);
        const r = await runQuery(query, [hashedPassword, req.user.id]);
        if (!r) {
          throw new Error('Something Went Wrong');
        } else {
          res.status(200).json({message: 'Success'});
        }
      }
    }
  } catch (err) {
    res.status(500).json({message: 'Internal Failure!', err});
  }
});

app.post('/Event/Create', authenticateToken, async (req, res) => {
  const { title, description, category, expectedAttendees, startDate, endDate, eventTime, venue, duration, registrationFee, estimatedRevenue, website, collegeName, affUni, collegeType, collegeWebsite, city, state, organizerName, designation, organizerEmail, organizerPhone, organizerWhatsapp, totalBudget, benefits, history, instagram, twitter, facebook, linkedin } = req.body;
  try {
    const ID = crypto.randomUUID();
    const query = `INSERT INTO Events (ID, title, description, category, expectedAttendees, startDate, endDate, eventTime, venue, duration, registrationFee, estimatedRevenue, website, collegeName, affUni, collegeType, collegeWebsite, city, state, organizerName, designation, organizerEmail, organizerPhone, organizerWhatsapp, totalBudget, benefits, history, instagram, twitter, facebook, linkedin, createdBy) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`; 
    const status = await runQuery(query, [ID, title, description, category, expectedAttendees, startDate, endDate, eventTime, venue, duration, registrationFee, estimatedRevenue, website, collegeName, affUni, collegeType, collegeWebsite, city, state, organizerName, designation, organizerEmail, organizerPhone, organizerWhatsapp, totalBudget, benefits, history, instagram, twitter, facebook, linkedin, req.user.id]);
    if (status) res.status(200).json({message: 'Success!'});
    else throw new Error();
  } catch (err) {
    res.status(500).json({message: 'Internal Failure!'});
  }
});

app.get('/Event/GetDetails/:id', authenticateToken, async (req, res) => { // localhost:2007/Event/GetDetails/gd88gew-37-8383vge
  try {
    const id = req.params.id;
    const sql = 'SELECT * FROM Events WHERE ID = ?';
    const row = await getRow(sql, [id]);
    if (row) res.status(200).json({message: 'Success!', row});
    else res.status(404).json({message: 'Event Not Found!'});
  } catch (err) {
    res.status(500).json({message: 'Internal Failure!'});
  }
});

app.get('/Event/GetEvents', authenticateToken, async (req, res) => {
  try {
    const sql = 'SELECT * FROM Events WHERE createdBy = ?';
    const rows = await getAllRows(sql, [req.user.id]);
    res.status(200).json({message: "Success!", rows});
  } catch (err) {
    res.status(500).json({message: 'Internal Failure!'});
  }
});

app.get('/Event/getAllEvents', authenticateToken, async (req, res) => {
  try {
    const sql = 'SELECT * FROM Events';
    const rows = await getAllRows(sql);
    res.status(200).json({message: 'Success!', rows});
  } catch (err) {
    res.status(500).json({message: 'Internal Failure!'});
  }
});

app.get('/Admin/Login', (req, res) => {
  try {
    const sql = "SELECT * FROM User WHERE Email = ? AND UType = 'ADMIN' AND Password = ?";
    const { email, password } = req.body;
    const row = getRow(sql, [email, password]);
    if (!row) {
      res.status(401).json({message: 'Invalid Creds!'});
    } else {
      const token = jwt.sign(
        { email, id: row.ID },
        JWT_SECRET,
        { expiresIn: '30d' }
      );
      res.status(200).json({message: 'Success!', token});
    }
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
