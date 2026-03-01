import pg from '@/database/db.js';
import passport from 'passport';
import local from 'passport-local';
import session from 'express-session';
import * as crypto from 'node:crypto';
import connect_pg from 'connect-pg-simple';
import User from '@/api/user/user.js';
import Employee from '@/api/employee/employee.js';


const pgSession = connect_pg(session);
const connectionString = "postgres://" +
                            process.env.DB_USER + ":" +
                            process.env.DB_PASSWORD + "@" +
                            process.env.DB_HOST + ":" +
                            process.env.DB_PORT + "/" + 
                            process.env.DB_NAME


function verify(row: any, password: string, cb: any) {
    try {
        if(!row) return cb(null, false, {message: "Incorrect username or password"});
        crypto.pbkdf2(password, row.salt, 310000, 32, 'sha256', (err, hashed) => {
            if (err) return cb(err);
            if (!crypto.timingSafeEqual(Buffer.alloc(32, row.hash), hashed)) {
                return cb(null, false, {message: "Incorrect username or password"});
            }
            return cb(null, row);
        })
    }
    catch (err) {
        cb(err)
    };
}

passport.use("user-login", new local.Strategy(async (username , password , cb) => {
    const row = await pg.oneOrNone("SELECT id, username, hash, salt, 'user' as type FROM users WHERE username = $1", [username]);
    verify(row, password, cb);
}));

passport.use("employee-login", new local.Strategy(async (username , password , cb) => {
    const row = await pg.oneOrNone("SELECT id, username, hash, salt, 'employee' as type FROM employees WHERE username = $1", [username]);
    verify(row, password, cb);
}))

export function initializeUserSession() {
    return session({
        name: "user.sid",
        secret: process.env.SESSION_KEY || "st@yI-IubBNVTHVADu~ng",
        resave: false,
        saveUninitialized: false,
        store: new pgSession({
            conString: connectionString,
            tableName: 'user_session'
        }),
        cookie: {
            secure: false,
            httpOnly: false,
            maxAge: 24 * 60 * 60 * 1000
        }
    });
}

export function initializeEmployeeSession() {
    return session({
        name: "employee.sid",
        secret: process.env.SESSION_KEY || "st@yI-IubBNVTHVADu~ng",
        resave: false,
        saveUninitialized: false,
        store: new pgSession({
            conString: connectionString,
            tableName: 'employee_session'
        }),
        cookie: {
            secure: false,
            httpOnly: false,
            maxAge: 24 * 60 * 60 * 1000
        }
    });
}

passport.serializeUser((user: any, cb) => {
    process.nextTick(() => cb(null, {
        username: user.username,
        type: user.type
    }));
})

passport.deserializeUser(async (obj: any, cb) => {
    try {
        console.log(obj);
        if (obj.type == "user") {
            const row = await pg.oneOrNone("SELECT * FROM users WHERE username=$1", [obj.username]);
            return cb(null, row ? new User(row): false);
        } else {
            const row = await pg.oneOrNone("SELECT * FROM get_user_auth_context($1);", [obj.username]);
            return cb(null, row ? new Employee(row) : false);
        }
    } catch (err) {
        cb(err);
    }
})

export { passport };

