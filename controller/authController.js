import bcrypt from "bcryptjs";
import pool from "../utils/db.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import jwt from "jsonwebtoken";

const createLoginToken = async function (id) {
  const token = jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: "10d",
  });
  return token;
};

const signup = catchAsync(async (req, res, next) => {
  const { username, email, password } = req.body;

  try {
    const existingUserQuery = "SELECT * FROM users WHERE email = ?";
    pool.query(existingUserQuery, [email], async (err, results) => {
      if (err) {
        console.error("Error checking existing user:", err);
        return next(new AppError("Database query failed", 500));
      }

      if (results.length > 0) {
        return next(
          new AppError("Email already used, try with a different one", 400)
        );
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const insertQuery =
        "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
      pool.query(
        insertQuery,
        [username, email, hashedPassword],
        (err, insertResults) => {
          if (err) {
            console.error("Error inserting new user:", err);
            return next(
              new AppError(
                "There was an error while registering the user, please try again.",
                400
              )
            );
          }
          const userId = insertResults.insertId;
          const selectQuery =
            "SELECT id, username, email FROM users WHERE id = ?";
          pool.query(selectQuery, [userId], async (err, userResults) => {
            if (err) {
              console.error("Error retrieving user data:", err);
              return next(
                new AppError(
                  "There was an error while retrieving the user, please try again.",
                  400
                )
              );
            }

            const token = await createLoginToken(userId);
            res.status(200).json({
              status: "success",
              token,
              data: userResults[0], // The actual user data
            });
          });
        }
      );
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    next(new AppError("An unexpected error occurred", 500));
  }
});

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const selectQuery = "SELECT * FROM users WHERE email = ?";
  pool.query(selectQuery, [email], async (err, results) => {
    if (err) {
      console.error("Error checking existing user:", err);
      return next(new AppError("Database query failed", 500));
    }
    console.log(results);

    if (results.length > 0) {
      const user = results[0];
      if (await bcrypt.compare(password, user.password)) {
        const token = await createLoginToken(user.id);
        res.status(200).json({
          status: "success",
          token,
          data: results,
        });
      } else {
        return next(new AppError("Wrong password", 401));
      }
    } else {
      return next(new AppError("Email is not registered", 400));
    }
  });
});

const googleAuth = catchAsync(async (req, res, next) => {
  const { username, email, photo } = req.body;

  try {
    const findUserQuery =
      "SELECT id, username, email, photo, googleAuth FROM users WHERE email = ?";
    pool.query(findUserQuery, [email], async (err, results) => {
      if (err) {
        console.error("Error checking existing user:", err);
        return next(new AppError("Database query failed", 500));
      }

      let user = results.length > 0 ? results[0] : null;

      if (!user) {
        const insertQuery =
          "INSERT INTO users (username, email, photo, password, googleAuth) VALUES (?, ?, ?, ?, ?)";

        const charset =
          "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

        let password = ""; // Initialize the password variable
        for (let i = 0; i < 10; i++) {
          password += charset[Math.floor(Math.random() * charset.length)];
        }

        console.log("Generated password:", password);

        const hashedPassword = await bcrypt.hash(password, 12);

        pool.query(
          insertQuery,
          [username, email, photo, hashedPassword, 1],
          async (err, results) => {
            if (err) {
              console.error("Error inserting new user:", err);
              return next(new AppError("Database query failed", 500));
            }

            const userId = results.insertId;
            const token = await createLoginToken(userId);
            res.status(200).json({
              status: "success",
              token,
              data: {
                username,
                email,
                photo,
              },
            });
          }
        );
      } else if (user.googleAuth === 1) {
        console.log("already sign up user");
        console.log(user);
        const token = await createLoginToken(user.id);
        res.status(200).json({
          status: "success",
          token,
          data: user,
        });
      } else if (user.googleAuth === 0) {
        return next(
          new AppError("Email ID already registered, try with a new one", 400)
        );
      }
    });
  } catch (error) {
    console.error("Internal server error:", error);
    return next(new AppError("Internal server error", 500));
  }
});

const protect = catchAsync(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401)
    );
  }

  // Verify token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return next(new AppError("Invalid token", 401));
    }

    req.user = decoded;
    next();
  });
});

const profile = catchAsync(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401)
    );
  }

  // Verify token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return next(new AppError("Invalid token", 401));
    }

    req.user = decoded;
    const searchQuery =
      "SELECT id, username, email, photo, googleAuth FROM users WHERE id = ?";
    console.log(req.user.id);
    pool.query(searchQuery, [req.user.id], async (err, results) => {
      if (err) {
        console.error("Error checking existing user:", err);
        return next(new AppError("Database query failed", 500));
      }

      const user = results[0];
      console.log("Profile", user);
      res.status(200).json({
        status: "success",
        data: user,
      });
    });
  });
});

export default { signup, login, protect, googleAuth, profile };
