import pg from '@/database/db.js';
import passport from 'passport';
import local from 'passport-local';
import session from 'express-session';
import * as crypto from 'node:crypto';
import connect_pg from 'connect-pg-simple';
import User from '@/api/user/user.js';


const pgSession = connect_pg(session);
const connectionString = "postgres://" +
                            process.env.DB_USER + ":" +
                            process.env.DB_PASSWORD + "@" +
                            process.env.DB_HOST + ":" +
                            process.env.DB_PORT + "/" + 
                            process.env.DB_NAME

passport.use(new local.Strategy(function verifyPassword(username, password, cb) {
    pg.oneOrNone('SELECT * FROM users WHERE username = $1', [username])
    .then(row => {
        if(!row) return cb(null, false, {message: "Incorrect username or password"});
        const user = new User(row);
        crypto.pbkdf2(password, user.salt, 310000, 32, 'sha256', (err, hashed) => {
            if (err) return cb(err);
            if (!crypto.timingSafeEqual((new TextEncoder()).encode(user.hash), hashed)) {
                return cb(null, false, {message: "Incorrect username or password"});
            }
            return cb(null, user);
        })
    })
    .catch((err) => cb(err));
}))

export function initializeSession() {
    return session({
        secret: process.env.SESSION_KEY || "st@yI-IubBNVTHVADu~ng",
        resave: false,
        saveUninitialized: false,
        store: new pgSession({
            conString: connectionString,
            tableName: 'session'
        })
    });
}

passport.serializeUser((user: any, cb) => {
    process.nextTick(() => cb(null, {id: user.id, username: user.username}));
})

passport.deserializeUser((user: any, cb) => {
    process.nextTick(() => cb(null, user));
})

export { passport };

