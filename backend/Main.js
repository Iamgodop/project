const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bc = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = new sqlite3.Database('Sponza.db');
const crypto = require('crypto');
const cors = require('cors')
const helment = require('helmet');

const JWT_SECRET = "Sumit loves BolB";
const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());
const port = 2007

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]

if (!token) {
    return res.status(401).json({'message': 'Access Denied!'});
  }
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({'message': 'Invalid or expired token!'});
    }
    req.user = user;
    next();
  });
};

const getRow = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
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

app.post('/Organization/Login', async (req, res) => {
  try {
    const {email, password } = req.body;
    const sql = "SELECT * FROM User WHERE Email = ? AND UType = 'ORG'";

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
          {email: row.Email, Id: row.ID},
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
    const {email, password } = req.body;
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
          {email: row.Email, Id: row.ID},
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
  const ID = crypto.randomUUID();
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
      const r2 = await runQuery("INSERT INTO User(ID, Email, Password, Username, UType) VALUES(?, ?, ?, ?, 'ORG')", [ID, email, password, username]);
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

app.put('/Update/Sponsor', authenticateToken,async (req, res) => {
  // const {Name, About,}
});

app.put('/Update/Organization', authenticateToken,async (req, res) => {
});

app.get('/getDetails/Organization', authenticateToken,async (req, res) => {
  const sql = 'SELECt * FROM Organization, User WHERE User.ID = ? AND User.ID = Organization.ID';
  try {
    const row = await getRow(sql, [req.params.id]);
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

app.get('/getDetails/Sponsor', authenticateToken,async (req, res) => {
  const sql = 'SELECt * FROM Sponsor, User WHERE User.ID = ? AND User.ID = Sponsor.ID';
  try {
    const row = await getRow(sql, [req.user.id]);
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
